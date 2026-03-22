import { useEffect, useMemo, useState } from 'react';
import { getCourseEnroll } from '../../client/courses';
import { createPurchase } from '@/client/purchases';
import { useSessionContext } from '../../context/SessionContext';
import type { IPricingPlan, ISlot, ICourse } from '../../interfaces/models';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { getHttpErrorMessage, PURCHASE_ERROR_MESSAGES } from '@/lib/errorMessages';
import { clearAuthStorage } from '@client/authStorage';
import { useNavigate } from 'react-router';
import { getPricingPlanPresentation } from '@/lib/pricingPlanPresentation';

type CheckoutProps = {
  courseId?: string | number;
  courseAcronym?: string;
  slotId?: string | number;
  planId?: string | number;
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

  if (status === 409 && code === 'FREE_TRIAL_ALREADY_USED') {
    return { message: PURCHASE_ERROR_MESSAGES.FREE_TRIAL_ALREADY_USED };
  }

  return { message: getHttpErrorMessage(error) };
}

export default function CheckoutView(props: CheckoutProps) {
  const qp = useQueryParams();
  const { isAuthenticated, isLoading: authLoading, user } = useSessionContext();
  const navigate = useNavigate();
  const courseId = props.courseId ?? qp.courseId;
  const courseAcronym = props.courseAcronym ?? qp.courseAcronym;
  const slotId = props.slotId ?? qp.slotId;
  const planIdFromQuery = props.planId ?? qp.planId;

  const [error, setError] = useState<{
    message: string;
    action?: 'login' | 'switchAccount';
  } | null>(null);
  const [pricingPlans, setPricingPlans] = useState<IPricingPlan[]>([]);
  const [selectedPricingPlanId, setSelectedPricingPlanId] = useState<string | number | null>(null);
  const [course, setCourse] = useState<ICourse | null>(null);
  const [slot, setSlot] = useState<ISlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'manual'>('mercadopago');

  const role = (user as any)?.role as string | undefined;
  const isStudent = !role || role === 'user';
  const hasSlot = slot != null;

  const visiblePricingPlans = useMemo(
    () =>
      isAuthenticated
        ? pricingPlans.filter((p) => p.planType !== 'free_trial')
        : pricingPlans,
    [isAuthenticated, pricingPlans],
  );

  useEffect(() => {
    if (selectedPricingPlanId == null) return;
    const stillVisible = visiblePricingPlans.some((p) => p.id === selectedPricingPlanId);
    if (!stillVisible) setSelectedPricingPlanId(null);
  }, [visiblePricingPlans, selectedPricingPlanId]);

  const selectedPlan = visiblePricingPlans.find((p) => p.id === selectedPricingPlanId);
  const selectedPlanPresentation = selectedPlan ? getPricingPlanPresentation(selectedPlan) : null;
  const isMaterialsOnly = selectedPlan?.accessMode === 'materials_only';
  const canSubmitReservation =
    !!selectedPricingPlanId &&
    !!slotId &&
    !!course &&
    !isSubmitting &&
    !authLoading &&
    (!isAuthenticated || isStudent);
  const canSubmitPurchase =
    !!selectedPricingPlanId &&
    !!course &&
    !isSubmitting &&
    !authLoading &&
    (!isAuthenticated || isStudent);
  const canSubmit = hasSlot ? canSubmitReservation : canSubmitPurchase;

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
            // TODO: filtrar el plan gratis si el usuario ya tiene un plan activo (Tal vez se pueda hacer en el backend aunque no creo porque es publico el endpoint)
            setPricingPlans(res.pricingPlans);
            if (planIdFromQuery && res.pricingPlans?.length) {
              const plan = res.pricingPlans.find((p) => String(p.id) === String(planIdFromQuery));
              if (plan) setSelectedPricingPlanId(plan.id);
            }
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
  }, [courseId, slotId, courseAcronym, planIdFromQuery]);

  const handleSubmit = async () => {
    if (authLoading) {
      setError({ message: 'Estamos validando tu sesión. Intenta nuevamente en unos segundos.' });
      return;
    }
    if (!selectedPricingPlanId || !course) return;
    if (hasSlot && !slotId) return;
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
    const planId = Number(selectedPricingPlanId);

    try {
      if (isAuthenticated) {
        const payload = { pricingPlanId: planId, slotId: slotId ? Number(slotId) : undefined, paymentMethod };
        const result = await createPurchase(payload);

        // Si hay checkoutUrl de Mercado Pago, redirigir allá
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }

        localStorage.setItem('purchase.success', JSON.stringify(result));
        navigate('/app/confirmacion-pago');
        return;
      }
      if (!isAuthenticated) {
        const payload = { pricingPlanId: planId, slotId: slotId ? Number(slotId) : undefined, paymentMethod };
        localStorage.setItem('pendingPurchase', JSON.stringify(payload));
        navigate('/ingresar?type=user');
        return;
      }
    } catch (e: any) {
      setError({ message: e?.message ?? 'No se pudo crear la compra' });
    }
  };

  if (!course) {
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
          <button
            className="btn btn-outline btn-sm flex items-center gap-1 border-0"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
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
                  {hasSlot && slot && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Clase</span>
                        <span className="font-medium">{slot.class?.title ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Día</span>
                        <span className="font-medium">
                          {new Date(slot.startTime).toLocaleString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Horario</span>
                        <span className="font-medium">
                          {new Date(slot.startTime).toLocaleString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(slot.endTime).toLocaleString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="divider" />

                {/* TODO: Agregar la card de la reserva si hay slot */}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Plan</span>
                    <span className="font-medium">
                      {selectedPlanPresentation?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Total</span>
                    <span className="font-semibold">
                      {selectedPlanPresentation
                        ? selectedPlanPresentation.pricing.finalPriceLabel
                        : '—'}
                    </span>
                  </div>
                  {selectedPlanPresentation?.pricing.hasDiscount && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Precio lista</span>
                      <span className="text-base-content/50 line-through">
                        {selectedPlanPresentation.pricing.listPriceLabel}
                      </span>
                    </div>
                  )}
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
                {!error && visiblePricingPlans.length === 0 && (
                  <div className="alert alert-warning">
                    <span>No hay planes disponibles para este horario.</span>
                  </div>
                )}
                {!error && visiblePricingPlans.length > 0 && (
                  <form
                    className="grid gap-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    {visiblePricingPlans.map((p) => (
                      (() => {
                        const presentation = getPricingPlanPresentation(p);
                        return (
                          <label
                            key={p.id}
                            className={`card bg-base-100 border ${selectedPricingPlanId === p.id ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'} cursor-pointer shadow-sm transition hover:shadow-md`}
                          >
                            <div className="card-body gap-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wide">
                                    {presentation.planTypeLabel}
                                  </p>
                                  <h3 className="text-lg font-semibold">{presentation.name}</h3>
                                  {presentation.description && (
                                    <p className="text-base-content/60 text-sm">{presentation.description}</p>
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
                              <div>
                                {presentation.pricing.hasDiscount && (
                                  <p className="text-base-content/50 text-xs line-through">
                                    {presentation.pricing.listPriceLabel}
                                  </p>
                                )}
                                <div className="text-2xl font-bold">{presentation.pricing.finalPriceLabel}</div>
                                {presentation.pricing.discountLabel && (
                                  <p className="text-success text-xs font-medium">
                                    {presentation.pricing.discountLabel}
                                  </p>
                                )}
                              </div>
                              <div className="text-base-content/70 space-y-1 text-xs">
                                <p>{presentation.sessionsLabel}</p>
                                <p>Modalidad: {presentation.constraints.modalityText}</p>
                                <p>Grupo: {presentation.constraints.groupText}</p>
                              </div>
                              <ul className="text-base-content/70 list-disc space-y-1 pl-4 text-xs">
                                {presentation.features.slice(0, 2).map((feature) => (
                                  <li key={feature}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          </label>
                        );
                      })()
                    ))}
                    {/* Payment method selector */}
                    <div className="md:col-span-2">
                      <h3 className="mb-3 text-lg font-semibold">Método de pago</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label
                          className={`card bg-base-100 border ${paymentMethod === 'mercadopago' ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'} cursor-pointer shadow-sm transition hover:shadow-md`}
                        >
                          <div className="card-body flex-row items-center gap-3 p-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="radio radio-primary"
                              checked={paymentMethod === 'mercadopago'}
                              onChange={() => setPaymentMethod('mercadopago')}
                            />
                            <div>
                              <p className="font-semibold">Mercado Pago</p>
                              <p className="text-base-content/60 text-xs">
                                Paga con tarjeta, débito o transferencia vía Mercado Pago
                              </p>
                            </div>
                          </div>
                        </label>
                        <label
                          className={`card bg-base-100 border ${paymentMethod === 'manual' ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'} cursor-pointer shadow-sm transition hover:shadow-md`}
                        >
                          <div className="card-body flex-row items-center gap-3 p-4">
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="radio radio-primary"
                              checked={paymentMethod === 'manual'}
                              onChange={() => setPaymentMethod('manual')}
                            />
                            <div>
                              <p className="font-semibold">Transferencia manual</p>
                              <p className="text-base-content/60 text-xs">
                                Realiza una transferencia bancaria y envía el comprobante
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

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
                          hasSlot ? (
                            'Reservar ahora'
                          ) : isMaterialsOnly ? (
                            'Comprar plan'
                          ) : (
                            'Comprar y elegir horario'
                          )
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
