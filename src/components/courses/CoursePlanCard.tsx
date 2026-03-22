import { Link } from 'react-router';
import { getPricingPlanPresentation } from '@/lib/pricingPlanPresentation';

export interface CoursePlanCardPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  listPrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  hasActiveDiscount?: boolean;
  campaignLabel?: string | null;
  planType?: string;
  reservationCount: number;
  accessMode: string;
  allowedModalities?: string[];
  allowedStudentsGroups?: string[];
}

interface CoursePlanCardProps {
  plan: CoursePlanCardPlan;
  courseAcronym: string;
  cardClass?: string;
}

export function CoursePlanCard({ plan, courseAcronym, cardClass = '' }: CoursePlanCardProps) {
  const presentation = getPricingPlanPresentation(plan);

  return (
    <div
      className={`card border-base-300 bg-base-100 border shadow-sm transition hover:shadow-md ${cardClass}`}
    >
      <div className="card-body flex flex-col p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wide">
            {presentation.planTypeLabel}
          </p>
          <p className="text-base-content text-sm font-semibold">{presentation.sessionsLabel}</p>
        </div>
        <div className="mb-2">
          {presentation.pricing.hasDiscount && (
            <p className="text-base-content/50 text-xs line-through">{presentation.pricing.listPriceLabel}</p>
          )}
          <p className="text-primary text-2xl font-bold leading-tight">{presentation.pricing.finalPriceLabel}</p>
          {presentation.pricing.discountLabel && (
            <p className="text-success text-xs font-medium">{presentation.pricing.discountLabel}</p>
          )}
        </div>
        <h4 className="card-title mt-0 text-base font-semibold">{presentation.name}</h4>
        {presentation.description && (
          <p className="text-base-content/80 -mt-1 line-clamp-2 text-sm">{presentation.description}</p>
        )}
        <ul className="text-base-content/70 mt-1 list-disc space-y-1 pl-4 text-xs">
          {presentation.features.slice(0, 2).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p className="text-base-content/60 mt-1 text-xs">Modalidad: {presentation.constraints.modalityText}</p>
        <p className="text-base-content/60 text-xs">Grupo: {presentation.constraints.groupText}</p>
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
