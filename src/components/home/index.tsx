import { useSessionContext } from '../../context/SessionContext';
import { Link } from 'react-router';
import Greetings from './Greetings';
import {
  Calendar,
  BookOpen,
  CreditCard,
  Users,
  BookMarked,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';

const Home = () => {
  const { user, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3">
        <div className="loading loading-spinner loading-lg"></div>
        <h2>Estamos buscando el conocimiento para salvar el ramo...</h2>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="bg-base-100 flex-1 overflow-y-auto">
        <div className="container mx-auto space-y-8 p-6">
          {/* Header / Greeting */}
          <div className="mb-8">
            <Greetings />
            <p className="text-base-content/70 mt-2">
              Bienvenido a tu panel de control. Aquí puedes gestionar todas tus actividades
              académicas.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="stats stats-vertical lg:stats-horizontal bg-secondary/10 w-full border shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="stat-title">Próximas Clases</div>
              <div className="stat-value text-primary">3</div>
              <div className="stat-desc">Esta semana</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="stat-title">Cursos Activos</div>
              <div className="stat-value text-secondary">5</div>
              <div className="stat-desc">En progreso</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="stat-title">Progreso</div>
              <div className="stat-value">87%</div>
              <div className="stat-desc">↗︎ +12% este mes</div>
            </div>
          </div>

          {/* Main Features Grid */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">Funcionalidades Principales</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Reservas */}
              <div className="card bg-base-200 border shadow-xl transition-shadow hover:shadow-2xl">
                <div className="card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <Calendar className="text-primary h-6 w-6" />
                    </div>
                    <h2 className="card-title">Reservas</h2>
                  </div>
                  <p className="text-base-content/70 text-sm">
                    Gestiona y programa tus sesiones de estudio. Reserva horarios con profesores y
                    mantén un calendario organizado.
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="text-base-content/60 mb-3 space-y-1 text-xs">
                    <li>• Reserva clases individuales o grupales</li>
                    <li>• Sincroniza con tu calendario</li>
                    <li>• Recordatorios automáticos</li>
                  </ul>
                  <div className="card-actions justify-end">
                    <Link to="reservas" className="btn btn-primary btn-sm">
                      Gestionar Reservas
                    </Link>
                  </div>
                </div>
              </div>

              {/* Cursos */}
              <div className="card border bg-black/5 shadow-xl transition-shadow hover:shadow-2xl">
                <div className="card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-secondary/10 rounded-lg p-3">
                      <BookOpen className="text-secondary h-6 w-6" />
                    </div>
                    <h2 className="card-title">Cursos</h2>
                  </div>
                  <p className="text-base-content/70 text-sm">
                    Explora y matricúlate en cursos disponibles. Accede a materiales, tareas y sigue
                    tu progreso académico en tiempo real.
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="text-base-content/60 mb-3 space-y-1 text-xs">
                    <li>• Catálogo completo de cursos</li>
                    <li>• Materiales descargables</li>
                    <li>• Seguimiento de progreso</li>
                  </ul>
                  <div className="card-actions justify-end">
                    <Link to="cursos" className="btn btn-secondary btn-sm">
                      Ver Cursos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pagos */}
              <div className="card border bg-green-500/5 shadow-xl transition-shadow hover:shadow-2xl">
                <div className="card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-3">
                      <CreditCard className="h-6 w-6 text-green-500" />
                    </div>
                    <h2 className="card-title">Pagos</h2>
                  </div>
                  <p className="text-base-content/70 text-sm">
                    Administra tus pagos y facturas. Revisa el historial de transacciones y mantén
                    tus métodos de pago actualizados.
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="text-base-content/60 mb-3 space-y-1 text-xs">
                    <li>• Historial de transacciones</li>
                    <li>• Pagos seguros y encriptados</li>
                    <li>• Métodos de pago flexibles</li>
                  </ul>
                  <div className="card-actions justify-end">
                    <Link to="pagos" className="btn btn-success btn-sm">
                      Ver Pagos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profesores */}
              <div className="card border bg-blue-500/5 shadow-xl transition-shadow hover:shadow-2xl">
                <div className="card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-info/10 rounded-lg p-3">
                      <Users className="text-info h-6 w-6" />
                    </div>
                    <h2 className="card-title">Profesores</h2>
                  </div>
                  <p className="text-base-content/70 text-sm">
                    Conoce a nuestro equipo docente. Revisa perfiles, especialidades, horarios
                    disponibles y valoraciones de otros estudiantes.
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="text-base-content/60 mb-3 space-y-1 text-xs">
                    <li>• Perfiles detallados de profesores</li>
                    <li>• Especialidades y certificaciones</li>
                    <li>• Reseñas de estudiantes</li>
                  </ul>
                  <div className="card-actions justify-end">
                    <Link to="profesores" className="btn btn-info btn-sm">
                      Ver Profesores
                    </Link>
                  </div>
                </div>
              </div>

              {/* Blog */}
              <div className="card border bg-yellow-500/5 shadow-xl transition-shadow hover:shadow-2xl">
                <div className="card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-warning/10 rounded-lg p-3">
                      <BookMarked className="text-warning h-6 w-6" />
                    </div>
                    <h2 className="card-title">Blog</h2>
                  </div>
                  <p className="text-base-content/70 text-sm">
                    Lee artículos y guías sobre técnicas de estudio, consejos académicos y novedades
                    educativas para mejorar tu rendimiento.
                  </p>
                  <div className="divider my-2"></div>
                  <ul className="text-base-content/60 mb-3 space-y-1 text-xs">
                    <li>• Artículos semanales</li>
                    <li>• Tips de estudio</li>
                    <li>• Recursos educativos</li>
                  </ul>
                  <div className="card-actions justify-end">
                    <Link to="blog" className="btn btn-warning btn-sm">
                      Leer Blog
                    </Link>
                  </div>
                </div>
              </div>

              {/* Admin Features */}
              {user?.role === 'admin' && (
                <>
                  <div className="card bg-base-200 shadow-xl transition-shadow hover:shadow-2xl">
                    <div className="card-body">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="bg-error/10 rounded-lg p-3">
                          <Users className="text-error h-6 w-6" />
                        </div>
                        <h2 className="card-title">Usuarios</h2>
                        <div className="badge badge-error badge-sm">Admin</div>
                      </div>
                      <p className="text-base-content/70 text-sm">
                        Controla el acceso y permisos de usuarios. Gestiona roles, estados y
                        configuraciones de cuenta.
                      </p>
                      <div className="card-actions mt-4 justify-end">
                        <Link to="usuarios" className="btn btn-error btn-sm">
                          Gestionar Usuarios
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200 shadow-xl transition-shadow hover:shadow-2xl">
                    <div className="card-body">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="bg-success/10 rounded-lg p-3">
                          <TrendingUp className="text-success h-6 w-6" />
                        </div>
                        <h2 className="card-title">Estadísticas</h2>
                        <div className="badge badge-success badge-sm">Admin</div>
                      </div>
                      <p className="text-base-content/70 text-sm">
                        Visualiza métricas clave y analíticas. Monitorea el rendimiento de cursos,
                        profesores y usuarios.
                      </p>
                      <div className="card-actions mt-4 justify-end">
                        <Link to="/estadisticas" className="btn btn-success btn-sm">
                          Ver Estadísticas
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-base-200 rounded-box p-6">
            <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="reservas/nueva" className="btn btn-primary btn-sm gap-2">
                <Clock className="h-4 w-4" />
                Nueva Reserva
              </Link>
              <Link to="cursos" className="btn btn-secondary btn-sm gap-2">
                <BookOpen className="h-4 w-4" />
                Explorar Cursos
              </Link>
              <Link to="pagos" className="btn btn-accent btn-sm gap-2">
                <DollarSign className="h-4 w-4" />
                Realizar Pago
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
