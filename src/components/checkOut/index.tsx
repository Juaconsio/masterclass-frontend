import { useEffect, useMemo, useState } from 'react';
import type { PaymentPlan } from '../../client/payments';
import { getPaymentPlans } from '../../client/payments';
import { getCourseEnroll } from '../../client/courses';

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

export default function CheckoutView(props: CheckoutProps) {
  const qp = useQueryParams();

  const courseId = props.courseId ?? qp.courseId;
  const courseAcronym = props.courseAcronym ?? qp.courseAcronym;
  const slotId = props.slotId ?? qp.slotId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [course, setCourse] = useState<any | null>(null);
  const [slot, setSlot] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getPaymentPlans({ courseId: String(courseId || courseAcronym), slotId });
        if (!mounted) return;
        setPlans(res);
        if (res[0]) setSelectedPlanId(res[0].id);
        // Fetch course display name if possible
        if (courseId || courseAcronym) {
          try {
            const options: { courseId?: number; courseAcronym?: string; slotId?: number } = {};
            if (courseId) options.courseId = Number(courseId);
            if (courseAcronym) options.courseAcronym = courseAcronym;
            if (slotId) options.slotId = Number(slotId);
            const res = await getCourseEnroll(options);
            if (res?.course) setCourse(res.course);
            if (res?.slot) setSlot(res.slot);
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar los planes');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId, slotId]);

  const handleReserve = () => {
    if (!selectedPlanId) return;
    const payload = {
      courseId,
      courseAcronym,
      slotId,
      planId: selectedPlanId,
      // Optionally attach extra info in the future
      ts: Date.now(),
    };
    try {
      localStorage.setItem('checkout.reservation', JSON.stringify(payload));
    } catch {}
    // Send to sign up
    window.location.href = '/registrar';
  };

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
          <div className="badge badge-primary badge-lg">Checkout</div>
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
                    <span className="text-base-content/60">Horario</span>
                    <span className="font-medium">{slot?.id ?? '—'}</span>
                  </div>
                </div>
                <div className="divider" />
                <p className="text-base-content/70 text-sm">
                  Si aún no tienes cuenta, te pediremos registrarte para completar la reserva.
                </p>
              </div>
            </div>
          </section>

          {/* Plans */}
          <section className="lg:col-span-2">
            <div className="card h-full bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Elige tu plan</h2>
                {loading && <div className="loading loading-spinner loading-lg" />}
                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}
                {!loading && !error && (
                  <form
                    className="grid gap-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReserve();
                    }}
                  >
                    {plans.map((p) => (
                      <label
                        key={p.id}
                        className={`card bg-base-100 border ${selectedPlanId === p.id ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'} cursor-pointer shadow-sm transition hover:shadow-md`}
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
                              checked={selectedPlanId === p.id}
                              onChange={() => setSelectedPlanId(p.id)}
                            />
                          </div>
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: p.currency || 'CLP',
                            }).format(p.price)}
                          </div>
                          {p.features?.length ? (
                            <ul className="text-base-content/70 list-disc space-y-1 pl-5 text-sm">
                              {p.features.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </label>
                    ))}
                    <div className="mt-2 flex justify-end md:col-span-2">
                      <button type="submit" className="btn btn-primary btn-lg">
                        Reservar
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
