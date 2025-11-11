import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { confirmReservation } from '../../client/confirmReservation';
import { getCourseEnroll } from '@/client/courses';
import SuccessModal from '../reservations/SucessModal';
import { Drawer, type DrawerRef } from '@components/UI';
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

export interface PendingReservationBannerRef {
  openDrawer: () => void;
  hasReservation: boolean;
}

const PendingReservationBanner = forwardRef<PendingReservationBannerRef>((props, ref) => {
  const [reservation, setReservation] = useState<PendingReservation | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const drawerRef = useRef<DrawerRef>(null);
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

  useImperativeHandle(ref, () => ({
    openDrawer: () => drawerRef.current?.open(),
    hasReservation: !!reservation,
  }));

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
    drawerRef.current?.close();
  };

  if (!reservation && !showModal) return null;

  return (
    <>
      {/* Drawer for pending reservation */}
      {reservation && !showModal && (
        <Drawer
          ref={drawerRef}
          title="Reserva Pendiente"
          width="md"
          side="right"
          actions={[
            {
              label: 'Confirmar Reserva',
              onClick: handleConfirm,
              variant: 'primary',
              disabled: isConfirming,
              loading: isConfirming,
            },
            {
              label: 'Descartar Reserva',
              onClick: handleDismiss,
              variant: 'ghost',
            },
          ]}
        >
          <div className="space-y-4">
            <div className="bg-base-200 rounded-lg p-4">
              <h3 className="text-base-content mb-3 font-semibold">Detalles del Curso</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-base-content/60">Curso</span>
                  <span className="font-medium">{reservation.course?.title || '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base-content/60">Clase</span>
                  <span className="font-medium">{reservation.slot?.class?.title ?? '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
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
                <div className="flex flex-col gap-1">
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
            </div>

            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm">Confirma tu reserva para asegurar tu cupo en la clase</span>
            </div>
          </div>
        </Drawer>
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
});

PendingReservationBanner.displayName = 'PendingReservationBanner';

export default PendingReservationBanner;
