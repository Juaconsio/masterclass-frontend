import { useMemo, useCallback, useState } from 'react';
import {
  getReservations,
  getReservation,
  processRefund,
  type ReservationsFilters,
} from '@/client/admin/reservations';
import { updatePayment } from '@/client/admin/payments';
import { updateReservation } from '@/client/reservations';
import type { IReservation } from '@/interfaces';
import { useTableData } from '@/hooks/useTableData';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { showToast } from '@/lib/toast';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { Receipt, Check, X, RotateCcw, MoreHorizontal } from 'lucide-react';

function formatSlotDateParts(startISO?: string, endISO?: string): { date: string; time: string } {
  if (!startISO || !endISO) return { date: 'N/A', time: 'N/A' };
  const start = new Date(startISO);
  const end = new Date(endISO);
  const date = start.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTime = start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const time = `${startTime} – ${endTime}`;
  return { date, time };
}

const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  reschedule_pending: 'Reagendar',
  to_refund: 'Pend. reembolso',
  refunded: 'Reembolsada',
  attended: 'Asistió',
  no_show: 'No asistió',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

const BADGE_CLASS = 'badge badge-sm min-w-[5.5rem] justify-center';

function ReservationStatusBadge({ status }: { status: string }) {
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

function PaymentStatusBadge({ status }: { status: string }) {
  const label = PAYMENT_STATUS_LABELS[status] ?? status;
  const variants: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-info',
  };
  return <div className={`${BADGE_CLASS} ${variants[status] ?? 'badge-ghost'}`}>{label}</div>;
}

interface ActionsDropdownProps {
  reservation: IReservation;
  processing: boolean;
  onViewDetail: (r: IReservation) => void;
  onConfirmPayment: (r: IReservation) => void;
  onRejectPayment: (r: IReservation) => void;
  onProcessRefund: (r: IReservation) => void;
}

function ActionsDropdown({
  reservation,
  processing,
  onViewDetail,
  onConfirmPayment,
  onRejectPayment,
  onProcessRefund,
}: ActionsDropdownProps) {
  const paymentPending = reservation.payment?.status === 'pending';
  const canRefund = reservation.status === 'to_refund';
  const popoverId = `actions-popover-${reservation.id}`;
  const anchorName = `--anchor-${reservation.id}`;

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="Acciones"
        popoverTarget={popoverId}
        style={{ anchorName } as React.CSSProperties}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <ul
        popover="auto"
        id={popoverId}
        className="menu dropdown dropdown-end w-48 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        <li>
          <button type="button" onClick={() => onViewDetail(reservation)}>
            <Receipt className="h-4 w-4" />
            Ver detalle
          </button>
        </li>
        {paymentPending && (
          <>
            <li>
              <button
                type="button"
                onClick={() => onConfirmPayment(reservation)}
                disabled={processing}
              >
                <Check className="h-4 w-4" />
                Confirmar pago
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onRejectPayment(reservation)}
                disabled={processing}
              >
                <X className="h-4 w-4" />
                Rechazar pago
              </button>
            </li>
          </>
        )}
        {canRefund && (
          <li>
            <button
              type="button"
              onClick={() => onProcessRefund(reservation)}
              disabled={processing}
            >
              <RotateCcw className="h-4 w-4" />
              Procesar reembolso
            </button>
        </li>
      )}
      </ul>
    </>
  );
}

type QuickFilter = 'all' | 'pending_confirm' | 'pending_refund';

