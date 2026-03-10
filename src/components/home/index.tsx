import { useEffect, useState } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { Link } from 'react-router';
import Greetings from './Greetings';
import { Package } from 'lucide-react';
import { getMyPurchases } from '@/client/purchases';
import { fetchReservations } from '@/client/reservations';
import type { StudentPlanPurchase } from '@/client/purchases';
import type { IReservation } from '@/interfaces';
import { WeekCalendar } from './WeekCalendar';
import { UpcomingSessionsList } from './UpcomingSessionsList';

function Home() {
  const { isLoading, user } = useSessionContext();
  const [purchasesWithCredits, setPurchasesWithCredits] = useState<StudentPlanPurchase[]>([]);
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedWeekDate, setSelectedWeekDate] = useState<string | null>(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    getMyPurchases()
      .then((list) => setPurchasesWithCredits((list ?? []).filter((p) => p.creditsRemaining > 0)))
      .catch(() => setPurchasesWithCredits([]));
  }, []);

  useEffect(() => {
    fetchReservations()
      .then((data) => setReservations(data ?? []))
      .catch(() => setReservations([]))
      .finally(() => setLoadingReservations(false));
  }, []);

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
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <Greetings name={user?.name} />
            <p className="text-base-content/80 mt-2">
              Bienvenido a tu panel de control. Aquí puedes gestionar todas tus actividades
              académicas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="card border shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title flex items-center gap-2">
                      <Package className="text-primary h-6 w-6" />
                      Cursos con planes activos
                    </h2>
                    <Link to="/app/planes" className="link link-primary link-hover text-sm">
                      Ver todos en Planes y pagos
                    </Link>
                  </div>
                  <p className="text-base-content/80 text-sm">
                    Planes con créditos disponibles o reservas activas.
                  </p>
                  {purchasesWithCredits.length > 0 ? (
                    <>
                      <ul className="mt-2 space-y-3">
                        {purchasesWithCredits.map((p) => {
                          const courseId = p.pricingPlan?.course?.id;
                          const courseAcronym = p.pricingPlan?.course?.acronym;
                          const courseTitle = p.pricingPlan?.course?.title ?? '';
                          return (
                            <li
                              key={p.id}
                              className="border-base-300 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 p-3"
                            >
                              <div>
                                <p className="font-medium">{p.pricingPlan?.name ?? 'Plan'}</p>
                                <p className="text-base-content/80 text-sm">
                                  {courseTitle && `${courseTitle} · `}
                                  {p.creditsTotal - p.creditsRemaining} de {p.creditsTotal} sesiones
                                  utilizadas
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {courseId != null && (
                                  <Link
                                    to={`/app/cursos/${courseId}`}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    Ver curso
                                  </Link>
                                )}
                                {courseAcronym && (
                                  <Link
                                    to={`/app/elegir-horario?purchaseId=${p.id}&courseAcronym=${encodeURIComponent(courseAcronym)}`}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Canjear sesión
                                  </Link>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="text-base-content/80 text-sm">
                      No tienes planes con sesiones por canjear.{' '}
                      <Link to="/app/planes" className="link link-primary">
                        Ver planes y pagos
                      </Link>{' '}
                      o{' '}
                      <a href="/checkout" className="link link-primary">
                        comprar un plan
                      </a>
                      .
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              {!loadingReservations && (
                <>
                  <WeekCalendar
                    reservations={reservations}
                    selectedDate={selectedWeekDate}
                    onSelectDate={setSelectedWeekDate}
                  />
                  <UpcomingSessionsList
                    reservations={reservations}
                    selectedDate={selectedWeekDate}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
