import { Link } from 'react-router';
import { Package, Check, FileText } from 'lucide-react';
import type { StudentPlanPurchase } from '@/client/purchases';

function getPaymentStatus(purchase: StudentPlanPurchase): 'paid' | 'pending' | 'other' {
  const status = purchase.payments?.[0]?.status;
  if (status === 'paid') return 'paid';
  if (status === 'pending') return 'pending';
  return 'other';
}

function getIncludedItems(accessMode?: string): { label: string; included: boolean }[] {
  const hasSessions = accessMode === 'sessions_and_materials';
  return [
    { label: 'Material de estudio', included: true },
    { label: 'Grabaciones', included: true },
    { label: 'Clases en vivo', included: hasSessions },
  ].filter((i) => i.included);
}

type PlanCardProps = { purchase: StudentPlanPurchase };

export function PlanCard({ purchase }: PlanCardProps) {
  const paymentStatus = getPaymentStatus(purchase);
  const isActive = paymentStatus === 'paid';
  const course = purchase.pricingPlan?.course;
  const courseId = course?.id;
  const courseAcronym = course?.acronym;
  const planName = purchase.pricingPlan?.name ?? 'Plan';
  const courseTitle = course?.title ?? '';
  const creditsRedeemed = purchase.creditsTotal - purchase.creditsRemaining;
  const progress = purchase.creditsTotal > 0 ? (creditsRedeemed / purchase.creditsTotal) * 100 : 0;
  const includedItems = getIncludedItems(purchase.pricingPlan?.accessMode);
  const canRedeem = isActive && purchase.creditsRemaining > 0 && courseAcronym;

  const borderColor = isActive ? 'border-primary/30' : 'border-base-content/20';

  return (
    <div className={`card compact border-2 ${borderColor} bg-base-100 shadow-xl`}>
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`badge badge-sm font-semibold ${
              isActive ? 'badge-success text-success-content' : 'badge-warning text-warning-content'
            }`}
          >
            {isActive ? 'ACTIVO' : 'PENDIENTE'}
          </span>
          <div className="text-base-content/60 flex items-center gap-1.5 text-sm">
            <Package className="h-4 w-4" aria-hidden />
            <span>
              {creditsRedeemed} de {purchase.creditsTotal}
            </span>
          </div>
        </div>

        <h3 className="card-title mt-2 text-lg">{courseTitle || 'Curso'}</h3>
        <p className="text-base-content/70 text-sm">{planName}</p>

        <div className="mt-2">
          <p className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            Clases canjeadas
          </p>
          <progress
            className="progress progress-primary mt-1 h-2"
            value={progress}
            max={100}
            aria-label={`${creditsRedeemed} de ${purchase.creditsTotal} clases canjeadas`}
          />
        </div>

        <div className="mt-3">
          <p className="text-base-content/60 mb-2 text-xs font-semibold tracking-wider uppercase">
            Incluye
          </p>
          <ul className="space-y-1">
            {includedItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <Check className="text-success h-4 w-4 flex-shrink-0" aria-hidden />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-actions mt-4 gap-2">
          {canRedeem && (
            <Link
              to={`/app/elegir-horario?purchaseId=${purchase.id}&courseAcronym=${encodeURIComponent(courseAcronym!)}`}
              className="btn btn-primary btn-sm flex-1"
            >
              Canjear clase
            </Link>
          )}
          {courseId && isActive && (
            <Link to={`/app/cursos/${courseId}`} className="btn btn-sm btn-outline gap-1">
              <FileText className="h-4 w-4" aria-hidden />
              Ver curso
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
