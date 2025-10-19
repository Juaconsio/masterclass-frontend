import { startOfWeek, addDays, format, getDay, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IEvent } from '@interfaces/events/IEvent';

interface CalendarGridProps {
  currentWeek: Date;
  events: IEvent[];
  onEventClick: (event: IEvent) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8);
const ROW_HEIGHT = 60; // px per slot
const HEADER_HEIGHT = 40; // Approximate header height

export default function CalendarWeeklyGrid({
  currentWeek,
  events,
  onEventClick,
}: CalendarGridProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  const minHour = HOURS[0];

  return (
    <div className="bg-base-200 grid h-[70vh] max-h-[70vh] grid-cols-8 overflow-y-scroll rounded-lg border-white/50 shadow-lg">
      {/* Columna de horas */}
      <div className="border-r border-white/50">
        <div className="bg-base-200 sticky top-0 z-20 flex h-10 items-center justify-center border-b border-white/50 font-medium">
          Hora / Día
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex h-[60px] items-start justify-end border-b border-white/50 pt-1 pr-1 text-xs"
          >
            {h}:00
          </div>
        ))}
      </div>

      {days.map((day, i) => {
        const highlight = isToday(day);
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
            className={`relative border-r border-white/50 ${
              highlight ? 'bg-base-300' : 'bg-base-100'
            }`}
          >
            {/* Cabecera */}
            <div
              className={`sticky top-0 z-20 flex h-10 items-center justify-center border-b border-white/50 font-medium ${
                highlight ? 'bg-primary text-white' : 'bg-base-200'
              }`}
            >
              {format(day, 'EEE d', { locale: es })}
            </div>

            {/* Slots de tiempo */}
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] border-b border-white/50" />
            ))}

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
                <div
                  key={e.id}
                  className="bg-primary absolute cursor-pointer"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                    padding: '2px',
                  }}
                  onClick={() => onEventClick(e)}
                >
                  <div className="text-primary-content h-full overflow-hidden border-2 border-black shadow-md transition-all duration-150 hover:shadow-lg">
                    <div className="flex h-full flex-col p-2">
                      <h2 className="truncate border-b px-2 py-1 text-xs font-semibold">
                        Slot {e.id} - Class {e.classId} - Prof {e.professorId}
                      </h2>
                      {e.modality && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-tight">{e.modality}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
