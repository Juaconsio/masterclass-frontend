import { Check, X } from 'lucide-react';
import type { AdminPayment } from '@/client/admin/payments';

interface PaymentTableActionsProps {
  payment: AdminPayment;
  processing: boolean;
  processingId: number | null;
  onConfirm: (p: AdminPayment) => void;
  onReject: (p: AdminPayment) => void;
}

export function PaymentTableActions({
  payment,
  processing,
  processingId,
  onConfirm,
  onReject,
}: PaymentTableActionsProps) {
  if (payment.status !== 'pending') {
    return <span className="text-base-content/40 text-xs">—</span>;
  }
  const busy = processing && processingId === payment.id;
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <button
        type="button"
        className="btn btn-success btn-xs"
        disabled={busy}
        onClick={() => onConfirm(payment)}
        title="Confirmar pago (activa plan y accesos)"
      >
        {busy ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        className="btn btn-error btn-xs"
        disabled={busy}
        onClick={() => onReject(payment)}
        title="Rechazar pago"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
