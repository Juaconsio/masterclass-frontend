import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { BookOpen, Calendar, Loader2, XCircle } from 'lucide-react';
import { fetchStudentCourseById } from '@client/courses';
import { createReservation } from '@client/reservations';
import SuccessModal from './reservations/SucessModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import type { IClass, IProfessor, IEvent } from '@/interfaces/events/IEvent';
import { SlotInfo } from './slots';

interface Course {
  id: number;
  title: string;
  description?: string;
  classes: IClass[];
  professors: IProfessor[];
}

const StudentCourseView: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  // const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserveLoading, setReserveLoading] = useState<number | null>(null);
  const [reserveError, setReserveError] = useState<Record<number, string>>({});
  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeDayPerClass, setActiveDayPerClass] = useState<Record<number, number>>({});

  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const course = await fetchStudentCourseById(Number(courseId));
        setCourse(course);
      } catch (err: any) {
        setError(err.message || 'Error loading course');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  // Función para agrupar slots por día dentro de una clase
  const groupSlotsByDay = (slots: any[]) => {
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
      {} as Record<string, { date: Date; dateKey: string; slots: any[] }>
    );

    return Object.values(grouped).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
  };

  const handleReserve = async (slotId: number) => {
    setReserveLoading(slotId);
    setReserveError({});
    try {
      const response = await createReservation(slotId);
      if (response) {
        setReservation(response.reservation);
        setPayment(response.payment);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setReserveError({ [slotId]: 'Error reserving slot: ' + err.message });
    } finally {
      setReserveLoading(null);
    }
  };

  return (
    <div className="bg-base-100 min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {showSuccessModal && reservation && payment && (
          <SuccessModal
            reservation={reservation}
            payment={payment}
            setShowModal={setShowSuccessModal}
          />
        )}

        {/* Course Header */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-base-content ml-3">Cargando curso...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <XCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        {course && (
          <div className="bg-base-200 card shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary rounded-xl p-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h1 className="card-title text-primary text-3xl font-bold">{course.title}</h1>
                  <p className="text-base-content/70 mt-2 line-clamp-3 text-lg">
                    {course.description || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="text-primary h-6 w-6" />
            <h2 className="text-primary text-2xl font-semibold">Clases disponibles</h2>
          </div>

          {loading ? (
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
          ) : course && course.classes?.length > 0 ? (
            <div className="flex flex-col gap-4">
              {course.classes.map((cls) => {
                const slotsByDay = groupSlotsByDay(cls.slots || []);
                const activeDay = activeDayPerClass[cls.id] || 0;

                return (
                  <div key={cls.id} className="bg-base-200 border-base-300 collapse border">
                    <input type="checkbox" />

                    <div className="collapse-title text-lg font-medium">
                      <div className="card transition-all hover:shadow-xl">
                        <div className="card-body">
                          <h3 className="card-title text-secondary flex items-start justify-between">
                            <span className="line-clamp-2">{cls.title}</span>
                            <span>
                              {cls.slots?.some(
                                (slot) => slot.reservations && slot.reservations?.length > 0
                              )
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
                          {/* Tabs por día dentro de cada clase */}
                          {slotsByDay.length > 1 && (
                            <div role="tablist" className="tabs tabs-boxed mb-4">
                              {slotsByDay.map((dayGroup: any, index: number) => (
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

                          {/* Contenido de cada día */}
                          {slotsByDay.map((dayGroup: any, dayIndex: number) => (
                            <div
                              key={dayGroup.dateKey}
                              className={activeDay === dayIndex ? '' : 'hidden'}
                            >
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {dayGroup.slots.map((slot: any) => {
                                  const confirmedReservations =
                                    slot.reservations?.filter((r: any) => r.status === 'confirmed')
                                      .length || 0;
                                  const availableSpots =
                                    (slot.maxStudents || 0) - confirmedReservations;
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
                                                isFull || hasReservation
                                                  ? 'btn-disabled'
                                                  : 'btn-primary'
                                              )}
                                              onClick={() => handleReserve(slot.id)}
                                              disabled={
                                                reserveLoading === slot.id ||
                                                isFull ||
                                                hasReservation
                                              }
                                            >
                                              {reserveLoading === slot.id ? (
                                                <span className="flex items-center gap-2">
                                                  <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                                  Reservando...
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
          ) : (
            <div className="bg-base-200 card">
              <div className="card-body items-center text-center">
                <Calendar className="text-base-content/40 h-8 w-8" />
                <p className="text-base-content/70">No se encontraron clases disponibles.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourseView;
