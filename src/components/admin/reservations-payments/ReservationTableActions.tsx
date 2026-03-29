import { Receipt, RotateCcw } from 'lucide-react';
import type { IReservation } from '@/interfaces';

interface ReservationTableActionsProps {
  reservation: IReservation;
  processing: boolean;
  processingId: number | null;
  onViewDetail: (r: IReservation) => void;
  onProcessRefund: (r: IReservation) => void;
}

export function ReservationTableActions({
  reservation,
  processing,
  processingId,
  onViewDetail,
  onProcessRefund,
}: ReservationTableActionsProps) {
  const canRefund = reservation.status === 'to_refund';
  const busy = processing && processingId === reservation.id;
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={() => onViewDetail(reservation)}
        title="Ver detalle"
      >
        <Receipt className="h-4 w-4" />
      </button>
      {canRefund && (
        <button
          type="button"
          className="btn btn-info btn-xs"
          disabled={busy}
          onClick={() => onProcessRefund(reservation)}
          title="Procesar reembolso"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
