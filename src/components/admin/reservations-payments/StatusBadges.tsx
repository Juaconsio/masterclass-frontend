import { BADGE_CLASS, PAYMENT_STATUS_LABELS, RESERVATION_STATUS_LABELS } from './constants';

export function ReservationStatusBadge({ status }: { status: string }) {
  const label = RESERVATION_STATUS_LABELS[status] ?? status;
  const variants: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-error',
    to_refund: 'badge-info',
    refunded: 'badge-ghost',
    attended: 'badge-success',
    no_show: 'badge-error',
  };
  return <div className={`${BADGE_CLASS} ${variants[status] ?? 'badge-ghost'}`}>{label}</div>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const label = PAYMENT_STATUS_LABELS[status] ?? status;
  const variants: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-info',
  };
  return <div className={`${BADGE_CLASS} ${variants[status] ?? 'badge-ghost'}`}>{label}</div>;
}
