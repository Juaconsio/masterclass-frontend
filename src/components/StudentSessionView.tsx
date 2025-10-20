import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { createReservation } from '@client/reservations';

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
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [reserveLoading, setReserveLoading] = useState<number|null>(null);
  const [reserveError, setReserveError] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState("");
  const apiUrl = import.meta.env.PUBLIC_BACKEND_API_URL;

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      setError("");
      try {
        const jwt = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/courses/${courseId}/sessions/${sessionId}`,
          {
            headers: { Authorization: jwt ? `Bearer ${jwt}` : "" },
            method: 'GET',
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

  useEffect(() => {
    async function getSlots() {
      setSlotsLoading(true);
      setSlotsError("");
      try {
        const res = await fetch(`http://localhost:3000/slots`);
        if (!res.ok) throw new Error("Failed to fetch slots");
        const allSlots = await res.json();
        // Filter slots for this session
        const sessionSlots = allSlots.filter((slot: any) => slot.classId === Number(sessionId));
        setSlots(sessionSlots);
      } catch (err: any) {
        setSlotsError("Error loading slots");
      } finally {
        setSlotsLoading(false);
      }
    }
    getSlots();
  }, [sessionId]);

  const handleReserve = async (slotId: number) => {
    setReserveLoading(slotId);
    setReserveError("");
    setReserveSuccess("");
    try {
      const jwt = localStorage.getItem("token");
      let studentId = null;
      if (jwt) {
        const decoded: any = jwtDecode(jwt);
        studentId = decoded.id;
      }
      if (!studentId) throw new Error("No student ID found");
      await createReservation(studentId, slotId);
      setReserveSuccess("Reservation successful!");
    } catch (err: any) {
      setReserveError("Error reserving slot");
    } finally {
      setReserveLoading(null);
    }
  };

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
              <span className="font-semibold text-gray-700">Objectives: {session.objectives}</span>
            </div>
          )}{session.objectives}
          {session.orderIndex !== undefined && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Order: {session.orderIndex}</span>
            </div>
          )}
          {session.basePrice !== undefined && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Base Price: ${session.basePrice}</span>
            </div>
          )}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-purple-600 mb-2">Available Slots</h2>
            {slotsLoading && <div className="text-gray-500">Loading slots...</div>}
            {slotsError && <div className="text-red-500">{slotsError}</div>}
            {slots.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4">
                {slots.map((slot) => {
                  // Format date/time
                  const start = new Date(slot.startTime);
                  const end = new Date(slot.endTime);
                  const options: Intl.DateTimeFormatOptions = {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  };
                  return (
                    <li
                      key={slot.id}
                      className="p-4 bg-white border border-purple-200 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div className="flex flex-col md:flex-row md:items-center">
                        <span className="font-semibold text-black text-lg mr-4">
                          {start.toLocaleDateString(undefined, options)}
                        </span>
                        <span className="text-black text-md">
                          {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        onClick={() => handleReserve(slot.id)}
                        disabled={reserveLoading === slot.id}
                      >
                        {reserveLoading === slot.id ? 'Reserving...' : 'Reserve'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              !slotsLoading && <div className="text-gray-500">No available slots for this session.</div>
            )}
          </div>
          {reserveError && <div className="text-red-500 mt-4">{reserveError}</div>}
          {reserveSuccess && <div className="text-green-600 mt-4">{reserveSuccess}</div>}
        </>
      )}
    </div>
  );
};

export default StudentSessionView;
