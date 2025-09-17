import React, { useEffect, useState } from "react";

interface Course {
  id: number;
  title: string;
  description?: string;
  // Add more fields as needed
}

interface Session {
  id: number;
  professorId: number;
  title: string;
  description?: string;
  isActive: boolean;
}

interface Slot {
  id: number;
  sessionId: number;
  date: string;
  time: string;
  available: boolean;
}

const StudentCourseView: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const jwt = localStorage.getItem("token");
        // Fetch course info
        const courseRes = await fetch(`http://localhost:3000/courses/${courseId}`);
        if (!courseRes.ok) throw new Error("Failed to fetch course info");
        const courseData = await courseRes.json();
        setCourse(courseData);
        // Fetch available slots
        const sessions = await fetch(`http://localhost:3000/courses/${courseId}/sessions`, {
          headers: { Authorization: jwt ? `Bearer ${jwt}` : "" },
        });
        if (!sessions.ok) throw new Error("Failed to fetch sessions");
        const sessionsData = await sessions.json();
        setSessions(sessionsData);
      } catch (err: any) {
        setError(err.message || "Error loading course");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {course && (
        <>
          <h1 className="text-2xl font-bold text-purple-700 mb-2">{course.title}</h1>
          <p className="mb-6 text-gray-700">{course.description}</p>
        </>
      )}
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Clases disponibles</h2>
      <ul>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <li key={session.id} className="mb-4 p-4 bg-gray-700 rounded shadow flex justify-between items-center">
              <span>
                <span className="font-bold">{session.title}</span>
                <span className="text-gray-500"> - {session.description}</span>
              </span>
              <span className={session.isActive ? "text-green-600" : "text-red-500"}>
                {session.isActive ? "Active" : "Inactive"}
              </span>
            </li>
          ))
        ) : (
          !loading && <li className="text-gray-500">No se encontraron clases.</li>
        )}
      </ul>
    </div>
  );
};

export default StudentCourseView;
