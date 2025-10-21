import React, { useEffect, useState } from 'react';

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
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.PUBLIC_BACKEND_API_URL;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const jwt = localStorage.getItem('token');
        // Fetch course info
        const courseRes = await fetch(`${apiUrl}/courses/${courseId}`);
        if (!courseRes.ok) throw new Error('Failed to fetch course info');
        const courseData = await courseRes.json();
        setCourse(courseData);
        // Fetch available slots
        const sessions = await fetch(`${apiUrl}/courses/${courseId}/sessions`, {
          headers: { Authorization: jwt ? `Bearer ${jwt}` : '' },
        });
        if (!sessions.ok) throw new Error('Failed to fetch sessions');
        const sessionsData = await sessions.json();
        setSessions(sessionsData);
      } catch (err: any) {
        setError(err.message || 'Error loading course');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded bg-white p-6 shadow">
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {course && (
        <>
          <h1 className="mb-2 text-2xl font-bold text-purple-700">{course.title}</h1>
          <p className="mb-6 text-gray-700">{course.description}</p>
        </>
      )}
      <h2 className="mb-4 text-xl font-semibold text-purple-700">Clases disponibles</h2>
      <ul>
        {sessions.length > 0
          ? sessions.map((session) => (
              <li
                key={session.id}
                className="mb-4 flex items-center justify-between rounded bg-gray-700 p-4 shadow"
              >
                <span>
                  <span className="font-bold">{session.title}</span>
                  <span className="text-gray-500"> - {session.description}</span>
                </span>
                <span className={session.isActive ? 'text-green-600' : 'text-red-500'}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </span>
                <a
                  href={`/dashboard/session/${courseId}/${session.id}`}
                  className="ml-4 rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                >
                  View
                </a>
              </li>
            ))
          : !loading && <li className="text-gray-500">No se encontraron clases.</li>}
      </ul>
    </div>
  );
};

export default StudentCourseView;
