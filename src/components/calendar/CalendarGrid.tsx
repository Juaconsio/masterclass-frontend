import { startOfWeek, addDays, format, getDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { IEvent } from "@interfaces/IEvent";

interface CalendarGridProps {
    currentWeek: Date
    events: IEvent[];
    onEventClick: (event: IEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarWeeklyGrid({
    currentWeek,
  events,
  onEventClick,
}: CalendarGridProps) {
  const today = new Date();
const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i))

  const rowHeight = 60; // px por hora
  return (
    <div className="grid grid-cols-8 border border-white/50 rounded-lg overflow-y-scroll h-[70vh] max-h-[70vh] bg-base-300">
      {/* Columna de horas */}
      <div className="border-r border-white/50">
        <div className="sticky top-0 text-white border-b border-white/50 bg-base-300 text-center font-medium">
          Hora / Día
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            className="h-[60px] text-xs text-right pr-1 border-b border-white/50"
          >
            {h}:00
          </div>
        ))}
      </div>

      {/* Columnas de días */}
      {days.map((day, i) => {
        const highlight = isToday(day);

        return (
          <div
            key={i}
            className={`
        relative border-r border-white/50
        ${highlight ? "bg-base-100" : "bg-base-300"}
      `}
          >
            {/* Cabecera */}
            <div
              className={`sticky z-20  top-0 border-b border-white/50 text-center font-medium
                      ${highlight ? "bg-primary text-white" : "bg-indigo-400"}
        `}
            >
              {format(day, "EEE d", { locale: es })}
            </div>

            {/* Horas */}
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] border-b border-white/50" />
            ))}

            {/* Eventos */}
            {events
              .filter((e) => getDay(e.start) === getDay(day))
              .map((e) => {
                const startHour =
                  e.start.getHours() + e.start.getMinutes() / 60;
                const endHour = e.end.getHours() + e.end.getMinutes() / 60;
                const top = startHour * rowHeight;
                const height = (endHour - startHour) * rowHeight;

                return (
                  <div
                    key={e.id}
                    className="absolute left-1 right-1"
                    style={{ top, height }}
                    onClick={() => onEventClick(e)}
                  >
                    <div className="card bg-primary text-primary-content shadow-md cursor-pointer hover:shadow-lg transition-all duration-150">
                      <div className="card-body p-2">
                        <h2 className="card-title text-xs truncate border-b px-2 py-1">
                          {e.title}
                        </h2>
                        {/* opcional descripción corta */}
                        {e.location && (
                          <p className="text-[10px] leading-tight line-clamp-2">
                            {e.location}
                          </p>
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
