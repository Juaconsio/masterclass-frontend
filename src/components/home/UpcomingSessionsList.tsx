import { useMemo } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, FileText, Video } from 'lucide-react';
import type { IReservation } from '@/interfaces';

type UpcomingSessionsListProps = {
  reservations: IReservation[];
  selectedDate: string | null;
};

/** Reservations whose slot.startTime is between today and today+7 days */
function filterWeekReservations(reservations: IReservation[]): IReservation[] {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return reservations.filter((r) => {
    const t = r.slot?.startTime ? new Date(r.slot.startTime) : null;
    if (!t) return false;
    return t >= start && t < end && ['confirmed', 'pending'].includes(r.status);
  });
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function UpcomingSessionsList({ reservations, selectedDate }: UpcomingSessionsListProps) {
  const weekReservations = useMemo(() => filterWeekReservations(reservations), [reservations]);

  const filtered = useMemo(() => {
    if (!selectedDate) return weekReservations;
    return weekReservations.filter((r) => {
      const t = r.slot?.startTime ? new Date(r.slot.startTime) : null;
      return t ? getDateKey(t) === selectedDate : false;
    });
  }, [weekReservations, selectedDate]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const ta = a.slot?.startTime ? new Date(a.slot.startTime).getTime() : 0;
        const tb = b.slot?.startTime ? new Date(b.slot.startTime).getTime() : 0;
        return ta - tb;
      }),
    [filtered]
  );

  if (sorted.length === 0) {
    return (
      <div className="card border">
        <div className="card-body">
          <h3 className="card-title text-primary mb-2 flex items-center gap-2 text-sm font-semibold">
            <Video className="text-primary h-4 w-4" />
            Sesiones de la semana
          </h3>
          <p className="text-base-content/80 text-xs">
            {selectedDate ? 'No hay sesiones este día.' : 'No tienes sesiones esta semana.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border">
      <div className="card-body">
        <h3 className="card-title mb-2 flex items-center gap-2 text-sm font-semibold">
          <Video className="text-primary h-4 w-4" />
          Sesiones de la semana
        </h3>
        <ul className="space-y-2">
          {sorted.map((r) => {
            const slot = r.slot;
            const start = slot?.startTime ? new Date(slot.startTime) : null;
            const courseId = slot?.class?.courseId;
            const classId = slot?.class?.id;
            const hasMaterial = courseId != null && classId != null;
            return (
              <li
                key={r.id}
                className="border-base-300 flex flex-col gap-1 rounded-md border p-2 text-xs"
              >
                {start && (
                  <span className="text-base-content/80 font-medium">
                    {format(start, 'EEE d MMM, HH:mm', { locale: es })}
                  </span>
                )}
                <span className="text-base-content/80">
                  {slot?.class?.title ?? 'Clase'} · {slot?.class?.course?.acronym ?? ''}
                </span>
                <ul className="menu menu-horizontal menu-xs p-0 [&_li>*]:rounded-none">
                  {hasMaterial && (
                    <li>
                      <Link
                        to={`/app/cursos/${courseId}/clases/${classId}`}
                        className="text-primary mt-1 flex w-fit items-center gap-1 hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        Ver material
                      </Link>
                    </li>
                  )}
                  {r.status === 'confirmed' && (
                    <li>
                      <Link
                        to={`/app/reservas/${r.id}`}
                        className="text-primary mt-1 flex w-fit items-center gap-1 hover:underline"
                      >
                        <Video className="h-3 w-3" />
                        Ver sesión
                      </Link>
                    </li>
                  )}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