export default function AdminReservationsPayments() {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const {
    data: reservations,
    loading,
    total,
    filters,
    totalPages,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    updateFilters,
    reload,
  } = useTableData<IReservation, ReservationsFilters>({
    fetchFn: getReservations,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'id',
      sortOrder: 'desc',
    },
  });

  const [detailReservation, setDetailReservation] = useState<IReservation | null>(null);
  const [processing, setProcessing] = useState(false);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const applyQuickFilter = useCallback(
    (filter: QuickFilter) => {
      setQuickFilter(filter);
      if (filter === 'pending_confirm') {
        updateFilters({ paymentStatus: 'pending', status: undefined, page: 1 });
      } else if (filter === 'pending_refund') {
        updateFilters({ status: 'to_refund', paymentStatus: undefined, page: 1 });
      } else {
        updateFilters({ status: undefined, paymentStatus: undefined, page: 1 });
      }
    },
    [updateFilters]
  );

  const columns: TableColumn<IReservation>[] = useMemo(
    () => [
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
          <div className="flex min-w-0 flex-col">
            <div className="truncate font-semibold">{r.student?.name ?? 'N/A'}</div>
            <div className="text-base-content/60 truncate text-xs">{r.student?.email ?? ''}</div>
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
                <span
                  className="truncate text-base-content/70 text-sm"
                  title={classTitle}
                >
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
          <div className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 items-center">
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
    ],
    [formatCurrency]
  );

  const openDetail = useCallback(async (r: IReservation) => {
    try {
      const full = await getReservation(r.id);
      setDetailReservation(full);
    } catch {
      showToast.error('Error al cargar detalle');
    }
  }, []);

  const handleConfirmPayment = useCallback(
    (r: IReservation) => {
      if (!r.payment || r.payment.status === 'paid') {
        showToast.error('El pago ya está confirmado');
        return;
      }
      showConfirmation({
        title: '¿Confirmar pago?',
        message: `Se confirmará la reserva #${r.id} y el pago asociado.`,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isDangerous: false,
        onConfirm: async () => {
          setProcessing(true);
          try {
            await updateReservation(r.id, { status: 'confirmed' });
            await updatePayment(r.payment!.id, { status: 'paid' });
            showToast.success('Pago confirmado correctamente');
            setDetailReservation(null);
            reload();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al confirmar');
          } finally {
            setProcessing(false);
          }
        },
      });
    },
    [showConfirmation, reload]
  );

  const handleRejectPayment = useCallback(
    (r: IReservation) => {
      if (!r.payment || r.payment.status === 'failed') {
        showToast.error('El pago ya está rechazado');
        return;
      }
      showConfirmation({
        title: '¿Rechazar pago?',
        message: 'El pago se marcará como fallido.',
        confirmText: 'Rechazar',
        cancelText: 'Cancelar',
        isDangerous: true,
        onConfirm: async () => {
          setProcessing(true);
          try {
            await updatePayment(r.payment!.id, { status: 'failed' });
            showToast.success('Pago rechazado');
            setDetailReservation(null);
            reload();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al rechazar');
          } finally {
            setProcessing(false);
          }
        },
      });
    },
    [showConfirmation, reload]
  );

  const handleProcessRefund = useCallback(
    (r: IReservation) => {
      if (r.status !== 'to_refund') {
        showToast.error('Solo se puede procesar reembolso en reservas pendientes de reembolso');
        return;
      }
      showConfirmation({
        title: '¿Procesar reembolso?',
        message: `Se marcará la reserva #${r.id} como reembolsada.`,
        confirmText: 'Procesar reembolso',
        cancelText: 'Cancelar',
        isDangerous: false,
        onConfirm: async () => {
          setProcessing(true);
          try {
            await processRefund(r.id);
            showToast.success('Reembolso procesado correctamente');
            setDetailReservation(null);
            reload();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al procesar reembolso');
          } finally {
            setProcessing(false);
          }
        },
      });
    },
    [showConfirmation, reload]
  );

  const actions: TableAction<IReservation>[] = useMemo(
    () => [
      {
        render: (r) => (
          <ActionsDropdown
            reservation={r}
            processing={processing}
            onViewDetail={openDetail}
            onConfirmPayment={handleConfirmPayment}
            onRejectPayment={handleRejectPayment}
            onProcessRefund={handleProcessRefund}
          />
        ),
      },
    ],
    [openDetail, handleConfirmPayment, handleRejectPayment, handleProcessRefund, processing]
  );

  return (
    <div className="space-y-6">
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base-content/60 text-sm">Filtrar:</span>
              {(['all', 'pending_confirm', 'pending_refund'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`btn btn-sm ${
                    quickFilter === f ? 'btn-primary' : 'btn-ghost'
                  }`}
                  onClick={() => applyQuickFilter(f)}
                >
                  {f === 'all' && 'Todas'}
                  {f === 'pending_confirm' && 'Pendientes confirmar'}
                  {f === 'pending_refund' && 'Pendientes reembolso'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="form-control w-fit">
                <span className="text-base-content/60 label-text text-xs">ID reserva</span>
                <input
                  type="number"
                  placeholder="Ej: 123"
                  className="input input-bordered input-sm w-28"
                  onChange={(e) =>
                    updateFilters({
                      id: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                />
              </label>
              <label className="form-control w-fit">
                <span className="text-base-content/60 label-text text-xs">Ref. pago</span>
                <input
                  type="text"
                  placeholder="Buscar por referencia..."
                  className="input input-bordered input-sm w-44"
                  value={filters.transactionReference ?? ''}
                  onChange={(e) =>
                    updateFilters({
                      transactionReference: e.target.value.trim() || undefined,
                      page: 1,
                    })
                  }
                />
              </label>
              <label className="form-control w-fit">
                <span className="text-base-content/60 label-text text-xs">Estado</span>
                <select
                  className="select select-bordered select-sm w-40"
                  value={filters.status ?? ''}
                  onChange={(e) =>
                    updateFilters({ status: e.target.value || undefined, page: 1 })
                  }
                >
                  <option value="">Todos</option>
                  {Object.entries(RESERVATION_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="stat rounded-lg bg-base-200 shadow">
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{total}</div>
        </div>
        <div className="stat rounded-lg bg-base-200 shadow">
          <div className="stat-title">Pendientes confirmar</div>
          <div className="stat-value text-warning">
            {reservations.filter((r) => r.payment?.status === 'pending').length}
          </div>
        </div>
        <div className="stat rounded-lg bg-base-200 shadow">
          <div className="stat-title">Pendientes reembolso</div>
          <div className="stat-value text-info">
            {reservations.filter((r) => r.status === 'to_refund').length}
          </div>
        </div>
        <div className="stat rounded-lg bg-base-200 shadow">
          <div className="stat-title">Monto (página)</div>
          <div className="stat-value text-success text-lg">
            {formatCurrency(reservations.reduce((s, r) => s + (r.payment?.amount ?? 0), 0))}
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <Table
            columns={columns}
            data={reservations}
            actions={actions}
            loading={loading}
            rowKey="id"
            onSort={handleSort}
            scroll={{ maxHeight: '60vh' }}
            pagination={{
              currentPage: filters.page ?? 1,
              totalPages,
              pageSize: filters.limit ?? 10,
              totalItems: total,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
            emptyMessage="No se encontraron reservas"
          />
        </div>
      </div>

      {detailReservation && (
        <dialog open className="modal modal-open modal-bottom sm:modal-middle z-30">
          <div className="modal-box max-h-[90dvh] w-full max-w-2xl overflow-y-auto sm:w-11/12">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold">Reserva #{detailReservation.id}</h3>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setDetailReservation(null)}
              >
                Cerrar
              </button>
            </div>
            <div className="divider my-3" />
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 items-center w-fit">
                <span className="text-base-content/60 text-xs">Reserva:</span>
                <ReservationStatusBadge status={detailReservation.status} />
                {detailReservation.payment && (
                  <>
                    <span className="text-base-content/60 text-xs">Pago:</span>
                    <PaymentStatusBadge status={detailReservation.payment.status} />
                  </>
                )}
              </div>

              <section>
                <h4 className="text-base-content/60 mb-1 text-xs font-semibold uppercase tracking-wide">
                  Estudiante
                </h4>
                <p className="font-semibold">{detailReservation.student?.name ?? 'N/A'}</p>
                <p className="text-base-content/60 text-sm">
                  {detailReservation.student?.email} · {detailReservation.student?.rut}
                </p>
              </section>

              {detailReservation.slot && (
                <section>
                  <h4 className="text-base-content/60 mb-1 text-xs font-semibold uppercase tracking-wide">
                    Clase
                  </h4>
                  <p className="font-semibold">
                    {detailReservation.slot.class?.course?.acronym} –{' '}
                    {detailReservation.slot.class?.title}
                  </p>
                  <p className="text-base-content/60 text-sm">
                    Prof: {detailReservation.slot.professor?.name}
                  </p>
                  <div className="mt-2 flex flex-col">
                    <span className="text-sm font-medium">
                      {formatSlotDateParts(
                        detailReservation.slot.startTime,
                        detailReservation.slot.endTime
                      ).date}
                    </span>
                    <span className="text-base-content/60 text-xs">
                      {formatSlotDateParts(
                        detailReservation.slot.startTime,
                        detailReservation.slot.endTime
                      ).time}
                    </span>
                  </div>
                </section>
              )}

              {detailReservation.payment && (
                <section>
                  <h4 className="text-base-content/60 mb-1 text-xs font-semibold uppercase tracking-wide">
                    Pago
                  </h4>
                  <p className="font-semibold">
                    {formatCurrency(detailReservation.payment.amount)}
                  </p>
                  <p className="text-base-content/60 font-mono text-xs">
                    Ref: {detailReservation.payment.transactionReference || '—'}
                  </p>
                  <p className="text-base-content/60 text-xs">
                    {formatDate(detailReservation.payment.createdAt)}
                  </p>
                </section>
              )}

              <section className="flex flex-wrap gap-2 border-t border-base-300 pt-4">
                {detailReservation.payment?.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={processing}
                      onClick={() => handleConfirmPayment(detailReservation)}
                    >
                      Confirmar pago
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={processing}
                      onClick={() => handleRejectPayment(detailReservation)}
                    >
                      Rechazar pago
                    </button>
                  </>
                )}
                {detailReservation.status === 'to_refund' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={processing}
                    onClick={() => handleProcessRefund(detailReservation)}
                  >
                    {processing ? 'Procesando...' : 'Marcar reembolso'}
                  </button>
                )}
              </section>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={() => setDetailReservation(null)}
          >
            <button>Cerrar</button>
          </form>
        </dialog>
      )}

      <ConfirmationModal />
    </div>
  );
}
