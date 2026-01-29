import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyProfessorDashboard } from '@/client/professors';
import { BookOpen, Calendar, Users, Clock, User2 } from 'lucide-react';
import { format, parseISO, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IProfessor, ISlot, ICourse } from '@/interfaces';

export default function ProfessorDashboard() {
  const [professor, setProfessor] = useState<IProfessor | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getMyProfessorDashboard();
      setProfessor(data.professor);
      setCourses(data.courses);
      setSlots(data.slots);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingSlots = slots
    .filter((slot) => isFuture(parseISO(slot.startTime)))
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
    .slice(0, 5);

  const totalReservations = slots.reduce((acc, slot) => acc + (slot.reservations?.length || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full"></div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="skeleton h-24"></div>
          <div className="skeleton h-24"></div>
          <div className="skeleton h-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">¡Bienvenido, {professor?.name?.split(' ')[0]}!</h1>
        <p className="text-base-content/70 mt-2">Este es tu panel de control como profesor</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="stat bg-base-200 rounded-lg shadow-lg">
          <div className="stat-figure text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="stat-title">Cursos Asignados</div>
          <div className="stat-value text-primary">{courses.length}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow-lg">
          <div className="stat-figure text-secondary">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="stat-title">Horarios Totales</div>
          <div className="stat-value text-secondary">{slots.length}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow-lg">
          <div className="stat-figure text-accent">
            <Users className="h-8 w-8" />
          </div>
          <div className="stat-title">Total Reservas</div>
          <div className="stat-value text-accent">{totalReservations}</div>
          <div className="stat-desc">En todos tus horarios</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="card-title">
                <Calendar className="h-5 w-5" />
                Próximas Clases
              </h2>
              {/* <Link to="/profesor/horarios" className="btn btn-outline btn-primary btn-sm ml-auto">
                Ver Todos
              </Link> */}
            </div>
            {upcomingSlots.length > 0 ? (
              <div className="space-y-3">
                {upcomingSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="border-base-300 border-l-primary bg-base-200 rounded border-l-4 p-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{slot.class?.title}</p>
                        <p className="text-base-content/70 text-sm">
                          {slot.class?.course?.acronym}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(slot.startTime), 'd MMM, HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-2">
                        <div className="badge badge-ghost badge-sm">
                          {slot.reservations?.length || 0}/{slot.maxStudents || 1}
                          <User2 className="ml-1 h-4 w-4" />
                        </div>
                        <a
                          href={`https://meet.jit.si/${slot.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Unirse
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70 py-8 text-center">
                No tienes clases próximas programadas
              </p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="card-title">
                <BookOpen className="h-5 w-5" />
                Mis Cursos
              </h2>

              {/* <Link to="/profesor/cursos" className="btn btn-outline btn-primary btn-sm ml-auto">
                Ver Todos
              </Link> */}
            </div>
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="hover:bg-base-200 block rounded p-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{course.title}</p>
                        <span className="badge badge-sm badge-primary">{course.acronym}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{course.classes?.length || 0}</p>
                        <p className="text-base-content/70 text-xs">Clases</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70 py-8 text-center">No tienes cursos asignados</p>
            )}
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>
          Revisa tu calendario regularmente para mantener actualizadas tus clases y reservas.
        </span>
      </div>
    </div>
  );
}
