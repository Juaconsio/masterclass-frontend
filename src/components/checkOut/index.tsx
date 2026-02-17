import { useEffect, useMemo, useState } from 'react';
import { getCourseEnroll } from '../../client/courses';
import { createReservation } from '../../client/reservations';
import { useSessionContext } from '../../context/SessionContext';
import type { IPricingPlan, ISlot, ICourse } from '../../interfaces/models';
import { TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHttpErrorMessage } from '@/lib/errorMessages';
import { clearAuthStorage } from '@client/authStorage';

type CheckoutProps = {
  courseId?: string | number;
  courseAcronym?: string;
  slotId?: string | number;
};

function useQueryParams() {
  return useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const params = new URLSearchParams(window.location.search);
    const obj: Record<string, string> = {};
    params.forEach((v, k) => (obj[k] = v));
    return obj;
  }, []);
}

/** Limpia credenciales locales y redirige a inicio de sesión. */
function clearAuthAndGoToLogin() {
  clearAuthStorage();
  window.location.href = '/ingresar?type=user';
}

function getReservationUiError(error: any) {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  if (status === 401) {
    return {
      message: 'Tu sesión expiró o no es válida. Inicia sesión nuevamente para continuar.',
      action: 'login' as const,
    };
  }

  if (status === 403 && code === 'EMAIL_NOT_CONFIRMED') {
    return {
      message:
        'Debes confirmar tu email antes de reservar. Revisa tu bandeja de entrada (y spam) y vuelve a intentar.',
    };
  }

  return { message: getHttpErrorMessage(error) };
}

