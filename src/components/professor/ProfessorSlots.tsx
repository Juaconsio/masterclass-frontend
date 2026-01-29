import { useEffect, useState } from 'react';
import { professorSlotsClient } from '@/client/professor/slots';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Users, MapPin, Monitor } from 'lucide-react';
import type { ISlot } from '@/interfaces';

export default function ProfessorSlots() {
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'booked' | 'completed'>('all');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = await professorSlotsClient.getAll();
      setSlots(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (slot: ISlot) => {
    const now = new Date();
    const slotDate = parseISO(slot.startTime);
    const reservationsCount = slot.reservations?.length || 0;
    const maxStudents = slot.maxStudents || 1;

    if (slotDate < now) {
      return <span className="badge badge-neutral">Completado</span>;
    }
    if (reservationsCount >= maxStudents) {
      return <span className="badge badge-error">Sin cupos</span>;
    }
    if (reservationsCount > 0) {
      return <span className="badge badge-warning">Reservado</span>;
    }
    return <span className="badge badge-success">Disponible</span>;
  };

  const filteredSlots = slots.filter((slot) => {
    if (filter === 'all') return true;

    const now = new Date();
    const slotDate = parseISO(slot.startTime);
    const reservationsCount = slot.reservations?.length || 0;
    const maxStudents = slot.maxStudents || 1;

    if (filter === 'completed') return slotDate < now;
    if (filter === 'booked') return reservationsCount > 0 && slotDate >= now;
    if (filter === 'available') return reservationsCount === 0 && slotDate >= now;

    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-24 w-full"></div>
        <div className="skeleton h-24 w-full"></div>
        <div className="skeleton h-24 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis Horarios</h1>
        <p className="text-base-content/70 mt-2">Gestiona tus slots y reservas</p>
      </div>

      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({slots.length})
        </button>
        <button
          className={`tab ${filter === 'available' ? 'tab-active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Disponibles
        </button>
        <button
          className={`tab ${filter === 'booked' ? 'tab-active' : ''}`}
          onClick={() => setFilter('booked')}
        >
          Reservados
        </button>
        <button
          className={`tab ${filter === 'completed' ? 'tab-active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completados
        </button>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center">
            <Calendar className="text-base-content/40 h-16 w-16" />
            <h2 className="card-title">No hay horarios para mostrar</h2>
            <p className="text-base-content/70">
              {filter === 'all'
                ? 'No tienes horarios asignados aún.'
                : `No hay horarios con el filtro "${filter}".`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSlots.map((slot) => (
            <div key={slot.id} className="card bg-base-100 shadow-lg transition-all">
              <div className="card-body">
                <div className="hover:bg-base-200 flex flex-col gap-4 hover:shadow-xl md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{slot.class?.title}</h3>
                      {getStatusBadge(slot)}
                    </div>
                    <p className="text-base-content/70 text-sm">
                      {slot.class?.course?.acronym} - {slot.class?.course?.title}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(parseISO(slot.startTime), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(parseISO(slot.startTime), 'HH:mm', { locale: es })} -{' '}
                          {format(parseISO(slot.endTime), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span>
                          {slot.reservations?.length || 0}/{slot.maxStudents || 1} estudiantes
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {slot.modality === 'remote' ? (
                          <>
                            <Monitor className="h-4 w-4" />
                            <span>Remoto</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4" />
                            <span>Presencial</span>
                          </>
                        )}
                      </div>
                    </div>

                    {slot.reservations && slot.reservations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold">Estudiantes inscritos:</p>
                        <ul className="mt-1 space-y-1">
                          {slot.reservations.map((reservation) => (
                            <li key={reservation.id} className="text-base-content/70 text-sm">
                              • {reservation.student?.name || `Estudiante ${reservation.studentId}`}
                              <span
                                className={`badge badge-xs ml-2 ${
                                  reservation.status === 'confirmed'
                                    ? 'badge-success'
                                    : reservation.status === 'cancelled'
                                      ? 'badge-error'
                                      : 'badge-warning'
                                }`}
                              >
                                {reservation.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
