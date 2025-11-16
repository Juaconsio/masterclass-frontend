import { Users, User, Monitor, MapPin } from 'lucide-react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';
import { STATUS_STYLES } from './index';

interface SlotThumbnailProps {
  event: IEvent;
  onClick?: () => void;
  className?: string;
  statusStyle?: string; // Ahora es opcional
}

/**
 * Componente para mostrar un slot de forma compacta en el calendario.
 * Vista minimalista optimizada para posicionamiento absoluto en grids de calendario.
 */
export default function SlotThumbnail({
  event,
  onClick,
  className,
  statusStyle: providedStatusStyle,
}: SlotThumbnailProps) {
  const isGroup = event.studentsGroup === 'group';
  const isRemote = event.modality === 'remote';

  // Calcular statusStyle basado en el status del evento si no se proporciona
  const statusStyle =
    providedStatusStyle ||
    STATUS_STYLES[event.status as keyof typeof STATUS_STYLES] ||
    STATUS_STYLES.available;

  return (
    <div
      className={clsx(
        'overflow-hidden rounded border-2 bg-white/95 shadow-md transition-all duration-150',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full flex-col gap-0 px-1 py-0.5">
        {/* Título del curso */}
        <div>
          <h3 className="z-20 truncate text-xs font-bold text-gray-900">
            {event.class?.title || `Clase ${event.classId}`}
          </h3>
        </div>

        {/* Profesor y metadata */}
        <div className="inline-flex items-end justify-between pt-1">
          <div className="flex flex-col justify-between truncate">
            <p className="truncate text-[10px] text-gray-600">
              {event.professor?.name || `Profesor ${event.professorId}`}
            </p>
            <p className="truncate text-[10px] text-gray-500">
              {event.class?.course?.acronym || `Curso ${event.class?.courseId}`}
            </p>
          </div>

          {/* Iconos de modalidad y tipo de clase */}
          <div className="mt-auto flex items-center justify-between gap-0.5 pt-1">
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
    </div>
  );
}
