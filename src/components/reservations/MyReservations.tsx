import { Calendar, CheckCircle, Clock, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef } from 'react';
import type { IReservation } from '@/interfaces';
import { deleteReservation } from '@/client/reservations';
import { ConfirmActionModal, type ConfirmActionModalRef } from '@/components/UI/ConfirmActionModal';
import { showToast } from '@/lib/toast';

interface MyReservationsProps {
  reservations: IReservation[];
  loading: boolean;
  onReservationDeleted?: () => void;
}

export function MyReservations({
  reservations,
  loading,
  onReservationDeleted,
}: MyReservationsProps) {
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef<ConfirmActionModalRef>(null);

  const handleDeleteClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    modalRef.current?.open();
  };

  const handleConfirmDelete = async () => {
    if (!selectedReservationId) return;

    setIsDeleting(true);
    try {
      await deleteReservation(selectedReservationId);
      showToast.success('Reserva cancelada correctamente');
      modalRef.current?.close();
      onReservationDeleted?.();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      showToast.error('Error al cancelar la reserva');
    } finally {
      setIsDeleting(false);
      setSelectedReservationId(null);
    }
  };

  const handleCancelDelete = () => {
    setSelectedReservationId(null);
  };
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-base-200 card shadow-lg">
            <div className="card-body">
              <div className="skeleton h-6 w-3/4"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-base-200 card">
        <div className="card-body items-center text-center">
          <Calendar className="text-base-content/40 h-8 w-8" />
          <p className="text-base-content/70 mb-4">No tienes reservas aún.</p>
          <a href="/courses" className="btn btn-primary">
            Explorar cursos
          </a>
        </div>
      </div>
    );
  }

  const pending = reservations.filter((r) => r.status === 'pending');
  const confirmed = reservations.filter((r) => r.status === 'confirmed');
  const cancelled = reservations.filter((r) => r.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="badge badge-success gap-2">
            <CheckCircle className="h-3 w-3" />
            Confirmada
          </div>
        );
      case 'pending':
        return (
          <div className="badge badge-warning gap-2">
            <Clock className="h-3 w-3" />
            Pendiente de Pago
          </div>
        );
      case 'cancelled':
        return (
          <div className="badge badge-error gap-2">
            <XCircle className="h-3 w-3" />
            Cancelada
          </div>
        );
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  };

  const renderReservation = (reservation: IReservation) => {
    const slot = reservation.slot;
    const classInfo = slot?.class;
    const course = classInfo?.course;

    return (
      <div key={reservation.id} className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="card-title text-lg">{course?.title || 'Curso'}</h3>
              <p className="text-base-content/70 text-sm">{classInfo?.title || 'Clase'}</p>
            </div>
            {getStatusBadge(reservation.status)}
          </div>

          {slot && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="text-base-content/60 h-4 w-4" />
                <span>
                  {format(new Date(slot.startTime), "EEE, d 'de' MMMM 'a las' HH:mm", {
                    locale: es,
                  })}
                </span>
              </div>

              {slot.professor && (
                <div className="flex items-center gap-2">
                  <span className="text-base-content/60">Profesor:</span>
                  <span>{slot.professor.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Modalidad:</span>
                <span className="capitalize">{slot.modality?.toLowerCase()}</span>
              </div>
            </div>
          )}

          {reservation.payment && (
            <div className="border-base-300 mt-4 border-t pt-4">
              <div className="text-sm">
                <span className="text-base-content/60">Estado del pago:</span>{' '}
                <span className="font-medium capitalize">{reservation.payment.status}</span>
              </div>
              {reservation.payment.transactionReference && (
                <div className="text-base-content/60 mt-1 text-xs">
                  Ref: {reservation.payment.transactionReference}
                </div>
              )}
            </div>
          )}

          {reservation.status === 'pending' && (
            <div className="card-actions mt-4 justify-end">
              <button
                className="btn btn-sm btn-ghost btn-error gap-2"
                onClick={() => handleDeleteClick(reservation.id)}
              >
                <Trash2 className="h-4 w-4" />
                Cancelar reserva
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="text-warning h-5 w-5" />
            Pendientes de Pago ({pending.length})
          </h3>
          <div className="grid gap-4">{pending.map((r) => renderReservation(r))}</div>
        </section>
      )}

      {confirmed.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <CheckCircle className="text-success h-5 w-5" />
            Confirmadas ({confirmed.length})
          </h3>
          <div className="grid gap-4">{confirmed.map((r) => renderReservation(r))}</div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <XCircle className="text-error h-5 w-5" />
            Canceladas ({cancelled.length})
          </h3>
          <div className="grid gap-4">{cancelled.map((r) => renderReservation(r))}</div>
        </section>
      )}

      <ConfirmActionModal
        ref={modalRef}
        title="¿Cancelar reserva?"
        message="Esta acción marcará tu reserva como cancelada. Los datos se conservarán pero el slot quedará disponible para otros estudiantes."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
