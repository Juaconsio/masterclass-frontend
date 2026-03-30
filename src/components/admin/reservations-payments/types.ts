export type PaymentStatusFilter = 'all' | 'pending' | 'paid' | 'failed' | 'refunded';

export type QuickFilter = 'all' | 'pending_confirm' | 'pending_refund';

export type TabKind = 'payments' | 'reservations';

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
