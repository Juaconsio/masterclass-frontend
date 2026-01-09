import React, { useState } from 'react';
import { Calendar, Loader2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import type { IClass, IEvent } from '@/interfaces/events/IEvent';
import { SlotInfo } from '@components/slots';

interface CourseClassesProps {
  classes?: IClass[];
  loading?: boolean;
  reserveLoading: number | null;
  reserveError: Record<number, string>;
  onReserve: (slotId: number) => void;
}

interface DayGroup {
  date: Date;
  dateKey: string;
  slots: any[];
}

/**
 * Groups slots by day
 * @param slots - Array of slots to group
 * @returns Array of grouped slots by day
 */
function groupSlotsByDay(slots: any[]): DayGroup[] {
  const grouped = slots.reduce(
    (acc, slot) => {
      const date = new Date(slot.startTime);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date,
          dateKey,
          slots: [],
        };
      }
      acc[dateKey].slots.push(slot);
      return acc;
    },
    {} as Record<string, DayGroup>
  );

  return (Object.values(grouped) as DayGroup[]).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Course classes component displaying available sessions and slots
 * @param classes - List of classes
 * @param loading - Loading state
 * @param reserveLoading - ID of slot being reserved
 * @param reserveError - Error messages by slot ID
 * @param onReserve - Reserve callback function
 */
export function CourseReservations({
  classes = [],
  loading = false,
  reserveLoading,
  reserveError,
  onReserve,
}: CourseClassesProps) {
  const [activeDayPerClass, setActiveDayPerClass] = useState<Record<number, number>>({});

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-base-200 card shadow-lg">
            <div className="card-body">
              <div className="skeleton h-6 w-3/4"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="bg-base-200 card">
        <div className="card-body items-center text-center">
          <Calendar className="text-base-content/40 h-8 w-8" />
          <p className="text-base-content/70">No se encontraron clases disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {classes.map((cls) => {
        const slotsByDay = groupSlotsByDay(cls.slots || []);
        const activeDay = activeDayPerClass[cls.id] || 0;

        return (
          <div key={cls.id} className="border-base-300 collapse border hover:shadow-xl">
            <input type="checkbox" />

            <div className="collapse-title text-lg font-medium">
              <div className="card transition-all">
                <div className="card-body">
                  <h3 className="card-title text-secondary flex items-start justify-between">
                    <span className="line-clamp-2">{cls.title}</span>
                    <span>
                      {cls.slots?.some((slot) => slot.reservations && slot.reservations?.length > 0)
                        ? 'Reservado'
                        : 'Pendiente'}
                    </span>
                  </h3>
                  <p className="text-base-content/70 line-clamp-3 text-sm">
                    {cls.description || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>
            </div>

            <div className="collapse-content">
              {slotsByDay.length > 0 ? (
                <>
                  {slotsByDay.length > 1 && (
                    <div role="tablist" className="tabs tabs-boxed mb-4">
                      {slotsByDay.map((dayGroup, index) => (
                        <button
                          key={dayGroup.dateKey}
                          role="tab"
                          className={`tab ${activeDay === index ? 'tab-active' : ''}`}
                          onClick={() =>
                            setActiveDayPerClass((prev) => ({ ...prev, [cls.id]: index }))
                          }
                        >
                          {format(dayGroup.date, "EEE, d 'de' MMM", { locale: es })}
                        </button>
                      ))}
                    </div>
                  )}

                  {slotsByDay.map((dayGroup, dayIndex) => (
                    <div key={dayGroup.dateKey} className={activeDay === dayIndex ? '' : 'hidden'}>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {dayGroup.slots.map((slot: any) => {
                          const confirmedReservations =
                            slot.reservations?.filter((r: any) => r.status === 'confirmed')
                              .length || 0;
                          const availableSpots = (slot.maxStudents || 0) - confirmedReservations;
                          const isFull = availableSpots <= 0;
                          const hasReservation = slot.reservations?.length > 0;

                          return (
                            <div key={slot.id}>
                              <SlotInfo
                                event={slot as IEvent}
                                variant="student"
                                className={clsx(isFull && 'opacity-60')}
                                action={
                                  <>
                                    {reserveError[slot.id] && (
                                      <div className="alert alert-error mb-2 py-2 text-xs shadow-lg">
                                        <XCircle className="h-4 w-4" />
                                        <span>{reserveError[slot.id]}</span>
                                      </div>
                                    )}
                                    <button
                                      className={clsx(
                                        'btn btn-sm',
                                        isFull || hasReservation ? 'btn-disabled' : 'btn-primary'
                                      )}
                                      onClick={() => onReserve(slot.id)}
                                      disabled={
                                        reserveLoading === slot.id || isFull || hasReservation
                                      }
                                    >
                                      {reserveLoading === slot.id ? (
                                        <span className="flex items-center gap-2">
                                          <Loader2 className="h-4 w-4 animate-spin" /> Reservando...
                                        </span>
                                      ) : isFull ? (
                                        'Sin cupos'
                                      ) : hasReservation ? (
                                        'Ya reservado'
                                      ) : (
                                        'Reservar'
                                      )}
                                    </button>
                                  </>
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-base-100 card">
                  <div className="card-body items-center text-center">
                    <Calendar className="text-base-content/40 h-8 w-8" />
                    <p className="text-base-content/70">
                      No hay horarios disponibles para esta clase.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
