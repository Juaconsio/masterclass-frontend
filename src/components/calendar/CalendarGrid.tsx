import { startOfWeek, addDays, format, getDay, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IEvent } from '@interfaces/events/IEvent';

interface CalendarGridProps {
  currentWeek: Date;
  events: IEvent[];
  onEventClick: (event: IEvent) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8);

export default function CalendarWeeklyGrid({
  currentWeek,
  events,
  onEventClick,
}: CalendarGridProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  const rowHeight = 60; // px por slot
  const minHour = HOURS[0];
  return (
    <div className="bg-base-300 grid h-[70vh] max-h-[70vh] grid-cols-8 overflow-y-scroll rounded-lg border border-white/50">
      {/* Columna de horas */}
      <div className="border-r border-white/50">
        <div className="bg-base-300 sticky top-0 border-b border-white/50 text-center font-medium text-white">
          Hora / Día
        </div>
        {HOURS.map((h) => (
          <div key={h} className="h-[60px] border-b border-white/50 pr-1 text-right text-xs">
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
              highlight ? 'bg-base-100' : 'bg-base-300'
            } `}
          >
            {/* Cabecera */}
            <div
              className={`sticky top-0 z-20 border-b border-white/50 text-center font-medium ${
                highlight ? 'bg-primary text-white' : 'bg-indigo-400'
              } `}
            >
              {format(day, 'EEE d', { locale: es })}
            </div>

            {HOURS.map((h) => (
              <div key={h} className="h-[60px] border-b border-white/50" />
            ))}

            {/* Render eventos con ancho dinámico */}
            {positioned.map((e) => {
              const startHour = e.start.getHours() + e.start.getMinutes() / 60;
              const endHour = e.end.getHours() + e.end.getMinutes() / 60;
              const top = (startHour - minHour) * rowHeight;
              const height = (endHour - startHour) * rowHeight;
              const width = 100 / e.totalCols;
              const left = e.col * width;

              return (
                <div
                  key={e.id}
                  className="bg-primary absolute"
                  style={{
                    top,
                    height,
                    left: `${left}%`,
                    width: `${width}%`,
                    padding: '2px',
                  }}
                  onClick={() => onEventClick(e)}
                >
                  <div className="text-primary-content cursor-pointer border-2 border-black shadow-md transition-all duration-150 hover:shadow-lg">
                    <div className="p-2">
                      <h2 className="truncate border-b px-2 py-1 text-xs">
                        Slot {e.id} - Class {e.classId} - Prof {e.professorId}
                      </h2>
                      {e.modality && (
                        <p className="line-clamp-2 text-[10px] leading-tight">{e.modality}</p>
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
