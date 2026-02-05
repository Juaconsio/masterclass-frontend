import { Users, User, Monitor, MapPin } from 'lucide-react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { STATUS_STYLES } from './index';

interface SlotInfoProps {
  event: IEvent;
  onClick?: () => void;
  variant?: 'compact' | 'detailed' | 'student';
  className?: string;
  statusStyle?: string; // Ahora es opcional
  action?: React.ReactNode;
}

// Subcomponentes internos
const StatusIndicator = ({
  statusStyle,
  size = 'sm',
}: {
  statusStyle: string;
  size?: 'sm' | 'md';
}) => {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return <div className={`rounded-full ${statusStyle.split(' ')[0]} ${sizeClass}`} />;
};

const SlotTitle = ({
  event,
  variant,
}: {
  event: IEvent;
  variant: 'compact' | 'detailed' | 'student';
}) => {
  return (
    <h3
      className={clsx('text-gray-900', {
        'text-sm font-semibold': variant === 'compact',
        'text-lg font-bold': variant === 'detailed',
        'text-base font-semibold': variant === 'student',
      })}
    >
      {event.class?.title || `Clase ${event.classId}`}
    </h3>
  );
};

const SlotTime = ({ event, compact }: { event: IEvent; compact?: boolean }) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-start gap-2">
        <p className="text-lg font-semibold">
          {format(start, 'HH:mm', { locale: es })} - {format(end, 'HH:mm', { locale: es })}
        </p>
        <p className="text-letf text-sm font-normal text-gray-700">
          {format(start, "EEE, d 'de' MMM", { locale: es })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-fit justify-start gap-2">
      <p className="text-sm font-normal text-gray-700">
        {format(start, "EEEE, d 'de' MMMM", { locale: es })}:{' '}
        {format(start, 'HH:mm', { locale: es })} - {format(end, 'HH:mm', { locale: es })}
      </p>
    </div>
  );
};

const SlotMetadata = ({ event }: { event: IEvent }) => (
  <div className="mt-0.5 flex items-center justify-between">
    <p className="text-xs text-gray-600">
      Profesor: {event.professor?.name || `Profesor ${event.professorId}`}
    </p>
    {event.class?.course && (
      <p className="text-xs text-gray-500">
        {`${event.class?.course?.acronym} - ${event.class?.course?.title}` ||
          `Curso ${event.class?.courseId}`}
      </p>
    )}{' '}
  </div>
);

const ModalityIcons = ({
  isGroup,
  isRemote,
  reservationsCount,
  showLabels = false,
}: {
  isGroup: boolean;
  isRemote: boolean;
  reservationsCount?: number;
  showLabels?: boolean;
}) => {
  const iconSize = showLabels ? 'h-4 w-4' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {isGroup ? (
          <>
            <Users className={iconSize} />
            {showLabels && <span>Grupal</span>}
          </>
        ) : (
          <>
            <User className={iconSize} />
            {showLabels && <span>Particular</span>}
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isRemote ? (
          <>
            <Monitor className={iconSize} />
            {showLabels && <span>Remoto</span>}
          </>
        ) : (
          <>
            <MapPin className={iconSize} />
            {showLabels && <span>Presencial</span>}
          </>
        )}
      </div>
    </div>
  );
};

const LocationInfo = ({ location }: { location?: string | null }) => {
  if (!location) return null;

  return (
    <div className="mt-2 text-xs text-gray-500">
      <MapPin className="mr-1 inline h-3 w-3" />
      {location}
    </div>
  );
};

const ReservationInfo = ({ event }: { event: IEvent }) => {
  const confirmedReservations = event.confirmedReservations ?? 0;
  const pendingReservations = event.pendingReservations ?? 0;
  const maxStudents = event.maxStudents || 0;
  const minStudents = event.minStudents || 1;
  const totalActiveReservations = confirmedReservations + pendingReservations;
  const availableSpots = maxStudents - totalActiveReservations;
  const isFull = availableSpots <= 0;
  const isMinReached = confirmedReservations >= minStudents;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Reservas confirmadas:
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">
          <span
            className={clsx({
              'text-success': isMinReached && !isFull,
              'text-warning': !isMinReached,
              'text-error': isFull,
            })}
          >
            {confirmedReservations}
          </span>
          <span className="text-gray-400">/{maxStudents}</span>
        </p>
        {pendingReservations > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            + {pendingReservations} pendiente{pendingReservations > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="text-right">
        <div
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold',
            {
              'bg-success/10 text-success': !isFull && availableSpots > 0,
              'bg-error/10 text-error': isFull,
            }
          )}
        >
          {isFull ? (
            'Sin cupos'
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {availableSpots} {availableSpots === 1 ? 'cupo' : 'cupos'} disponible
              {availableSpots > 1 ? 's' : ''}
            </>
          )}
        </div>
        {minStudents > 1 && !isMinReached && (
          <p className="mt-1.5 text-xs text-gray-500">Mín. {minStudents} estudiantes</p>
        )}
      </div>
    </div>
  );
};

/**
 * Componente para mostrar información detallada de un slot.
 * Soporta tres variantes:
 * - compact: para listas densas
 * - detailed: para cards grandes con toda la info
 * - student: para vista de estudiante con info de reservas
 */
export default function SlotInfo({
  event,
  onClick,
  variant = 'compact',
  className,
  action,
}: SlotInfoProps) {
  const isGroup = event.studentsGroup === 'group';
  const isRemote = event.modality === 'remote';

  // Calcular statusStyle basado en el status del evento si no se proporciona
  const statusStyle =
    STATUS_STYLES[event.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.available;

  // Variante compacta (para listas)
  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 rounded-lg border-l-4 bg-white p-3 shadow transition-all hover:shadow-md',
          onClick && 'cursor-pointer hover:brightness-95',
          className
        )}
        onClick={onClick}
      >
        <StatusIndicator statusStyle={statusStyle} size="sm" />
        <div className="flex-1">
          <SlotTitle event={event} variant="compact" />
          <SlotMetadata event={event} />
        </div>
        <ModalityIcons isGroup={isGroup} isRemote={isRemote} showLabels={false} />
      </div>
    );
  }

  // Variante detallada (para cards grandes)
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header: Título de la clase con badge de estado */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-1 text-xl leading-tight font-bold text-gray-900">
              {event.class?.title || `Clase ${event.classId}`}
            </h3>
            <p className="text-sm text-gray-600">
              Profesor: {event.professor?.name || `Profesor ${event.professorId}`}
            </p>
          </div>
          <div
            className={clsx('shrink-0 rounded-full px-3 py-1 text-xs font-semibold', {
              'bg-success/10 text-success': event.status === 'confirmed',
              'bg-warning/10 text-warning': event.status === 'candidate',
            })}
          >
            {event.status === 'confirmed' ? 'Confirmado' : 'Candidato'}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <SlotTime event={event} />
        </div>

        {/* Modalidades */}
        <div className="mb-5 flex items-center gap-4 text-sm text-gray-600">
          <ModalityIcons isGroup={isGroup} isRemote={isRemote} showLabels={true} />
        </div>

        <LocationInfo location={event.location} />

        {/* Información de reservas destacada con separador */}
        <div className="border-t border-gray-100 pt-4">
          <ReservationInfo event={event} />
        </div>
      </div>

      {/* CTA en la parte inferior con fondo */}
      {action && <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">{action}</div>}
    </div>
  );
}
