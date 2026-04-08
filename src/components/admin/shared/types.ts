export type PaymentStatusFilter = 'all' | 'pending' | 'paid' | 'failed' | 'refunded';

/** Filtros rápidos del registro de reservas (sin criterios de pago de clase). */
export type ReservationQuickFilter = 'all' | 'pending_refund';

export type AppliedPaymentAdvanced = {
  id?: number;
  transactionReference?: string;
  studentRut?: string;
  pricingPlanId?: number;
  paymentDateFrom?: string;
  paymentDateTo?: string;
};

export type FilterBadgeItem = { key: string; label: string; value: string };

export type PaymentSearchDraft = {
  id: string;
  transactionReference: string;
  studentRut: string;
  pricingPlanId: string;
  paymentDateFrom: string;
  paymentDateTo: string;
};
