import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IReservation } from '@/interfaces';
import { Calendar } from 'lucide-react';

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type WeekCalendarProps = {
  reservations: IReservation[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
};

/** Returns [startOfToday, ... 6 more days] as YYYY-MM-DD */
function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

export function WeekCalendar({ reservations, selectedDate, onSelectDate }: WeekCalendarProps) {
  const weekDates = useMemo(() => getWeekDates(), []);

  const reservationsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservations) {
      const start = r.slot?.startTime ? new Date(r.slot.startTime) : null;
      if (!start) continue;
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [reservations]);

  return (
    <div className="card border">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2 text-sm font-medium">
          <Calendar className="text-primary h-3 w-3" />
          Esta semana
        </h3>
        <div className="text-base-content/80 grid grid-cols-7 gap-1">
          {weekDates.map((dateKey) => {
            const d = new Date(dateKey + 'T12:00:00');
            const dayName = DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1];
            const count = reservationsByDate[dateKey] ?? 0;
            const isSelected = selectedDate === dateKey;
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                className={`flex flex-col items-center rounded-md p-2 text-xs transition-colors ${
                  isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                }`}
              >
                <span
                  className={`${isSelected ? 'text-primary-content' : 'text-base-content/80'}`}
                >
                  {dayName}
                </span>
                <span
                  className={`${isSelected ? 'text-primary-content' : 'text-base-content/80'} mt-0.5 font-semibold`}
                >
                  {format(d, 'd', { locale: es })}
                </span>
                {count > 0 && (
                  <span
                    className={`bg-primary text-primary-content mx-auto my-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold select-none ${isSelected ? 'ring-accent ring-offset-primary ring-1 ring-offset-1' : ''} `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
