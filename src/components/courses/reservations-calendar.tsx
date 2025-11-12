'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon, Clock } from 'lucide-react';

type ReservationsCalendarProps = {
  reservationsByDate?: Record<string, any[]>;
  slots?: any[];
  classes?: any[];
  courses?: any[];
  onDeleteReservation?: (id: number) => void | Promise<void>;
};

export function ReservationsCalendar({
  reservationsByDate: propReservationsByDate,
  slots: propSlots,
  classes: propClasses,
  courses: propCourses,
  onDeleteReservation,
}: ReservationsCalendarProps) {
  console.log('ReservationsCalendar render');
  console.log('propReservationsByDate:', propReservationsByDate);
  console.log('propSlots:', propSlots);
  console.log('propClasses:', propClasses);
  console.log('propCourses:', propCourses);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // start at the first day of the current month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonthRaw = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Augosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const reservationsMap: Record<string, any[]> =
    (propReservationsByDate as Record<string, any[]>) || {};

  const hasReservation = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservationsMap[dateStr];
  };

  const isSelectedDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const selectedReservations: any[] = selectedDate ? reservationsMap[selectedDate] || [] : [];

  const renderReservationDetails = () => {
    if (!selectedDate) return null;

    return (
      <div className="card border bg-white shadow-xl">
        <div className="card-body">
          <h3 className="text-base-content mb-4 text-lg font-bold">
            Reservas del{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CL', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          <p className="text-base-content/70 mb-4 text-sm">
            Tienes {selectedReservations?.length || 0} reserva
            {selectedReservations?.length !== 1 ? 's' : ''} este día.
          </p>

          <div className="max-h-[40vh] space-y-3 overflow-y-auto">
            {(!selectedReservations || selectedReservations.length === 0) && (
              <div className="text-base-content/70 p-4 text-center">
                No se encontraron reservas para este día.
              </div>
            )}

            {selectedReservations?.map((reservation: any) => {
              const slot =
                reservation.slot || propSlots?.find((s: any) => s.id === reservation.slotId);
              const course =
                propCourses?.find((c: any) => c.id === slot?.classId || c.id === slot?.courseId) ||
                propCourses?.find((c: any) => c.id === reservation.courseId) ||
                null;
              const classData = propClasses?.find((cl: any) => cl.id === slot?.classId) || null;
              const courseTitle = course?.title || reservation.course || 'Untitled course';
              const classTitle = classData?.title || reservation.classTitle || '';
              const instructor = slot.professor?.id;

              let timeLabel = reservation.time || '';
              if (slot?.startTime) {
                try {
                  const start = new Date(slot.startTime);
                  const end = slot.endTime ? new Date(slot.endTime) : null;
                  timeLabel = `${start.toLocaleDateString()} ${start.toLocaleTimeString()}${end ? ' - ' + end.toLocaleTimeString() : ''}`;
                } catch (e) {
                  // keep reservation.time
                }
              }

              const modality = slot?.modality || reservation.modality || reservation.type || '—';
              const status = slot?.status || reservation.status || 'scheduled';

              return (
                <div key={reservation.id} className="card border bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base-content mb-0.5 text-sm font-semibold">
                        {courseTitle}
                      </h4>
                      {classTitle && (
                        <div className="text-base-content/70 text-xs">Clase: {classTitle}</div>
                      )}
                      <p className="text-base-content/70 text-xs">Profesor: {instructor}</p>
                    </div>
                    <span className="badge badge-outline badge-sm">{modality}</span>
                  </div>
                  <div className="text-base-content/70 mb-1 flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4" />
                    <span>{timeLabel}</span>
                  </div>
                  <div className="text-base-content/70 text-xs">Status: {status}</div>
                  <div className="mt-2 flex gap-1">
                    {classData && (
                      <a
                        href={`/dashboard/session/${classData.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        Go to class
                      </a>
                    )}
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => onDeleteReservation?.(reservation.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-base-content mb-2 text-2xl font-bold">Mis Reservas</h2>
        <p className="text-base-content/70">Aquí puedes ver y administrar tus sesiones</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="card border bg-white shadow-xl">
            <div className="card-body p-6">
              <div className="mb-6 flex items-center justify-between pt-1.5">
                <h3 className="text-base-content flex items-center gap-2 text-xl font-semibold">
                  <CalendarIcon className="text-primary h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm btn-square" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="btn btn-outline btn-sm btn-square" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-base-content/60 py-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const reservation = hasReservation(day);
                  const today = new Date();
                  const isToday =
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();
                  const isSelected = isSelectedDay(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-primary-content ring-primary ring-2 ring-offset-2'
                          : 'text-base-content bg-gray-100 hover:bg-gray-200'
                      } ${isToday && !isSelected ? 'ring-accent ring-2 ring-offset-2' : ''} `}
                    >
                      <span>{day}</span>
                      {reservation && reservation.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {Array.from({ length: Math.min(reservation.length, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSelected ? 'bg-primary-content' : 'bg-primary'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-base-content/70 mt-6 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-4 w-4 rounded" />
                  <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="ring-accent h-4 w-4 rounded bg-gray-100 ring-2 ring-offset-2 ring-offset-white" />
                  <span>Hoy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                  <span>Tiene reservación</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="lg:col-span-2">{renderReservationDetails()}</div>
      </div>
    </section>
  );
}
