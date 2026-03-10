import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchPublicCourses, fetchCoursesByCurrentUser } from '@client/courses';
import { CourseCatalogSection, type CatalogCourse } from './CourseCatalogSection';

export function StudentCourses(): React.ReactElement {
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState<CatalogCourse[]>([]);
  const [myCourses, setMyCourses] = useState<{ id: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [publicList, enrolledList] = await Promise.all([
          fetchPublicCourses(),
          fetchCoursesByCurrentUser().catch(() => []),
        ]);
        setAllCourses(Array.isArray(publicList) ? publicList : []);
        setMyCourses(Array.isArray(enrolledList) ? enrolledList : []);
      } catch (err) {
        console.error('Error loading courses', err);
        setAllCourses([]);
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.map((c) => c.id)),
    [myCourses]
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto space-y-8 px-4 py-8">
        <CourseCatalogSection
          courses={allCourses}
          enrolledCourseIds={enrolledCourseIds}
          loading={loading}
        />
      </main>
    </div>
  );
}
