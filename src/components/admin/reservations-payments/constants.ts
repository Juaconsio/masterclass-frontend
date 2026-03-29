import type { PaymentStatusFilter, QuickFilter } from './types';

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  reschedule_pending: 'Reagendar',
  to_refund: 'Pend. reembolso',
  refunded: 'Reembolsada',
  attended: 'Asistió',
  no_show: 'No asistió',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

export const ADMIN_PAYMENTS_TABS_RADIO_NAME = 'admin_reservations_payments_tabs_v1';

export const BADGE_CLASS = 'badge badge-sm min-w-[5.5rem] justify-center';

export const PAYMENT_STATUS_CARD_ORDER: PaymentStatusFilter[] = [
  'all',
  'pending',
  'paid',
  'failed',
  'refunded',
];

export const PAYMENT_STATUS_CARD_LABELS: Record<PaymentStatusFilter, string> = {
  all: 'Todos',
  pending: 'Pendientes',
  paid: 'Pagados',
  failed: 'Fallidos',
  refunded: 'Reembolsados',
};

export const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
  all: 'Todas',
  pending_confirm: 'Pago clase pendiente',
  pending_refund: 'Pend. reembolso',
};
