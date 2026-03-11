import { Calendar, Lock, CheckCircle, BookOpen, CreditCard } from 'lucide-react';
import type { IClass } from '@/interfaces/events/IEvent';
import type { IReservation } from '@/interfaces';
import { Link } from 'react-router';
import type { StudentPlanPurchase } from '@client/purchases';

interface CourseClassesProps {
  classes?: IClass[];
  loading?: boolean;
  reservations?: IReservation[];
  coursePurchases?: StudentPlanPurchase[];
}

function getClassPlanInfo(
  classId: number,
  purchases: StudentPlanPurchase[]
): { planName: string; isPaid: boolean }[] {
  return purchases
    .filter((p) => {
      const allowed = p.pricingPlan?.allowedClasses ?? [];
      return allowed.length === 0 || allowed.some((c) => c.id === classId);
    })
    .map((p) => ({
      planName: p.pricingPlan?.name ?? 'Plan',
      isPaid: (p.payments?.[0] as { status?: string } | undefined)?.status === 'paid',
    }));
}

export function CourseClasses({
  classes = [],
  loading = false,
  reservations = [],
  coursePurchases = [],
}: CourseClassesProps) {
  const hasAccessByReservation = (classId: number): boolean =>
    reservations.some((r) => {
      const match = r.slot?.classId === classId;
      const ok = r.status === 'confirmed' && r.payment?.status === 'paid';
      return match && ok;
    });

  const getAccessAndPlans = (classId: number) => {
    const planInfo = getClassPlanInfo(classId, coursePurchases);
    const hasPaidPlan = planInfo.some((p) => p.isPaid);
    const hasAccess = hasAccessByReservation(classId) || hasPaidPlan;
    return { hasAccess, planInfo };
  };

  const classIdsInPlans = new Set<number>();
  classes.forEach((cls) => {
    const info = getClassPlanInfo(cls.id, coursePurchases);
    if (info.length > 0) classIdsInPlans.add(cls.id);
  });
  const includedClasses = classes.filter((c) => classIdsInPlans.has(c.id));
  const otherClasses = classes.filter((c) => !classIdsInPlans.has(c.id));

  const renderClassCard = (cls: IClass) => {
    const { hasAccess, planInfo } = getAccessAndPlans(cls.id);

    return (
      <div key={cls.id} className="border-base-300 border">
        <div className="card transition-all hover:shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-secondary flex flex-wrap items-start justify-between gap-2">
              <span className="line-clamp-2 flex-1">{cls.title}</span>
              <div className="flex flex-wrap items-center gap-2">
                {planInfo.length > 0 &&
                  planInfo.map((p, i) => (
                    <span
                      key={i}
                      className={`badge gap-1 whitespace-nowrap ${
                        p.isPaid ? 'badge-success' : 'badge-warning'
                      }`}
                      title={p.isPaid ? 'Plan pagado' : 'Plan pendiente de pago'}
                    >
                      {p.isPaid ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <CreditCard className="h-3 w-3" />
                      )}
                      {p.planName}
                      {!p.isPaid && ' (pendiente)'}
                    </span>
                  ))}
                {hasAccess ? (
                  <span className="badge badge-success gap-2 whitespace-nowrap">
                    <CheckCircle className="h-3 w-3" />
                    Con acceso
                  </span>
                ) : (
                  <span className="badge badge-ghost gap-2 whitespace-nowrap">
                    <Lock className="h-3 w-3" />
                    Sin acceso
                  </span>
                )}
              </div>
            </h3>
            <p className="text-base-content/70 line-clamp-3 text-sm">
              {cls.description || 'Sin descripción disponible'}
            </p>
            <div className="card-actions justify-end">
              {hasAccess ? (
                <Link
                  to={`/app/cursos/${cls.courseId}/clases/${cls.id}`}
                  className="btn btn-primary gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Ver materiales
                </Link>
              ) : planInfo.length > 0 && !planInfo.some((p) => p.isPaid) ? (
                <p className="text-base-content/60 text-sm">
                  Plan no pagado — paga para acceder a los materiales.
                </p>
              ) : (
                <p className="text-base-content/60 text-sm">
                  Incluye esta clase en un plan o reserva para acceder a los materiales.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!classes || classes.length === 0) {
    return (
      <div className="bg-base-200 card">
        <div className="card-body items-center text-center">
          <Calendar className="text-base-content/40 h-8 w-8" />
          <p className="text-base-content/70">No se encontraron clases disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {includedClasses.length > 0 && (
        <section>
          <h3 className="text-base-content/80 mb-3 text-sm font-semibold uppercase tracking-wide">
            Clases incluidas en tu plan
          </h3>
          <div className="flex flex-col gap-4">
            {includedClasses.map(renderClassCard)}
          </div>
        </section>
      )}
      {otherClasses.length > 0 && (
        <section>
          <h3 className="text-base-content/80 mb-3 text-sm font-semibold uppercase tracking-wide">
            Otras clases del curso
          </h3>
          <div className="flex flex-col gap-4">
            {otherClasses.map(renderClassCard)}
          </div>
        </section>
      )}
    </div>
  );
}
