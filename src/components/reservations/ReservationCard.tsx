import {
  Users,
  User,
  Monitor,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import type { IReservation } from '@/interfaces';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { no } from 'zod/v4/locales';

interface ReservationCardProps {
  reservation: IReservation;
  onClick?: () => void;
  className?: string;
  action?: React.ReactNode;
}

// Estilos para el estado de la reserva
const RESERVATION_STATUS_STYLES = {
  pending: { bg: 'bg-warning', text: 'text-warning', label: 'Pendiente' },
  confirmed: { bg: 'bg-success', text: 'text-success', label: 'Confirmada' },
  cancelled: { bg: 'bg-error', text: 'text-error', label: 'Cancelada' },
  reschedule_pending: { bg: 'bg-warning', text: 'text-warning', label: 'Reagendar' },
  to_refund: { bg: 'bg-warning', text: 'text-warning', label: 'Reembolso solicitado' },
  refunded: { bg: 'bg-info', text: 'text-info', label: 'Reembolsada' },
  attended: { bg: 'bg-info', text: 'text-info', label: 'Completada' },
  no_show: { bg: 'bg-error', text: 'text-error', label: 'No Asistió' },
};

// Estilos para el estado del pago
const PAYMENT_STATUS_STYLES = {
  pending: { bg: 'bg-warning/20', text: 'text-warning', icon: Clock, label: 'Pendiente' },
  paid: { bg: 'bg-success/20', text: 'text-success', icon: CheckCircle2, label: 'Pagado' },
  failed: { bg: 'bg-error/20', text: 'text-error', icon: XCircle, label: 'Fallido' },
  refunded: { bg: 'bg-info/20', text: 'text-info', icon: CreditCard, label: 'Reembolsado' },
};

/**
 * Componente para mostrar información detallada de una reservación
 * Incluye información de la clase, curso, profesor, estado de reserva y pago
 */
export default function ReservationCard({
  reservation,
  onClick,
  className,
  action,
}: ReservationCardProps) {
  const slot = reservation.slot;

  if (!slot) {
    return null;
  }

  const isGroup = slot.studentsGroup === 'group';
  const isRemote = slot.modality === 'remote';
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  const reservationStatus =
    RESERVATION_STATUS_STYLES[reservation.status] || RESERVATION_STATUS_STYLES.pending;
  const paymentStatus = reservation.payment?.status
    ? PAYMENT_STATUS_STYLES[reservation.payment.status] || PAYMENT_STATUS_STYLES.pending
    : null;

  const PaymentIcon = paymentStatus?.icon;

  return (
    <div
      className={clsx(
        'rounded-lg border-2 bg-white p-4 shadow-md transition-all',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Header: Título y estado de reserva */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            {slot.class?.title || `Clase ${slot.classId}`}
          </h3>

          {/* Fecha y hora */}
          <div className="mt-1 flex w-fit justify-start gap-2">
            <p className="text-sm font-normal text-gray-700">
              {format(start, "EEEE, d 'de' MMMM", { locale: es })}:{' '}
              {format(start, 'HH:mm', { locale: es })} - {format(end, 'HH:mm', { locale: es })}
            </p>
          </div>

          {/* Profesor y curso */}
          <div className="mt-0.5 flex flex-col gap-0.5">
            <p className="text-xs text-gray-600">
              Profesor: {slot.professor?.name || `Profesor ${slot.professorId}`}
            </p>
            {slot.class?.course && (
              <p className="text-xs text-gray-500">
                {slot.class.course.acronym} - {slot.class.course.title}
              </p>
            )}
          </div>
        </div>

        {/* Indicador de estado de reserva */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${reservationStatus.text}`}>
              {reservationStatus.label}
            </span>
            <div className={`h-4 w-4 rounded-full ${reservationStatus.bg}`} />
          </div>
        </div>
      </div>

      {/* Ubicación (si existe) */}
      {slot.location && (
        <div className="mb-2 text-xs text-gray-500">
          <MapPin className="mr-1 inline h-3 w-3" />
          {slot.location}
        </div>
      )}

      {/* Estado del pago */}
      {paymentStatus && PaymentIcon && (
        <div className="mb-3">
          <div className={`flex items-center gap-2 rounded-lg p-2 ${paymentStatus.bg}`}>
            <PaymentIcon className={`h-4 w-4 ${paymentStatus.text}`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${paymentStatus.text}`}>
                Pago: {paymentStatus.label}
              </p>
              {reservation.payment && (
                <p className="text-xs text-gray-600">
                  ${reservation.payment.amount.toLocaleString('es-CL')}{' '}
                  {reservation.payment.currency}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modalidad y tipo de clase */}
      <div className="flex items-center justify-between gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-4">
          {/* Tipo de clase */}
          <div className="flex items-center gap-1">
            {isGroup ? (
              <>
                <Users className="h-4 w-4" />
                <span>Grupal</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Particular</span>
              </>
            )}
          </div>

          {/* Modalidad */}
          <div className="flex items-center gap-1">
            {isRemote ? (
              <>
                <Monitor className="h-4 w-4" />
                <span>Remoto</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Presencial</span>
              </>
            )}
          </div>
        </div>

        {/* Acciones */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
