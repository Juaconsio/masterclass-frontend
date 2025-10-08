import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../hooks/useAuth';
import { fetchSlots } from '../../client/slots';

interface Course {
  id: number;
  title: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const apiUrl = import.meta.env.PUBLIC_BACKEND_API_URL;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (!user) return;
    async function fetchCourses() {
      setLoading(true);
      setError('');
      try {
        const jwt = localStorage.getItem('token');
        let studentId = null;
        if (jwt) {
          const decoded: any = jwtDecode(jwt);
          studentId = decoded.id;
        }
        const res = await fetch(
          `${apiUrl}/courses${studentId ? `?studentId=${studentId}` : ''}`,
          {
            headers: {
              Authorization: jwt ? `Bearer ${jwt}` : '',
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    }
    async function fetchReservations() {
      setReservationsLoading(true);
      setReservationsError('');
      try {
        let studentId = null;
        const jwt = localStorage.getItem('token');
        if (jwt) {
          const decoded: any = jwtDecode(jwt);
          studentId = decoded.id;
        }
        if (studentId) {
          const data = await fetch(`${apiUrl}/reservations`, {
            headers: { Authorization: jwt ? `Bearer ${jwt}` : '' },
          });
          const dataJson = await data.json();
          const reservations = dataJson.filter((r: any) => r.studentId === studentId);
          setReservations(reservations);
        }
      } catch (err: any) {
        setReservationsError('Error fetching reservations');
      } finally {
        setReservationsLoading(false);
      }
    }
    async function fetchAllSlots() {
      setSlotsLoading(true);
      setSlotsError('');
      try {
        const allSlots = await fetchSlots();
        setSlots(allSlots);
      } catch (err: any) {
        setSlotsError('Error fetching slots');
      } finally {
        setSlotsLoading(false);
      }
    }

    async function fetchAllClasses() {
      setLoading(true);
      setError('');
      try {
        const jwt = localStorage.getItem('token');
        if (jwt) {
          const decoded: any = jwtDecode(jwt);
        }
        const res = await fetch(`${apiUrl}/courses/sessions`, {
          headers: {
            Authorization: jwt ? `Bearer ${jwt}` : '',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setClasses(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    }
    fetchAllClasses();
    fetchCourses();
    fetchReservations();
    fetchAllSlots();
  }, [user]);

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      await fetch(`${apiUrl}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token')
            ? `Bearer ${localStorage.getItem('token')}`
            : '',
        },
      });
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    } catch (err) {
      alert('Error deleting reservation');
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded p-6 shadow">
      <h1 className="mb-6 text-2xl font-bold text-purple-700">My Courses</h1>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {courses.length > 0
          ? courses.map((course) => (
              <li
                key={course.id}
                className="mb-4 flex items-center justify-between rounded bg-purple-50 p-4 shadow"
              >
                <span className="font-bold text-purple-800">{course.title}</span>
                <a
                  href={`/dashboard/course/${course.id}`}
                  className="ml-4 rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                >
                  View
                </a>
              </li>
            ))
          : !loading && <li className="text-gray-500">No courses found.</li>}
      </ul>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-purple-700">My Reservations</h2>
        {reservationsLoading && <div className="text-gray-500">Loading reservations...</div>}
        {reservationsError && <div className="text-red-500">{reservationsError}</div>}
        <ul>
          {reservations.length > 0
            ? reservations.map((r) => {
                const slot = slots.find((s) => s.id === r.slotId);
                const course = courses.find((c) => c.id === slot?.classId);
                const classData = classes.find((cl: any) => cl.id === course?.id);
                return (
                  <li
                    key={r.id}
                    className="mb-4 flex flex-col justify-between rounded border border-purple-200 bg-white p-4 shadow md:flex-row md:items-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-black">Slot #{r.slotId}</span>
                      {slot ? (
                        <>
                          <span className="text-black">
                            Date: {new Date(slot.startTime).toLocaleDateString()}{' '}
                            {new Date(slot.startTime).toLocaleTimeString()} -{' '}
                            {new Date(slot.endTime).toLocaleTimeString()}
                          </span>
                          <span className="text-black">Modality: {slot.modality}</span>
                          <span className="text-black">Status: {slot.status}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Slot info not found</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-black">Course #{course?.title}</span>
                      <span className="text-black">Class ID: {classData?.title}</span>
                    </div>
                    <span className="text-black">Reservation ID: {r.id}</span>
                    <button
                      className="ml-4 rounded bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                      onClick={() => handleDeleteReservation(r.id)}
                    >
                      Delete
                    </button>
                  </li>
                );
              })
            : !reservationsLoading && <li className="text-gray-500">No reservations found.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
