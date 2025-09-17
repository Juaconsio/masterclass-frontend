import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface Course {
  id: number;
  title: string;
}

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
      async function fetchCourses() {
        setLoading(true);
        setError("");
        try {
          // Get token from localStorage and student_id from cookies
          const jwt = localStorage.getItem('token');
          // decode jwt to get id
          let studentId = null;
          if (jwt) {
            const decoded: any = jwtDecode(jwt);
            studentId = decoded.id;
          }
          const res = await fetch(`http://localhost:3000/courses${studentId ? `?studentId=${studentId}` : ''}`, {
            headers: {
              Authorization: jwt ? `Bearer ${jwt}` : '',
            },
          });
          if (!res.ok) throw new Error("Failed to fetch courses");
          const data = await res.json();
          setCourses(data);
        } catch (err: any) {
          setError(err.message || "Error fetching courses");
        } finally {
          setLoading(false);
        }
      }
      fetchCourses();
    }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 rounded shadow">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">My Courses</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id} className="mb-4 p-4 bg-purple-50 rounded shadow flex items-center justify-between">
              <span className="font-bold text-purple-800">{course.title}</span>
              <a
                href={`/dashboard/course/${course.id}`}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View
              </a>
            </li>
          ))
        ) : (
          !loading && <li className="text-gray-500">No courses found.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
