import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../hooks/useAuth";

interface Course {
  id: number;
  title: string;
}


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState("");


  useEffect(() => {
    if (!user) return;
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
    async function fetchReservations() {
      setReservationsLoading(true);
      setReservationsError("");
      try {
        let studentId = null;
        const jwt = localStorage.getItem('token');
        if (jwt) {
          const decoded: any = jwtDecode(jwt);
          studentId = decoded.id;
        }
        if (studentId) {
          const data = await fetch(`http://localhost:3000/reservations`,
            { headers: { Authorization: jwt ? `Bearer ${jwt}` : "" } }
          );
          const dataJson = await data.json();
          // filter reservations for this student
          const reservations = dataJson.filter((r: any) => r.studentId === studentId);
          setReservations(reservations);
        }
      } catch (err: any) {
        setReservationsError("Error fetching reservations");
      } finally {
        setReservationsLoading(false);
      }
    }
    fetchCourses();
    fetchReservations();
  }, [user]);

  // useEffect(() => {
  //   if (!user) {
  //     window.location.replace('/auth/signUp');
  //   }
  // }, [user]);
  // if (!user) {
  //   return null;
  // }
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

      <div className="mt-10">
        <h2 className="text-xl font-bold text-purple-700 mb-4">My Reservations</h2>
        {reservationsLoading && <div className="text-gray-500">Loading reservations...</div>}
        {reservationsError && <div className="text-red-500">{reservationsError}</div>}
        <ul>
          {reservations.length > 0 ? (
            reservations.map((r) => (
              <li key={r.id} className="mb-4 p-4 bg-white border border-purple-200 rounded shadow flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-bold text-black">Slot #{r.slotId}</span>
                <span className="text-black">Reservation ID: {r.id}</span>
                {/* Add more reservation info here if available */}
              </li>
            ))
          ) : (
            !reservationsLoading && <li className="text-gray-500">No reservations found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
