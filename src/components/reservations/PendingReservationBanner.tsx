import { useEffect, useState } from 'react';
import { confirmReservation } from '../../client/confirmReservation';
import { getCourseEnroll } from '@/client/courses';
import SuccessModal from '../reservations/SucessModal';
import type { IEvent } from '@/interfaces/events/IEvent';

interface PendingReservation {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
  planId: string;
  ts: number;
  course: unknown;
  slot?: IEvent;
}

export default function PendingReservationBanner() {
  const [reservation, setReservation] = useState<PendingReservation | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  useEffect(() => {
    // Check localStorage for pending reservation
    const getEnrollInfo = async () => {
      try {
        const stored = localStorage.getItem('checkout.reservation');
        console.log('Stored reservation:', stored);
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
        setReservationId(response.reservationId);
        setPaymentReference(response.reservationId);
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
        <div className="alert alert-primary border-primary mb-4 border-2 shadow-lg">
          <div className="flex gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 flex-shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Tienes una reserva pendiente</h3>
              <div className="text-sm">
                Curso: {reservation.course.title} | Plan: {reservation.planId} |{' '}
                {reservation.slot && (
                  <>
                    Slot: {reservation.slot?.startTime} - {reservation.slot?.endTime}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-none gap-2">
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
      )}

      {/* Modal with bank transfer details */}
      {showModal && (
        <SuccessModal
          reservationId={reservationId}
          paymentReference={paymentReference}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
}
