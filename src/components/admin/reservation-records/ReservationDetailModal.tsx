import type { IReservation } from '@/interfaces';
import { formatSlotDateParts } from '../shared/dateUtils';
import { ReservationStatusBadge } from '../shared/StatusBadges';
import { useAdminReservationRecordsTab } from './AdminReservationRecordsContext';

interface ReservationDetailModalViewProps {
  reservation: IReservation;
  onClose: () => void;
  processing: boolean;
  onProcessRefund: (r: IReservation) => void;
}

function ReservationDetailModalView({
  reservation,
  onClose,
  processing,
  onProcessRefund,
}: ReservationDetailModalViewProps) {
  return (
    <dialog open className="modal modal-open modal-bottom sm:modal-middle z-30">
      <div className="modal-box max-h-[90dvh] w-full max-w-2xl overflow-y-auto sm:w-11/12">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold">Reserva #{reservation.id}</h3>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="divider my-3" />
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base-content/60 text-xs">Estado:</span>
            <ReservationStatusBadge status={reservation.status} />
          </div>

          <section>
            <h4 className="text-base-content/60 mb-1 text-xs font-semibold tracking-wide uppercase">
              Estudiante
            </h4>
            <p className="font-semibold">{reservation.student?.name ?? 'N/A'}</p>
            <p className="text-base-content/60 text-sm">
              {reservation.student?.email} · {reservation.student?.rut}
            </p>
          </section>

          {reservation.slot && (
            <section>
              <h4 className="text-base-content/60 mb-1 text-xs font-semibold tracking-wide uppercase">
                Clase
              </h4>
              <p className="font-semibold">
                {reservation.slot.class?.course?.acronym} – {reservation.slot.class?.title}
              </p>
              <p className="text-base-content/60 text-sm">
                Prof: {reservation.slot.professor?.name}
              </p>
              <div className="mt-2 flex flex-col">
                <span className="text-sm font-medium">
                  {formatSlotDateParts(reservation.slot.startTime, reservation.slot.endTime).date}
                </span>
                <span className="text-base-content/60 text-xs">
                  {formatSlotDateParts(reservation.slot.startTime, reservation.slot.endTime).time}
                </span>
              </div>
            </section>
          )}

          {reservation.status === 'to_refund' && (
            <section className="border-base-300 flex flex-wrap gap-2 border-t pt-4">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={processing}
                onClick={() => onProcessRefund(reservation)}
              >
                {processing ? 'Procesando...' : 'Marcar reembolso'}
              </button>
            </section>
          )}
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <button>Cerrar</button>
      </form>
    </dialog>
  );
}

export function ReservationDetailModal() {
  const records = useAdminReservationRecordsTab();

  if (!records.detailReservation) return null;

  return (
    <ReservationDetailModalView
      reservation={records.detailReservation}
      onClose={() => records.setDetailReservation(null)}
      processing={records.processing}
      onProcessRefund={records.handleProcessRefund}
    />
  );
}
