import { useEffect, useState } from 'react';
import { confirmReservation } from '../../client/confirmReservation';
import { getCourseEnroll } from '@/client/courses';
import SuccessModal from '../reservations/SucessModal';
import type { IEvent } from '@/interfaces/events/IEvent';
import type { Reservation, Course, Payment } from '@/interfaces';

interface PendingReservation {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
  planId: string;
  ts: number;
  course: Course;
  slot?: IEvent;
}

export default function PendingReservationBanner() {
  const [reservation, setReservation] = useState<PendingReservation | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  useEffect(() => {
    // Check localStorage for pending reservation
    const getEnrollInfo = async () => {
      try {
        const stored = localStorage.getItem('checkout.reservation');
        if (stored) {
          const data = JSON.parse(stored);
          const options: { courseId?: number; courseAcronym?: string; slotId?: number } = {};
          if (data.slotId) options['slotId'] = Number(data.slotId);
          if (data.courseAcronym) options['courseAcronym'] = data.courseAcronym;
          if (data.courseId) options['courseId'] = Number(data.courseId);
          const courseData = await getCourseEnroll(options);
          setReservation({ ...data, ...courseData });
        }
      } catch (e) {
        console.error('Error reading reservation from localStorage', e);
      }
    };
    getEnrollInfo();
  }, []);

  const handleConfirm = async () => {
    if (!reservation) return;

    setIsConfirming(true);
    try {
      const response = await confirmReservation({
        courseId: reservation.course.id,
        slotId: reservation.slot?.id,
      });

      if (response) {
        setConfirmedReservation(response.reservation);
        setPayment(response.payment);
        setShowModal(true);
        // Clear localStorage after successful confirmation
        localStorage.removeItem('checkout.reservation');
        setReservation(null);
      }
    } catch (error) {
      console.error('Error confirming reservation', error);
      alert('Error al confirmar la reserva. Por favor intenta nuevamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDismiss = () => {
    localStorage.removeItem('checkout.reservation');
    setReservation(null);
  };

  if (!reservation && !showModal) return null;

  return (
    <>
      {/* Banner for pending reservation */}
      {reservation && !showModal && (
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Reserva por confirmar</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/60">Curso</span>
                <span className="font-medium">{reservation.course?.title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Clase</span>
                <span className="font-medium">{reservation.slot?.class?.title ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Día</span>
                <span className="font-medium">
                  {new Date(reservation.slot?.startTime || '').toLocaleString('es-CL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) ?? '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-base-content/60">Horario</span>
                <span className="font-medium">
                  {new Date(reservation.slot?.startTime || '').toLocaleString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) ?? '—'}{' '}
                  -{' '}
                  {new Date(reservation.slot?.endTime || '').toLocaleString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) ?? '—'}
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="card-actions">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Confirmar Reserva'
                )}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleDismiss}>
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal with bank transfer details */}
      {showModal && confirmedReservation && payment && (
        <SuccessModal
          reservation={confirmedReservation}
          payment={payment}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
}
