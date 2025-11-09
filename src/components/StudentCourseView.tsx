import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookOpen, Calendar, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { fetchStudentCourseById } from '@client/courses';
import { createReservation } from '@client/reservations';
import SuccessModal from './reservations/SucessModal';

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
  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
  }, []);

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
              {course.classes.map((cls) => (
                <div key={cls.id} className="bg-base-200 border-base-300 collapse border">
                  <input type="checkbox" />

                  <div className="collapse-title text-lg font-medium">
                    <div className="card transition-all hover:shadow-xl">
                      <div className="card-body">
                        <h3 className="card-title text-secondary flex items-start justify-between">
                          <span className="line-clamp-2">{cls.title}</span>
                          <span>
                            {cls.slots?.some((slot) => slot.reservations?.length > 0)
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
                    {cls.slots && cls.slots.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {cls.slots.map((slot) => {
                          const start = new Date(slot.startTime);
                          const end = new Date(slot.endTime);
                          const reservations = slot.reservations || [];
                          const confirmedReservations = reservations.filter(
                            (r) => r.status === 'confirmed'
                          ).length;
                          const pendingReservations = reservations.filter(
                            (r) => r.status === 'pending'
                          ).length;
                          const totalReservations = reservations.length;
                          const availableSpots = (slot.maxStudents || 0) - confirmedReservations;
                          const isFull = availableSpots <= 0;

                          return (
                            <div
                              key={slot.id}
                              className={clsx(
                                'bg-base-100 card transition hover:shadow-lg',
                                isFull && 'opacity-60'
                              )}
                            >
                              <div className="card-body">
                                {/* Header con fecha y badges */}
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-secondary card-title flex-1 text-base">
                                    {start.toLocaleDateString('es', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </h3>
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={clsx(
                                        'badge badge-sm',
                                        slot.modality === 'remote' ? 'badge-info' : 'badge-success'
                                      )}
                                    >
                                      {slot.modality === 'remote' ? '💻 Online' : '📍 Presencial'}
                                    </span>
                                    <span
                                      className={clsx(
                                        'badge badge-sm',
                                        slot.studentsGroup === 'group'
                                          ? 'badge-secondary'
                                          : 'badge-accent'
                                      )}
                                    >
                                      {slot.studentsGroup === 'group'
                                        ? '👥 Grupal'
                                        : '👤 Individual'}
                                    </span>
                                  </div>
                                </div>

                                {/* Horario */}
                                <p className="text-base-content/70 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
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

                                {/* Ubicación */}
                                {slot.location && (
                                  <p className="text-base-content/60 text-sm">📍 {slot.location}</p>
                                )}

                                <div className="divider my-2"></div>

                                {/* <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-base-content/70">Cupos disponibles:</span>
                                    <span
                                      className={clsx(
                                        'font-semibold',
                                        isFull ? 'text-error' : 'text-success'
                                      )}
                                    >
                                      {availableSpots} / {slot.maxStudents || 0}
                                    </span>
                                  </div>

                                  <div className="bg-base-300 h-2 w-full rounded-full">
                                    <div
                                      className={clsx(
                                        'h-2 rounded-full transition-all',
                                        isFull ? 'bg-error' : 'bg-success'
                                      )}
                                      style={{
                                        width: `${(((slot.maxStudents || 0) - availableSpots) / (slot.maxStudents || 1)) * 100}%`,
                                      }}
                                    ></div>
                                  </div>

                                  {totalReservations > 0 && (
                                    <div className="flex gap-2 text-xs">
                                      {confirmedReservations > 0 && (
                                        <span className="badge badge-success badge-xs gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          {confirmedReservations} confirmada
                                          {confirmedReservations !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {pendingReservations > 0 && (
                                        <span className="badge badge-warning badge-xs gap-1">
                                          <Clock className="h-3 w-3" />
                                          {pendingReservations} pendiente
                                          {pendingReservations !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>  */}
                                {reserveError[slot.id] && (
                                  <div className="alert alert-error py-2 text-xs shadow-lg">
                                    <XCircle className="h-4 w-4" />
                                    <span>{reserveError[slot.id]}</span>
                                  </div>
                                )}

                                {/* TODO Un boton para eliminar reservas */}
                                <div className="card-actions mt-3 justify-end">
                                  <button
                                    className={clsx(
                                      'btn btn-sm',
                                      isFull || slot.reservations?.length > 0
                                        ? 'btn-disabled'
                                        : 'btn-primary'
                                    )}
                                    onClick={() => handleReserve(slot.id)}
                                    disabled={
                                      reserveLoading === slot.id ||
                                      isFull ||
                                      slot.reservations?.length > 0
                                    }
                                  >
                                    {reserveLoading === slot.id ? (
                                      <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Reservando...
                                      </span>
                                    ) : isFull ? (
                                      'Sin cupos'
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
