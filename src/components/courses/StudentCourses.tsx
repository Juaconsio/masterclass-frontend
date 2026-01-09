import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CoursesSection } from './CoursesSection';
import { fetchCoursesByCurrentUser } from '@client/courses';

type Course = any;

export function StudentCourses(): React.ReactElement {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const courses = await fetchCoursesByCurrentUser();
        setCourses(courses || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
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
      <main className="container mx-auto space-y-8 px-4 py-8">
        <CoursesSection courses={courses} loading={loading} />
      </main>
    </div>
  );
}
