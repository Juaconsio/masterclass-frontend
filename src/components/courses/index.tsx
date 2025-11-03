import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchSlots } from '../../client/slots';
import { httpClient } from '@/client/config';
import { CoursesSection } from './course-section';
import { fetchCourses } from '@client/courses';
import { fetchReservations } from '@/client/reservations';
import { ReservationsCalendar } from './reservations-calendar';

type Course = any;
type Reservation = any;
type Slot = any;
type ClassItem = any;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch user courses
        const courses = await fetchCourses();
        setCourses(courses || []);
        const reservationsRes = await fetchReservations().then((dataJson) => dataJson || []);
        const filteredReservations = reservationsRes.filter((r: any) => r.studentId === user?.id);
        setReservations(filteredReservations || []);

        // fetch classes/sessions (optional endpoint)
        try {
          const token = localStorage.getItem('token');
          const classesRes = await httpClient.get('/courses/sessions', {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          });
          setClasses(classesRes.data || []);
        } catch (e) {
          setClasses([]);
        }

        // fetch slots
        try {
          const slotsData = await fetchSlots();
          setSlots(slotsData || []);
        } catch (e) {
          setSlots([]);
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  // transform reservations into date-keyed map for the calendar component
  const reservationsByDate: Record<string, any[]> = {};
  for (const r of reservations) {
    const slot = slots.find((s) => s.id === r.slotId);
    const start = slot?.startTime ? new Date(slot.startTime) : null;
    const dateKey = start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
          start.getDate()
        ).padStart(2, '0')}`
      : null;
    if (dateKey) {
      reservationsByDate[dateKey] = reservationsByDate[dateKey] || [];
      reservationsByDate[dateKey].push({ ...r, slot });
    }
  }
  console.debug('Reservations by date', reservationsByDate);

  async function removeReservation(reservationId: number) {
    const token = localStorage.getItem('token');
    // optimistic remove
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    try {
      await httpClient.delete(`/reservations/${reservationId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
    } catch (err) {
      console.error('Failed to delete reservation', err);
      // revert by refetching reservations
      try {
        const refreshed = await fetchReservations().then((d) => d || []);
        const filtered = refreshed.filter((r: any) => r.studentId === user?.id);
        setReservations(filtered || []);
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto space-y-8 px-4 py-8">
        <CoursesSection courses={courses} loading={loading} />
        <ReservationsCalendar
          reservationsByDate={reservationsByDate}
          slots={slots}
          classes={classes}
          courses={courses}
          onDeleteReservation={removeReservation}
        />
      </main>
    </div>
  );
};

export default Dashboard;
