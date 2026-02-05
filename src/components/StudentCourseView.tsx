import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { XCircle } from 'lucide-react';
import { fetchStudentCourseById } from '@client/courses';
import { fetchReservations } from '@client/reservations';
import { CourseHeader, CourseInfo, CourseClasses } from '@/components/courses';
import { MyReservations } from '@/components/reservations/MyReservations';
import type { ICourse, IReservation } from '@/interfaces';

type TabType = 'info' | 'classes' | 'reservations';

const StudentCourseView: React.FC = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [myReservations, setMyReservations] = useState<IReservation[]>([]);

  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [courseData, reservationsData] = await Promise.all([
          fetchStudentCourseById(Number(courseId)),
          fetchReservations(),
        ]);
        setCourse(courseData);
        setMyReservations(reservationsData);
      } catch (err: any) {
        setError(err.message || 'Error loading course');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  return (
    <div className="bg-base-100 min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {error && (
          <div className="alert alert-error shadow-lg">
            <XCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        <CourseHeader course={course} loading={loading} />

        {!loading && course && (
          <>
            {/* Tabs */}
            <div className="tabs tabs-boxed bg-base-200">
              <button
                className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Información General
              </button>
              <button
                className={`tab ${activeTab === 'classes' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('classes')}
              >
                Clases ({course.classes?.length || 0})
              </button>
              <button
                className={`tab ${activeTab === 'reservations' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                Mis Reservas
              </button>
            </div>

            {/* Tab Content */}
            <div className="card">
              <div className="card-body">
                {activeTab === 'info' && (
                  <CourseInfo
                    description={course.description}
                    professors={course.professors}
                    classCount={course.classes?.length || 0}
                  />
                )}

                {activeTab === 'classes' && (
                  <CourseClasses
                    classes={course.classes}
                    loading={loading}
                    reservations={myReservations}
                  />
                )}

                {activeTab === 'reservations' && (
                  <MyReservations reservations={myReservations} loading={loading} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCourseView;
