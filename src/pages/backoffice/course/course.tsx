import React, { useState, useEffect } from "react";

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

  // ...existing update and delete logic...

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Sessions</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="mb-6">
        {sessions.map((session) => (
          <li key={session.id} className="mb-4 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <span className="font-bold text-blue-800 text-lg">{session.title}</span>
              <span className="ml-2 text-gray-600">(Order: {session.orderIndex})</span>
              <div className="text-sm text-gray-700 mt-1">{session.description}</div>
              <div className="text-xs text-gray-500 mt-1">Objectives: {session.objectives}</div>
              <div className="text-xs text-gray-500 mt-1">Base Price: ${session.basePrice}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                onClick={() => {
                  setSelectedSession(session);
                  setForm({
                    title: session.title,
                    description: session.description,
                    objectives: session.objectives,
                    orderIndex: session.orderIndex,
                    basePrice: session.basePrice,
                  });
                }}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={async () => {
                  setError("");
                  try {
                    const res = await fetch(
                      `https://masterclass-backend-gcne.onrender.com/course/${courseId}/sessions/${session.id}`,
                      {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${document.cookie.split("admin_jwt=")[1]}`,
                        },
                      }
                    );
                    if (!res.ok) throw new Error("Failed to delete session");
                    setSessions((prev) => prev.filter((s) => s.id !== session.id));
                  } catch (err: any) {
                    setError(err.message || "Error deleting session");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold text-purple-700 mb-4 text-center">{selectedSession ? "Edit Session" : "Create Session"}</h2>
      <form onSubmit={selectedSession ? async (e) => {
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
      } : handleCreate} className="space-y-4">
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

export default Sessions;
