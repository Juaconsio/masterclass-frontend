import React, { useState, useEffect } from "react";

function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseProfessor, setNewCourseProfessor] = useState("");
  // Remove selectedCourseId, navigation will be used instead

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
            <li key={course.id} className="mb-2 p-3 bg-purple-50 rounded shadow-sm flex justify-between items-center">
              <span className="font-bold text-purple-800">{course.title}</span>
              <a
                href={`/backoffice/course/${course.id}`}
                className="ml-4 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Manage Sessions
              </a>
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
  {/* Session management moved to dedicated course page */}
    </div>
  );
}
// Sessions component for managing sessions in a course
function Sessions({ courseId }: { courseId: number }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    objectives: "",
    orderIndex: 1,
    basePrice: 0,
  });

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://masterclass-backend-gcne.onrender.com/course/${courseId}/sessions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setSessions(data);
      } catch (err: any) {
        setError(err.message || "Error fetching sessions");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadSessions();
  }, [courseId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        `https://masterclass-backend-gcne.onrender.com/course/${courseId}/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      setSessions((prev) => [...prev, data]);
      setForm({ title: "", description: "", objectives: "", orderIndex: 1, basePrice: 0 });
    } catch (err: any) {
      setError(err.message || "Error creating session");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        `https://masterclass-backend-gcne.onrender.com/course/${courseId}/sessions/${selectedSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to update session");
      const data = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setSelectedSession(null);
      setForm({ title: "", description: "", objectives: "", orderIndex: 1, basePrice: 0 });
    } catch (err: any) {
      setError(err.message || "Error updating session");
    }
  }

  async function handleDelete(sessionId: number) {
    setError("");
    try {
      const res = await fetch(
        `https://masterclass-backend-gcne.onrender.com/course/${courseId}/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete session");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: any) {
      setError(err.message || "Error deleting session");
    }
  }

  function selectSession(session: any) {
    setSelectedSession(session);
    setForm({
      title: session.title,
      description: session.description,
      objectives: session.objectives,
      orderIndex: session.orderIndex,
      basePrice: session.basePrice,
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Sessions</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="mb-6">
        {sessions.map((session) => (
          <li key={session.id} className="mb-2 p-3 bg-blue-50 rounded shadow-sm flex justify-between items-center">
            <span>
              <span className="font-bold text-blue-800">{session.title}</span>
              <span className="ml-2 text-gray-600">({session.orderIndex})</span>
            </span>
            <span>
              <button
                className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded"
                onClick={() => selectSession(session)}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete(session.id)}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold text-purple-700 mb-2">
        {selectedSession ? "Edit Session" : "Create Session"}
      </h2>
      <form onSubmit={selectedSession ? handleUpdate : handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
          <textarea
            value={form.objectives}
            onChange={(e) => setForm({ ...form, objectives: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
          <input
            type="number"
            value={form.orderIndex}
            onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
          <input
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {selectedSession ? "Update Session" : "Create Session"}
        </button>
        {selectedSession && (
          <button
            type="button"
            className="w-full py-2 px-4 mt-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            onClick={() => {
              setSelectedSession(null);
              setForm({ title: "", description: "", objectives: "", orderIndex: 1, basePrice: 0 });
            }}
          >
            Cancel
          </button>
        )}
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