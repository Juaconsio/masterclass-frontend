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
  showLabels = false,
}: {
  isGroup: boolean;
  isRemote: boolean;
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
            {showLabels && <span>Individual</span>}
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
  const confirmedReservations =
    event.reservations?.filter((r) => r.status === 'confirmed').length || 0;
  const totalReservations = event.reservations?.length || 0;
  const maxStudents = event.maxStudents || 0;
  const minStudents = event.minStudents || 1;
  const availableSpots = maxStudents - confirmedReservations;
  const isFull = availableSpots <= 0;
  const isMinReached = confirmedReservations >= minStudents;

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1">
        <span className="font-medium text-gray-700">Reservas:</span>
        <span
          className={clsx('font-semibold', {
            'text-success': isMinReached && !isFull,
            'text-warning': !isMinReached,
            'text-error': isFull,
          })}
        >
          {confirmedReservations}/{maxStudents}
        </span>
      </div>
      <div className="text-gray-500">
        {isFull ? (
          <span className="text-error font-medium">Sin cupos</span>
        ) : (
          <span>
            {availableSpots} {availableSpots === 1 ? 'cupo disponible' : 'cupos disponibles'}
          </span>
        )}
      </div>
      {minStudents > 1 && (
        <div className="text-gray-500">
          <span>Mín: {minStudents}</span>
        </div>
      )}
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

  // Variante para estudiantes (para vista de curso con tabs por día)
  if (variant === 'student') {
    return (
      <div
        className={clsx(
          'bg-base-100 card transition hover:shadow-lg',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="card-body gap-3 p-4">
          {/* Header con fecha y horario */}
          <SlotTime event={event} compact />
          <SlotMetadata event={event} />
          <ModalityIcons isGroup={isGroup} isRemote={isRemote} showLabels={true} />

          {/* Ubicación si existe */}
          <LocationInfo location={event.location} />

          <div className="divider my-0"></div>

          {/* Info de reservas */}
          <ReservationInfo event={event} />

          {/* Acción (botón de reservar, etc.) */}
          {action && <div className="card-actions mt-2 justify-end">{action}</div>}
        </div>
      </div>
    );
  }

  // Variante detallada (para cards grandes)
  return (
    <div
      className={clsx(
        'rounded-lg border-2 bg-white p-4 shadow-md transition-all',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <SlotTitle event={event} variant="detailed" />
          <SlotTime event={event} />
          <SlotMetadata event={event} />
        </div>
        <StatusIndicator statusStyle={statusStyle} size="md" />
      </div>

      <LocationInfo location={event.location} />

      <div className="flex items-center justify-between gap-4 text-sm text-gray-700">
        <ModalityIcons isGroup={isGroup} isRemote={isRemote} showLabels={true} />
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
