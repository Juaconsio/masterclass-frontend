import React, { useEffect, useState } from "react";

interface Session {
  id: number;
  title: string;
  description?: string;
  objectives?: string;
  orderIndex?: number;
  basePrice?: number;
  // Add more fields as needed
}

const StudentSessionView: React.FC<{ courseId: string; sessionId: string }> = ({ courseId, sessionId }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      setError("");
      try {
        const jwt = localStorage.getItem("token");
        console.log("Fetching session with courseId:", courseId, "and sessionId:", sessionId);
        const res = await fetch(`http://localhost:3000/course/${courseId}/sessions/${sessionId}`,
          {
            headers: { Authorization: jwt ? `Bearer ${jwt}` : "" },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch session");
        const data = await res.json();
        setSession(data);
      } catch (err: any) {
        setError(err.message || "Error loading session");
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [courseId, sessionId]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {session && (
        <>
          <h1 className="text-2xl font-bold text-purple-700 mb-2">{session.title}</h1>
          <p className="mb-4 text-gray-700">{session.description}</p>
          {session.objectives && (
            <div className="mb-2">
              <span className="font-semibold">Objectives:</span> {session.objectives}
            </div>
          )}
          {session.orderIndex !== undefined && (
            <div className="mb-2">
              <span className="font-semibold">Order:</span> {session.orderIndex}
            </div>
          )}
          {session.basePrice !== undefined && (
            <div className="mb-2">
              <span className="font-semibold">Base Price:</span> ${session.basePrice}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentSessionView;
