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
    <div className="bg-base-300 grid h-[70vh] max-h-[70vh] grid-cols-8 overflow-y-scroll rounded-lg border border-white/50">
      {/* Columna de horas */}
      <div className="border-r border-white/50">
        <div className="bg-base-300 sticky top-0 z-20 h-10 border-b border-white/50 flex items-center justify-center font-medium text-white">
          Hora / Día
        </div>
        {HOURS.map((h) => (
          <div key={h} className="h-[60px] border-b border-white/50 pr-1 flex items-start justify-end text-xs pt-1">
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
        const positioned: ((typeof eventsOfDay)[number] & { col: number; totalCols: number })[] = [];
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
              highlight ? 'bg-base-100' : 'bg-base-300'
            }`}
          >
            {/* Cabecera */}
            <div
              className={`sticky top-0 z-20 h-10 border-b border-white/50 flex items-center justify-center font-medium ${
                highlight ? 'bg-primary text-white' : 'bg-indigo-400'
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
                  <div className="text-primary-content h-full border-2 border-black shadow-md transition-all duration-150 hover:shadow-lg overflow-hidden">
                    <div className="p-2 h-full flex flex-col">
                      <h2 className="truncate border-b px-2 py-1 text-xs font-semibold">
                        Slot {e.id} - Class {e.classId} - Prof {e.professorId}
                      </h2>
                      {e.modality && (
                        <p className="line-clamp-2 text-[10px] leading-tight mt-1">{e.modality}</p>
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