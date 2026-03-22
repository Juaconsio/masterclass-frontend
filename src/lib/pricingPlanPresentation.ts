import type { PricingPlanAccessMode, PricingPlanType } from '@/interfaces/models';

type PlanPresentationInput = {
  name: string;
  description?: string | null;
  planType?: PricingPlanType | string;
  accessMode?: PricingPlanAccessMode;
  reservationCount?: number;
  price: number;
  listPrice?: number;
  hasActiveDiscount?: boolean;
  discountPercent?: number;
  campaignLabel?: string | null;
  allowedModalities?: string[];
  allowedStudentsGroups?: string[];
};

const PLAN_TYPE_LABELS: Record<string, string> = {
  digital: 'Digital',
  hybrid: 'Híbrido',
  premium: 'Premium',
  free_trial: 'Prueba gratis',
  massive: 'Clase masiva',
  hibrido: 'Híbrido',
  prueba_gratis: 'Prueba gratis',
  masiva: 'Clase masiva',
};

const PLAN_TYPE_FEATURES: Record<string, string[]> = {
  digital: ['Acceso a clases en video', 'Material digital del curso', 'Canal de consultas'],
  hybrid: ['Incluye beneficios Digital', 'Refuerzo en vivo', 'Resolución de dudas'],
  premium: ['Incluye beneficios Híbrido', 'Acompañamiento intensivo', 'Preparación personalizada'],
  free_trial: ['Primera clase sin costo', 'Sin compromiso de pago', 'Conoce la metodología'],
  massive: ['Clase grupal previa a evaluación', 'Repaso de contenidos clave', 'Formato intensivo'],
  hibrido: ['Incluye beneficios Digital', 'Refuerzo en vivo', 'Resolución de dudas'],
  prueba_gratis: ['Primera clase sin costo', 'Sin compromiso de pago', 'Conoce la metodología'],
  masiva: ['Clase grupal previa a evaluación', 'Repaso de contenidos clave', 'Formato intensivo'],
};

const MODALITY_LABELS: Record<string, string> = {
  remote: 'Online',
  onsite: 'Presencial',
};

const GROUP_LABELS: Record<string, string> = {
  group: 'Grupal',
  private: 'Particular',
};

function formatClp(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
}

/**
 * Builds a UI-oriented representation so plan cards in slug and checkout render the
 * same semantics, labels, restrictions and discount information.
 */
export function getPricingPlanPresentation(plan: PlanPresentationInput) {
  const planType = plan.planType ?? 'digital';
  const planTypeLabel = PLAN_TYPE_LABELS[planType] ?? planType;
  const finalPrice = typeof plan.price === 'number' ? plan.price : 0;
  const listPrice =
    typeof plan.listPrice === 'number' && plan.listPrice > 0 ? plan.listPrice : finalPrice;
  const hasDiscount =
    Boolean(plan.hasActiveDiscount) ||
    (listPrice > finalPrice && (plan.discountPercent ?? 0) > 0);
  const discountPercent = hasDiscount ? Number(plan.discountPercent ?? 0) : 0;
  const sessionsLabel =
    plan.accessMode === 'materials_only'
      ? 'Solo material'
      : plan.reservationCount === 1
        ? '1 sesión'
        : `${plan.reservationCount ?? 0} sesiones`;
  const modalityText =
    Array.isArray(plan.allowedModalities) && plan.allowedModalities.length > 0
      ? plan.allowedModalities.map((mod) => MODALITY_LABELS[mod] ?? mod).join(', ')
      : 'Cualquier modalidad';
  const groupText =
    Array.isArray(plan.allowedStudentsGroups) && plan.allowedStudentsGroups.length > 0
      ? plan.allowedStudentsGroups.map((group) => GROUP_LABELS[group] ?? group).join(', ')
      : 'Cualquier grupo';

  return {
    name: plan.name,
    description: plan.description ?? null,
    planType,
    planTypeLabel,
    sessionsLabel,
    features: PLAN_TYPE_FEATURES[planType] ?? [],
    constraints: {
      modalityText,
      groupText,
    },
    pricing: {
      finalPrice,
      finalPriceLabel: finalPrice === 0 ? 'Gratis' : formatClp(finalPrice),
      listPrice,
      listPriceLabel: formatClp(listPrice),
      hasDiscount,
      discountPercent,
      discountLabel:
        hasDiscount && discountPercent > 0
          ? `${plan.campaignLabel ? `${plan.campaignLabel} · ` : ''}-${discountPercent}%`
          : null,
    },
  };
}
