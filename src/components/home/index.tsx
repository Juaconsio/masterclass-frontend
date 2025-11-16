import { useSessionContext } from '../../context/SessionContext';
import { Link } from 'react-router';
import Greetings from './Greetings';
import PendingReservationBanner from '../reservations/PendingReservationBanner';
import type { PendingReservationBannerRef } from '../reservations/PendingReservationBanner';
import { BookOpen, CreditCard, Users, BookMarked, AlertCircle } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

function Home() {
  const { isLoading } = useSessionContext();
  const bannerRef = useRef<PendingReservationBannerRef>(null);
  const [hasPendingReservation, setHasPendingReservation] = useState(false);

  useEffect(() => {
    // Check if there's a pending reservation in localStorage
    const checkPendingReservation = () => {
      const stored = localStorage.getItem('checkout.reservation');
      setHasPendingReservation(!!stored);
    };

    checkPendingReservation();
    window.addEventListener('storage', checkPendingReservation);
    return () => window.removeEventListener('storage', checkPendingReservation);
  }, [localStorage]);

  const ShowSoonDialog = () => {
    alert('¡Próximamente! Esta funcionalidad estará disponible en futuras actualizaciones.');
  };

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
          <div className="mb-8">
            <Greetings />
            <p className="text-base-content/70 mt-2">
              Bienvenido a tu panel de control. Aquí puedes gestionar todas tus actividades
              académicas.
            </p>
          </div>

          {hasPendingReservation && (
            <div className="alert alert-info shadow-lg">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-bold">Tienes una reserva pendiente de confirmar</h3>
                <div className="text-xs">Haz clic para ver los detalles y confirmar tu reserva</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => bannerRef.current?.openDrawer()}
              >
                Ver Detalles
              </button>
            </div>
          )}

          {/* Main Features Grid */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">Funcionalidades Principales</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              {/* <div className="card border bg-green-500/5 shadow-xl transition-shadow hover:shadow-2xl">
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
                    <button onClick={ShowSoonDialog} className="btn btn-warning btn-sm">
                      Ver Pagos
                    </button>
                  </div>
                </div>
              </div> */}

              {/* Profesores */}
              {/* <div className="card border bg-blue-500/5 shadow-xl transition-shadow hover:shadow-2xl">
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
                    <button onClick={ShowSoonDialog} className="btn btn-warning btn-sm">
                      Ver Profesores
                    </button>
                  </div>
                </div>
              </div> */}

              {/* Blog */}
              {/* <div className="card border bg-yellow-500/5 shadow-xl transition-shadow hover:shadow-2xl">
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
                    <button onClick={ShowSoonDialog} className="btn btn-warning btn-sm">
                      Leer Blog
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          <PendingReservationBanner ref={bannerRef} />
        </div>
      </main>
    </div>
  );
}

export default Home;
