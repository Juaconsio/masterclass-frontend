import { Link } from 'react-router';

export interface CoursePlanCardPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  reservationCount: number;
  accessMode: string;
}

interface CoursePlanCardProps {
  plan: CoursePlanCardPlan;
  courseAcronym: string;
  cardClass?: string;
}

function sessionsLabel(plan: CoursePlanCardPlan): string {
  if (plan.accessMode === 'materials_only') return 'Solo material';
  return plan.reservationCount === 1 ? '1 sesión' : `${plan.reservationCount} sesiones`;
}

function formatPrice(price: number): string {
  return price === 0
    ? 'Gratis'
    : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
}

export function CoursePlanCard({ plan, courseAcronym, cardClass = '' }: CoursePlanCardProps) {
  return (
    <div
      className={`card border-base-300 bg-base-100 border shadow-sm transition hover:shadow-md ${cardClass}`}
    >
      <div className="card-body flex flex-col p-4 sm:p-5">
        <p className="text-base-content mb-1 text-base font-semibold">{sessionsLabel(plan)}</p>
        <p className="text-primary mb-2 text-2xl font-bold leading-tight">{formatPrice(plan.price)}</p>
        <h4 className="card-title mt-0 text-base font-semibold">{plan.name}</h4>
        {plan.description && (
          <p className="text-base-content/80 -mt-1 line-clamp-2 text-sm">{plan.description}</p>
        )}
        <div className="card-actions mt-auto pt-3">
          <Link
            to={`/checkout?courseAcronym=${encodeURIComponent(courseAcronym)}&planId=${plan.id}`}
            className="btn btn-primary btn-sm btn-block"
          >
            Elegir este plan
          </Link>
        </div>
      </div>
    </div>
  );
}
