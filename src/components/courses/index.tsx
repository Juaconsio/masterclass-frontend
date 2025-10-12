import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../hooks/useAuth';
import { fetchSlots } from '../../client/slots';
import { DashboardHeader } from './dashboardHeader';
import { CoursesSection } from './courseSection';
import { fetchCourses } from '@client/courses';
import { fetchReservations } from '@/client/reservations';

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
        const courses = await fetchCourses(user?.id);
        setCourses(courses || []);
        const reservations = await fetchReservations().then((dataJson) => dataJson || []);
        const filteredReservations = reservations.filter((r: any) => r.studentId === user?.id);
        setReservations(filteredReservations || []);
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

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto space-y-8 px-4 py-8">
        Cursos
        <CoursesSection courses={courses} loading={loading} />
        {/*  <ReservationsCalendar
          reservationsByDate={reservationsByDate}
          slots={slots}
          classes={classes}
          courses={courses}
          onDeleteReservation={removeReservation}
        /> */}
      </main>
    </div>
  );
};

export default Dashboard;
