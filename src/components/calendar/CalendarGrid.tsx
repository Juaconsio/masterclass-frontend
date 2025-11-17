import { startOfWeek, addDays, format, getDay, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { SlotThumbnail } from '../slots';
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

export default function CalendarWeeklyGrid({
  currentWeek,
  events,
  loading,
  onEventClick,
}: CalendarGridProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  const minHour = HOURS[0];

  return (
    <div className="bg-base-200 mb-4 grid h-[78vh] max-h-9/10 grid-cols-8 overflow-y-scroll rounded-lg border shadow-lg">
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
              highlight ? 'bg-base-300' : 'bg-base-100'
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
                <div
                  key={e.id}
                  className="absolute cursor-pointer transition-all duration-150 hover:brightness-110"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                    padding: '2px',
                  }}
                >
                  <SlotThumbnail event={e} onClick={() => onEventClick(e)} className="h-full" />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
