import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookOpen, Calendar, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { fetchStudentCourseById } from '@client/courses';
import { createReservation } from '@client/reservations';

import clsx from 'clsx';
import type { IClass, IProfessor } from '@/interfaces/events/IEvent';

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
  const [reserveSuccess, setReserveSuccess] = useState('');

  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const course = await fetchStudentCourseById(Number(courseId));
        setCourse(course);
        console.log(course);
      } catch (err: any) {
        setError(err.message || 'Error loading course');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleReserve = async (slotId: number) => {
    setReserveLoading(slotId);
    setReserveError({});
    setReserveSuccess('');
    try {
      await createReservation(slotId);
      setReserveSuccess('Reservation successful!');
    } catch (err: any) {
      setReserveError({ [slotId]: 'Error reserving slot: ' + err.message });
    } finally {
      setReserveLoading(null);
    }
  };

  return (
    <div className="bg-base-100 min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
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
                  <p className="text-base-content/70 mt-2 text-lg">{course.description}</p>
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
              {course.classes.map((cls) => (
                <div key={cls.id} className="bg-base-200 border-base-300 collapse border">
                  <input type="checkbox" />

                  <div className="collapse-title text-lg font-medium">
                    <div className="card transition-all hover:shadow-xl">
                      <div className="card-body">
                        <h3 className="card-title text-secondary flex items-start justify-between">
                          <span className="line-clamp-2">{cls.title}</span>
                          <span
                            className={clsx(
                              'badge gap-1',
                              cls.isActive ? 'badge-success' : 'badge-error'
                            )}
                          >
                            {cls.isActive ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>{cls.isActive ? 'Activa' : 'Inactiva'}</span>
                          </span>
                        </h3>
                        <p className="text-base-content/70 line-clamp-3 text-sm">
                          {cls.description || 'Sin descripción disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content">
                    {cls.slots && cls.slots.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {cls.slots.map((slot) => {
                          const start = new Date(slot.startTime);
                          const end = new Date(slot.endTime);
                          return (
                            <div
                              key={slot.id}
                              className="bg-base-100 card transition hover:shadow-lg"
                            >
                              <div className="card-body">
                                <h3 className="text-secondary card-title text-base">
                                  {start.toLocaleDateString('es', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </h3>
                                <p className="text-base-content/70">
                                  {start.toLocaleTimeString('es', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {' - '}
                                  {end.toLocaleTimeString('es', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>

                                {reserveError[slot.id] && (
                                  <div className="alert alert-error shadow-lg">
                                    <XCircle className="h-6 w-6" />
                                    <span>{reserveError[slot.id]}</span>
                                  </div>
                                )}

                                <div className="card-actions mt-3 justify-end">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleReserve(slot.id)}
                                    disabled={reserveLoading === slot.id}
                                  >
                                    {reserveLoading === slot.id ? (
                                      <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Reservando...
                                      </span>
                                    ) : (
                                      'Reservar'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-base-100 card">
                        <div className="card-body items-center text-center">
                          <Clock className="text-base-content/40 h-8 w-8" />
                          <p className="text-base-content/70">
                            No hay horarios disponibles para esta clase.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
