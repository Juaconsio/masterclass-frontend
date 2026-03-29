import type { TableColumn } from '@components/UI';
import type { IReservation } from '@/interfaces';
import { formatSlotDateParts } from './dateUtils';
import { PaymentStatusBadge, ReservationStatusBadge } from './StatusBadges';

export function createReservationTableColumns(
  formatCurrency: (n: number) => string
): TableColumn<IReservation>[] {
  return [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      formatter: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'student',
      label: 'Estudiante',
      className: 'min-w-[12rem]',
      render: (r) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate font-semibold">{r.student?.name ?? 'N/A'}</div>
          <div className="text-base-content/60 truncate text-xs">{r.student?.email ?? ''}</div>
          {r.student?.rut ? (
            <div
              className="text-base-content/55 truncate font-mono text-[11px]"
              title={r.student.rut}
            >
              {r.student.rut}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'slot',
      label: 'Clase / Prof',
      className: 'min-w-[11rem] max-w-[14rem]',
      render: (r) => {
        const slot = r.slot;
        const classTitle = slot?.class?.title ?? 'N/A';
        const courseAcronym = slot?.class?.course?.acronym ?? '';
        const professorName = slot?.professor?.name ?? 'N/A';
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold">{courseAcronym || '—'}</span>
              <span className="text-base-content/70 truncate text-sm" title={classTitle}>
                {classTitle}
              </span>
            </div>
            <div className="text-base-content/60 truncate text-xs">Prof: {professorName}</div>
          </div>
        );
      },
    },
    {
      key: 'date',
      label: 'Fecha',
      className: 'min-w-[8rem]',
      render: (r) => {
        if (!r.slot) return <span className="text-sm">N/A</span>;
        const { date, time } = formatSlotDateParts(r.slot.startTime, r.slot.endTime);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{date}</span>
            <span className="text-base-content/60 text-xs">{time}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado',
      className: 'min-w-[10rem]',
      render: (r) => (
        <div className="grid grid-cols-[4.5rem_1fr] items-center gap-x-2 gap-y-1">
          <span className="text-base-content/60 text-xs">Reserva:</span>
          <ReservationStatusBadge status={r.status} />
          {r.payment && (
            <>
              <span className="text-base-content/60 text-xs">Pago:</span>
              <PaymentStatusBadge status={r.payment.status} />
            </>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (r) =>
        r.payment ? (
          <span className="font-semibold">{formatCurrency(r.payment.amount)}</span>
        ) : (
          <span className="text-base-content/60 text-sm">—</span>
        ),
    },
  ];
}
