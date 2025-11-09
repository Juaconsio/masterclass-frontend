import { Users, User, Monitor, MapPin } from 'lucide-react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';

interface SlotDisplayProps {
  event: IEvent;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

// Mapeo de colores por estado
const STATUS_STYLES: Record<string, string> = {
  CANDIDATE: 'bg-yellow-500 border-yellow-700',
  candidate: 'bg-yellow-500 border-yellow-700',
  CONFIRMED: 'bg-green-500 border-green-700',
  confirmed: 'bg-green-500 border-green-700',
  CANCELLED: 'bg-red-500 border-red-700',
  cancelled: 'bg-red-500 border-red-700',
  COMPLETED: 'bg-gray-500 border-gray-700',
  completed: 'bg-gray-500 border-gray-700',
};

export default function SlotDisplay({
  event,
  onClick,
  variant = 'default',
  className,
}: SlotDisplayProps) {
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.CANDIDATE;
  const isGroup = event.studentsGroup === 'group';
  const isRemote = event.modality === 'remote';

  // Variante compacta (para listas)
  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 rounded-lg border-l-4 bg-white p-3 shadow transition-all hover:shadow-md',
          statusStyle.split(' ')[1],
          onClick && 'cursor-pointer hover:brightness-95',
          className
        )}
        onClick={onClick}
      >
        <div className={`h-3 w-3 rounded-full ${statusStyle.split(' ')[0]}`} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">
            {event.class?.title || `Clase ${event.classId}`}
          </h4>
          <p className="text-xs text-gray-600">
            {event.professor?.name || `Profesor ${event.professorId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isGroup ? (
            <Users className="h-4 w-4 text-gray-600" />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
          {isRemote ? (
            <Monitor className="h-4 w-4 text-gray-600" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-600" />
          )}
        </div>
      </div>
    );
  }

  // Variante detallada (para cards grandes)
  if (variant === 'detailed') {
    return (
      <div
        className={clsx(
          'rounded-lg border-2 bg-white p-4 shadow-md transition-all',
          statusStyle,
          onClick && 'cursor-pointer hover:shadow-lg',
          className
        )}
        onClick={onClick}
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {event.class?.title || `Clase ${event.classId}`}
            </h3>
            <p className="text-sm text-gray-600">
              {event.professor?.name || `Profesor ${event.professorId}`}
            </p>
          </div>
          <div className={`h-4 w-4 rounded-full ${statusStyle.split(' ')[0]}`} />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            {isGroup ? (
              <>
                <Users className="h-4 w-4" />
                <span>Grupal</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Individual</span>
              </>
            )}
          </div>
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

        {event.location && (
          <div className="mt-2 text-xs text-gray-500">
            <MapPin className="mr-1 inline h-3 w-3" />
            {event.location}
          </div>
        )}
      </div>
    );
  }

  // Variante default (para calendario con posicionamiento absoluto)
  return (
    <div
      className={clsx(
        'overflow-hidden rounded border-2 bg-white/95 shadow-md transition-all duration-150',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full flex-col p-1.5">
        {/* Título del curso */}
        <h3 className="truncate text-xs font-bold text-gray-900">
          {event.class?.title || `Clase ${event.classId}`}
        </h3>

        {/* Profesor */}
        <p className="truncate text-[10px] text-gray-600">
          {event.professor?.name || `Profesor ${event.professorId}`}
        </p>

        {/* Iconos de modalidad y tipo de clase */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <div className="flex items-center gap-1">
            {/* Icono de grupo/individual */}
            {isGroup ? (
              <Users className="h-3 w-3 text-gray-700" />
            ) : (
              <User className="h-3 w-3 text-gray-700" />
            )}

            {/* Icono de modalidad */}
            {isRemote ? (
              <Monitor className="h-3 w-3 text-gray-700" />
            ) : (
              <MapPin className="h-3 w-3 text-gray-700" />
            )}
          </div>

          <div className={`h-2 w-2 rounded-full ${statusStyle.split(' ')[0]}`} />
        </div>
      </div>
    </div>
  );
}

// Export también los estilos de estado para uso externo si es necesario
export { STATUS_STYLES };