export default function CheckoutView(props: CheckoutProps) {
  const qp = useQueryParams();
  const { isAuthenticated, isLoading: authLoading, user } = useSessionContext();

  const courseId = props.courseId ?? qp.courseId;
  const courseAcronym = props.courseAcronym ?? qp.courseAcronym;
  const slotId = props.slotId ?? qp.slotId;

  const [error, setError] = useState<{ message: string; action?: 'login' | 'switchAccount' } | null>(
    null
  );
  const [pricingPlans, setPricingPlans] = useState<IPricingPlan[]>([]);
  const [selectedPricingPlanId, setSelectedPricingPlanId] = useState<string | number | null>(null);
  const [course, setCourse] = useState<ICourse | null>(null);
  const [slot, setSlot] = useState<ISlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = (user as any)?.role as string | undefined;
  const isStudent = !role || role === 'user';
  const canSubmit = !!selectedPricingPlanId && !isSubmitting && !authLoading && (!isAuthenticated || isStudent);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch course display name if possible
        if (courseId || courseAcronym) {
          try {
            const options: { courseId?: number; courseAcronym?: string; slotId?: number } = {};
            if (courseId) options.courseId = Number(courseId);
            if (courseAcronym) options.courseAcronym = courseAcronym;
            if (slotId) options.slotId = Number(slotId);
            const res = await getCourseEnroll(options);
            if (!mounted) return;
            setCourse(res.course);
            setSlot(res.slot);
            setPricingPlans(res.pricingPlans);
          } catch {}
        }
      } catch (e: any) {
        if (!mounted) return;
        setError({ message: e?.message ?? 'No se pudo cargar los planes' });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId, slotId, courseAcronym]);

  const handleReserve = async () => {
    if (authLoading) {
      setError({ message: 'Estamos validando tu sesión. Intenta nuevamente en unos segundos.' });
      return;
    }
    if (!selectedPricingPlanId || !slotId || !course) return;
    if (isAuthenticated && !isStudent) {
      setError({
        message:
          'Estás autenticado como Profesor/Admin. Para reservar necesitas iniciar sesión como Estudiante.',
        action: 'switchAccount',
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Usuario autenticado: crear reserva directamente
        const result = await createReservation({
          courseId: course.id,
          slotId: Number(slotId),
          pricingPlanId: String(selectedPricingPlanId),
        });

        // Guardar datos para la página de éxito
        localStorage.setItem(
          'reservation.success',
          JSON.stringify({
            reservation: result.reservation,
            payment: result.payment,
          })
        );

        // Redirigir a página de éxito
        window.location.href = '/app/confirmacion-pago';
      } else {
        // Usuario NO autenticado: guardar intención de reserva
        const pendingReservation = {
          courseId: course.id,
          slotId: Number(slotId),
          pricingPlanId: selectedPricingPlanId,
          // Info para mostrar al usuario
          courseTitle: course.title,
          slotDate: slot?.startTime,
          amount: pricingPlans.find((p) => p.id === selectedPricingPlanId)?.price || 0,
        };

        localStorage.setItem('pendingReservation', JSON.stringify(pendingReservation));

        // Redirigir a registro
        window.location.href = '/registrar';
      }
    } catch (e: any) {
      const uiError = getReservationUiError(e);
      setError(uiError);
      if (uiError.action === 'login') {
        toast.error('Sesión expirada. Vuelve a iniciar sesión.');
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch {
          // noop
        }
      } else {
        toast.error(uiError.message);
      }
      setIsSubmitting(false);
    }
  };

  if (!slot || !course || !pricingPlans) {
    return (
      <main className="bg-base-100 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-10 w-64"></div>
              <div className="skeleton h-5 w-96"></div>
            </div>
            <div className="skeleton h-8 w-24"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary Skeleton */}
            <section className="lg:col-span-1">
              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <div className="skeleton mb-4 h-7 w-24"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton h-4 w-32"></div>
                      </div>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="skeleton h-16 w-full"></div>
                </div>
              </div>
            </section>

            {/* Plans Skeleton */}
            <section className="lg:col-span-2">
              <div className="card h-full bg-white shadow-xl">
                <div className="card-body">
                  <div className="skeleton mb-4 h-7 w-32"></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="card border-base-300 bg-base-100 border shadow-sm">
                        <div className="card-body gap-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="skeleton h-6 w-32"></div>
                              <div className="skeleton h-4 w-48"></div>
                            </div>
                            <div className="skeleton h-5 w-5 rounded-full"></div>
                          </div>
                          <div className="skeleton h-8 w-32"></div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-end md:col-span-2">
                      <div className="skeleton h-12 w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-base-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">¿Quieres reservar?</h1>
            <p className="text-base-content/60">
              Confirma tu plan y continúa con el registro para finalizar la reserva.
            </p>
          </div>
          <button className="btn btn-soft btn-primary" onClick={() => window.history.back()}>
            Volver
          </button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Summary */}
          <section className="lg:col-span-1">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Resumen</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Curso</span>
                    <span className="font-medium">{course?.title || courseId || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Clase</span>
                    <span className="font-medium">{slot?.class.title ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Día</span>
                    <span className="font-medium">
                      {new Date(slot.startTime).toLocaleString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) ?? '—'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-base-content/60">Horario</span>
                    <span className="font-medium">
                      {new Date(slot.startTime).toLocaleString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) ?? '—'}{' '}
                      -{' '}
                      {new Date(slot.endTime).toLocaleString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) ?? '—'}
                    </span>
                  </div>
                </div>
                <div className="divider" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Plan</span>
                    <span className="font-medium">
                      {pricingPlans.find((p) => p.id === selectedPricingPlanId)?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Total</span>
                    <span className="font-semibold">
                      {selectedPricingPlanId
                        ? new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          }).format(
                            pricingPlans.find((p) => p.id === selectedPricingPlanId)?.price || 0
                          )
                        : '—'}
                    </span>
                  </div>
                </div>

                {authLoading && (
                  <div className="alert alert-info mt-4">
                    <span className="text-sm">Validando sesión...</span>
                  </div>
                )}

                {isAuthenticated && !authLoading && !isStudent && (
                  <div className="alert alert-warning mt-4">
                    <TriangleAlert className="h-6 w-6 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold">Sesión con rol no compatible</p>
                      <p>
                        Estás logueado como <span className="font-medium">{role}</span>. Para
                        reservar necesitas una cuenta de estudiante.
                      </p>
                      <div className="mt-3">
                        <button className="btn btn-sm btn-outline" onClick={clearAuthAndGoToLogin}>
                          Cambiar cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!isAuthenticated && !authLoading && (
                  <div className="alert alert-info">
                    <TriangleAlert className="h-6 w-6 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold">Necesitas una cuenta</p>
                      <p>
                        Al continuar, te pediremos crear una cuenta. Tu reserva se confirmará
                        automáticamente después del registro.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Plans */}
          <section className="lg:col-span-2">
            <div className="card h-full bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Elige tu plan</h2>
                {error && (
                  <div className="alert alert-error">
                    <div className="flex w-full items-start justify-between gap-4">
                      <span>{error.message}</span>
                      {error.action === 'login' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={clearAuthAndGoToLogin}
                        >
                          Iniciar sesión
                        </button>
                      )}
                      {error.action === 'switchAccount' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={clearAuthAndGoToLogin}
                        >
                          Cambiar cuenta
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {!error && pricingPlans.length === 0 && (
                  <div className="alert alert-warning">
                    <span>No hay planes disponibles para este horario.</span>
                  </div>
                )}
                {!error && pricingPlans.length > 0 && (
                  <form
                    className="grid gap-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReserve();
                    }}
                  >
                    {pricingPlans.map((p) => (
                      <label
                        key={p.id}
                        className={`card bg-base-100 border ${selectedPricingPlanId === p.id ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'} cursor-pointer shadow-sm transition hover:shadow-md`}
                      >
                        <div className="card-body gap-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{p.name}</h3>
                              {p.description && (
                                <p className="text-base-content/60 text-sm">{p.description}</p>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="plan"
                              className="radio radio-primary"
                              checked={selectedPricingPlanId === p.id}
                              onChange={() => setSelectedPricingPlanId(p.id)}
                            />
                          </div>
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                            }).format(p.price)}
                          </div>
                        </div>
                      </label>
                    ))}
                    <div className="mt-2 flex justify-end md:col-span-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={!canSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="loading loading-spinner"></span>
                            Procesando...
                          </>
                        ) : isAuthenticated ? (
                          'Reservar ahora'
                        ) : (
                          'Continuar al registro'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
