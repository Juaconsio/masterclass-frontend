import React, { useState, useEffect } from "react";

function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseProfessor, setNewCourseProfessor] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch(
          "https://masterclass-backend-gcne.onrender.com/course",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "Error fetching courses");
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        "https://masterclass-backend-gcne.onrender.com/course",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
          },
          body: JSON.stringify({
            title: newCourseTitle,
            description: newCourseDescription,
            professorId: parseInt(newCourseProfessor),
            isActive: true,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create course");
      const data = await res.json();
      setCourses((prev) => [...prev, data]);
      setNewCourseTitle("");
      setNewCourseDescription("");
    } catch (err: any) {
      setError(err.message || "Error creating course");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Courses</h2>
      <ul className="mb-6">
        {loading && <li className="text-gray-500">Loading...</li>}
        {error && <li className="text-red-500">{error}</li>}
        {!loading &&
          !error &&
          courses.map((course) => (
            <li key={course.id} className="mb-2 p-3 bg-purple-50 rounded shadow-sm">
              <span className="font-bold text-purple-800">{course.title}</span>
            </li>
          ))}
      </ul>
      <h2 className="text-lg font-semibold text-purple-700 mb-2">Create Course</h2>
      <form onSubmit={handleCreateCourse} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={newCourseDescription}
            onChange={(e) => setNewCourseDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professor ID</label>
          <input
            type="text"
            value={newCourseProfessor}
            onChange={(e) => setNewCourseProfessor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Create Course</button>
      </form>
    </div>
  );
}

export default function Backoffice() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        "https://masterclass-backend-gcne.onrender.com/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password }),
        }
      );
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      if (data.token) {
        document.cookie = `admin_jwt=${data.token}; path=/; secure; samesite=strict`;
        setIsLoggedIn(true);
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login error");
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">Backoffice</h1>
        <p className="mb-6 text-gray-600">Welcome to the backoffice page.</p>
        <div className="mb-4 text-green-700 font-semibold">Logged in as {username}</div>
        <Courses />
      </div>
    </div>
  );
}