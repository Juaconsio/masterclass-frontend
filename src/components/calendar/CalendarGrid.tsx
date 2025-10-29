import { startOfWeek, addDays, format, getDay, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, User, Monitor, MapPin } from 'lucide-react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';

interface CalendarGridProps {
  currentWeek: Date;
  events: IEvent[];
  onEventClick: (event: IEvent) => void;
  loading?: boolean;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8);
const ROW_HEIGHT = 60; // px per slot
const HEADER_HEIGHT = 40; // Approximate header height

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

function SlotDisplay({
  event,
  pos,
  onClick,
}: {
  event: IEvent & { start: Date; end: Date; col: number; totalCols: number };
  pos: { top: number; left: number; width: number; height: number };
  onClick: () => void;
}) {
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.CANDIDATE;
  const isGroup = event.studentsGroup === 'group';
  const isRemote = event.modality === 'ONLINE' || event.modality === 'remote';

  return (
    <div
      key={event.id}
      className={clsx(
        'absolute cursor-pointer transition-all duration-150 hover:brightness-110',
        statusStyle
      )}
      style={{
        top: `${pos.top}px`,
        height: `${pos.height}px`,
        left: `${pos.left}%`,
        width: `${pos.width}%`,
        padding: '2px',
      }}
      onClick={onClick}
    >
      <div className="h-full overflow-hidden rounded border-2 bg-white/95 shadow-md transition-all duration-150 hover:shadow-lg">
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

            {/* Indicador de estado (pequeño círculo de color) */}
            <div className={`h-2 w-2 rounded-full ${statusStyle.split(' ')[0]}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarWeeklyGrid({
  currentWeek,
  events,
  loading,
  onEventClick,
}: CalendarGridProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  const minHour = HOURS[0];

  // if (loading) {
  //   return (
  //     <div className="bg-base-100 flex h-64 w-full items-center justify-center border border-black/20">
  //       <span className="text-gray-500">Cargando eventos...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-base-200 grid h-[80vh] max-h-9/10 grid-cols-8 overflow-y-scroll rounded-lg border shadow-lg">
      {/* Columna de horas */}
      <div className="border-r border-black">
        <div className="bg-base-200 sticky top-0 z-20 flex h-10 items-center justify-center border-b border-black font-medium">
          Hora / Día
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            className="pr-1s flex h-[60px] items-center justify-center border-b border-black pt-1"
          >
            {h}:00
          </div>
        ))}
      </div>

      {days.map((day, i) => {
        const highlight = !loading && isToday(day);
        const eventsOfDay = events
          .filter((e) => isSameDay(new Date(e.startTime), day))
          .map((e) => {
            const start = new Date(e.startTime);
            const end = new Date(e.endTime);
            return { ...e, start, end };
          })
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        // Algoritmo simple para asignar columnas
        const positioned: ((typeof eventsOfDay)[number] & { col: number; totalCols: number })[] =
          [];
        eventsOfDay.forEach((event) => {
          let col = 0;
          while (
            positioned.some((p) => p.col === col && event.start < p.end && event.end > p.start)
          ) {
            col++;
          }
          const overlapping = positioned.filter((p) => event.start < p.end && event.end > p.start);
          const totalCols = Math.max(1, overlapping.length + 1);
          positioned.push({ ...event, col, totalCols });
        });

        return (
          <div
            key={i}
            className={clsx(
              'relative border-r border-black/20',
              highlight  ? 'bg-base-300' : 'bg-base-100'
            )}
          >
            {/* Cabecera */}
            <div
              className={clsx(
                'sticky top-0 z-20 flex h-10 items-center justify-center border-b border-black/20 font-medium',
                highlight ? 'bg-primary text-white' : 'bg-base-200'
              )}
            >
              {format(day, 'EEE d', { locale: es })}
            </div>

            {/* Slots de tiempo */}
            {HOURS.map((h) => {
              if (loading) {
                return <div key={`skeleton-${h}`} className="skeleton m-2 h-[60px]"></div>;
              }
              return <div key={h} className="h-[60px] border-b border-black/20" />;
            })}

            {/* Render eventos con posicionamiento absoluto */}
            {positioned.map((e) => {
              const startHour = e.start.getHours() + e.start.getMinutes() / 60;
              const endHour = e.end.getHours() + e.end.getMinutes() / 60;

              // Position relative to the header (after the sticky header)
              const top = HEADER_HEIGHT + (startHour - minHour) * ROW_HEIGHT;
              const height = (endHour - startHour) * ROW_HEIGHT;
              const width = 100 / e.totalCols;
              const left = e.col * width;

              return (
                <SlotDisplay
                  event={e}
                  pos={{ top, height, width, left }}
                  key={e.id}
                  onClick={() => onEventClick(e)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
