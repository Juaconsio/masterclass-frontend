import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { XCircle } from 'lucide-react';
import { fetchStudentCourseById } from '@client/courses';
import { createReservation } from '@client/reservations';
import SuccessModal from './reservations/SucessModal';
import { CourseHeader, CourseInfo, CourseClasses, CourseReservations } from '@/components/courses';
import type { IClass, IProfessor } from '@/interfaces/events/IEvent';
import type { ICourse, IReservation, IPayment } from '@/interfaces';

type TabType = 'info' | 'classes' | 'reservations';

const StudentCourseView: React.FC = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserveLoading, setReserveLoading] = useState<number | null>(null);
  const [reserveError, setReserveError] = useState<Record<number, string>>({});
  const [reservation, setReservation] = useState<IReservation | null>(null);
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const course = await fetchStudentCourseById(Number(courseId));
        setCourse(course);
      } catch (err: any) {
        setError(err.message || 'Error loading course');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  const handleReserve = async (slotId: number) => {
    setReserveLoading(slotId);
    setReserveError({});
    try {
      const response = await createReservation({
        courseId: Number(courseId),
        slotId,
      });
      if (response) {
        setReservation(response.reservation);
        setPayment(response.payment);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setReserveError({ [slotId]: 'Error reserving slot: ' + err.message });
    } finally {
      setReserveLoading(null);
    }
  };

  return (
    <div className="bg-base-100 min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {showSuccessModal && reservation && payment && (
          <SuccessModal
            reservation={reservation}
            payment={payment}
            onClose={() => setShowSuccessModal(false)}
          />
        )}

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
                  <CourseClasses classes={course.classes} loading={loading} />
                )}

                {activeTab === 'reservations' && (
                  <CourseReservations
                    classes={course.classes}
                    loading={loading}
                    reserveLoading={reserveLoading}
                    reserveError={reserveError}
                    onReserve={handleReserve}
                  />
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
