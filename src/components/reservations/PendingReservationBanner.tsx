import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { createReservation, getReservationEnroll } from '@/client/reservations';
import SuccessModal from '../reservations/SucessModal';
import { Drawer, type DrawerRef } from '@components/UI';
import type { IEvent } from '@/interfaces/events/IEvent';
import type { IReservation, ICourse, IPayment, IPricingPlan } from '@/interfaces';
import { TriangleAlert } from 'lucide-react';

interface PendingReservation {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
  pricingPlanId: string;
  ts: number;
  course: ICourse;
  slot?: IEvent;
  pricingPlan: IPricingPlan;
}

export interface PendingReservationBannerRef {
  openDrawer: () => void;
  hasReservation: boolean;
}

const PendingReservationBanner = forwardRef<PendingReservationBannerRef>((props, ref) => {
  const [reservation, setReservation] = useState<PendingReservation | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<IReservation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payment, setPayment] = useState<IPayment | null>(null);
  const drawerRef = useRef<DrawerRef>(null);

  const getLocalStorageEnrollInfo = async () => {
    try {
      const stored = localStorage.getItem('checkout.reservation');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Loaded reservation from localStorage:', data);
        const options = {
          courseId: Number(data.courseId),
          slotId: Number(data.slotId),
          pricingPlanId: data.pricingPlanId,
        };
        const courseData = await getReservationEnroll(options);
        setReservation({ ...data, ...courseData });
      } else {
        setReservation(null);
      }
    } catch (e) {
      console.error('Error reading reservation from localStorage', e);
    }
  };

  useEffect(() => {
    getLocalStorageEnrollInfo();
  }, []);

  useImperativeHandle(ref, () => ({
    openDrawer: () => drawerRef.current?.open(),
    hasReservation: !!reservation,
  }));

  const handleConfirm = async () => {
    if (!reservation) return;

    setIsConfirming(true);
    try {
      const response = await createReservation({
        courseId: reservation.course.id,
        slotId: reservation.slot?.id,
        pricingPlanId: reservation.pricingPlan.id,
      });

      if (response) {
        setConfirmedReservation(response.reservation);
        setPayment(response.payment);
        setShowModal(true);
        localStorage.removeItem('checkout.reservation');
        window.dispatchEvent(new Event('reservationChanged'));
        setReservation(null);
        drawerRef.current?.close();
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
    window.dispatchEvent(new Event('reservationChanged'));
    setReservation(null);
    drawerRef.current?.close();
  };

  const SuccessModalOnClose = () => {
    setShowModal(false);
  };

  if (!reservation && !showModal) return null;

  return (
    <>
      {reservation && !showModal && (
        <Drawer
          ref={drawerRef}
          title="Reserva Pendiente"
          width="xl"
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
              label: 'Cancelar',
              onClick: handleDismiss,
              variant: 'ghost',
            },
          ]}
        >
          <div className="flex h-full flex-col gap-4">
            {/* Fila 1: Curso y Clase */}
            <div className="bg-base-200 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-base-content/60">Curso</span>
                  <span className="font-medium">
                    {reservation.course?.acronym} - {reservation.course?.title || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base-content/60">Clase</span>
                  <span className="font-medium">{reservation.slot?.class?.title ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Fila 2: Grid de 2 columnas - Slot Info y Pricing Plan */}
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              {/* Columna 1: Información del Slot */}
              <div className="bg-base-200 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-base-content/60">Fecha</span>
                    <span className="font-medium">
                      {reservation.slot?.startTime
                        ? new Date(reservation.slot.startTime).toLocaleString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base-content/60">Horario</span>
                    <span className="font-medium">
                      {reservation.slot?.startTime &&
                        new Date(reservation.slot.startTime).toLocaleString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                      -{' '}
                      {reservation.slot?.endTime &&
                        new Date(reservation.slot.endTime).toLocaleString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      {reservation.slot?.startTime && reservation.slot?.endTime && (
                        <span className="text-base-content/60 ml-2">
                          (
                          {Math.round(
                            (new Date(reservation.slot.endTime).getTime() -
                              new Date(reservation.slot.startTime).getTime()) /
                              (1000 * 60)
                          )}{' '}
                          min)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base-content/60">Modalidad</span>
                    <span className="font-medium capitalize">
                      {reservation.slot?.modality === 'remote' ? 'Remota (Online)' : 'Presencial'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base-content/60">Tipo</span>
                    <span className="font-medium">
                      {reservation.slot?.studentsGroup === 'private'
                        ? 'Clase Privada (1 a 1)'
                        : 'Clase Grupal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna 2: Plan y Precio */}
              <div className="flex flex-col">
                {reservation.pricingPlan && (
                  <div className="bg-primary/10 border-primary/20 flex-1 rounded-lg border-2 p-4">
                    <div className="flex flex-col justify-between gap-2 text-sm">
                      <div className="flex flex-col gap-2">
                        <span className="text-base font-medium">
                          {reservation.pricingPlan.name || 'Plan sin nombre'}
                        </span>
                        {reservation.pricingPlan.description && (
                          <p className="text-base-content/70 text-xs">
                            {reservation.pricingPlan.description}
                          </p>
                        )}
                        <div className="divider my-2"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-base-content/60 mb-1 text-xs">Total a pagar</div>
                        <div className="text-primary text-3xl font-bold">
                          {new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          }).format(reservation.pricingPlan.price || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alert en la parte inferior */}
            <div className="alert alert-warning">
              <TriangleAlert />
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
          onClose={SuccessModalOnClose}
        />
      )}
    </>
  );
});

PendingReservationBanner.displayName = 'PendingReservationBanner';

export default PendingReservationBanner;
