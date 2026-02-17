import { useMemo, useCallback, useState } from 'react';
import { getPayments, updatePayment, type PaymentsFilters } from '@/client/admin/payments';
import type { IPayment, IReservation, ISlot, IStudent } from '@/interfaces';
import { useTableData } from '@/hooks/useTableData';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { updateReservation } from '@/client/reservations';
import { showToast } from '@/lib/toast';
import { useConfirmAction } from '@/hooks/useConfirmAction';

function formatSlotRange(startISO?: string, endISO?: string) {
  if (!startISO || !endISO) return 'N/A';

  const start = new Date(startISO);
  const end = new Date(endISO);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (!sameDay) {
    return `${start.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })} – ${end.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  const datePart = start.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const startTime = start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${startTime}–${endTime}`;
}

export default function AdminPayments() {
  const {
    data: payments,
    loading,
    total,
    filters,
    totalPages,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    updateFilters,
  } = useTableData<IPayment, PaymentsFilters>({
    fetchFn: getPayments,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [detailsPayment, setDetailsPayment] = useState<IPayment | null>(null);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <div className="badge badge-success">Pagado</div>;
      case 'pending':
        return <div className="badge badge-warning">Pendiente</div>;
      case 'failed':
        return <div className="badge badge-error">Fallido</div>;
      case 'refunded':
        return <div className="badge badge-info">Reembolsado</div>;
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  }, []);

  const pickStudent = useCallback((payment: IPayment): IStudent | undefined => {
    return payment.student ?? payment.reservations?.find((r) => r.student)?.student ?? undefined;
  }, []);

  const pickPrimarySlot = useCallback((payment: IPayment): ISlot | undefined => {
    return payment.reservations?.find((r) => r.slot)?.slot ?? payment.reservations?.[0]?.slot;
  }, []);

  const columns: TableColumn<IPayment>[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        formatter: (value) => <span className="font-mono text-sm">#{value}</span>,
      },
      {
        key: 'transactionReference',
        label: 'Referencia',
        formatter: (value) => (
          <span className="badge badge-ghost font-mono text-xs">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'student',
        label: 'Estudiante',
        className: 'min-w-[16rem]',
        render: (payment) => {
          const student = pickStudent(payment);
          const name = student?.name || 'N/A';
          const rut = student?.rut || 'RUT N/A';
          const email = student?.email || 'Email N/A';
          return (
            <div className="flex min-w-0 flex-col">
              <div className="truncate leading-tight font-semibold">{name}</div>
              <div className="text-base-content/60 truncate text-xs leading-tight">{rut}</div>
              <div className="text-base-content/60 truncate text-xs leading-tight">{email}</div>
            </div>
          );
        },
      },
      {
        key: 'slot',
        label: 'Reservaciones / Plan',
        className: 'min-w-[20rem]',
        render: (payment) => {
          const reservations = payment.reservations || [];
          const count = reservations.length;
          const slot = pickPrimarySlot(payment);
          const classTitle = slot?.class?.title || 'Clase N/A';
          const courseAcronym = slot?.class?.course?.acronym;
          const professorName =
            slot?.professor?.name || (slot?.professorId ? `#${slot.professorId}` : 'N/A');
          const range = formatSlotRange(slot?.startTime, slot?.endTime);

          if (count > 1) {
            return <span>Plan: Por implementar</span>;
          }
          return (
            <div className="flex min-w-0 flex-col gap-1">
              <div className="truncate leading-tight font-semibold">
                {courseAcronym ? `${courseAcronym} · ` : ''}
                {classTitle}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-base-content/60 truncate text-xs leading-tight">
                  Prof: {professorName}
                </div>
                <div className="text-base-content/60 truncate text-xs leading-tight">·</div>
                <div className="text-base-content/60 truncate text-xs leading-tight">{range}</div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'amount',
        label: 'Monto',
        sortable: true,
        formatter: (value) => (
          <span className="font-semibold">{formatCurrency(value as number)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Estado',
        sortable: true,
        formatter: (value) => getStatusBadge(value as string),
      },
      {
        key: 'createdAt',
        label: 'Fecha de registro',
        sortable: true,
        formatter: (value) => <span className="text-sm">{formatDate(value as string)}</span>,
      },
    ],
    [formatCurrency, formatDate, getStatusBadge, pickPrimarySlot, pickStudent]
  );

  const confirmPayment = async (payment: IPayment) => {
    if (payment.status === 'paid') {
      showToast.error('El pago ya está confirmado');
      return;
    }

    if (!payment.reservations || payment.reservations.length === 0) {
      showToast.error('El pago no tiene reservaciones asociadas');
      return;
    }

    showConfirmation({
      title: '¿Confirmar pago?',
      message: `Se confirmarán ${payment.reservations.length} reservación(es) asociada(s) a este pago.`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      isDangerous: false,
      onConfirm: async () => {
        setUpdatingPayment(true);
        try {
          for (const reservation of payment.reservations!) {
            await updateReservation(reservation.id, { status: 'confirmed' });
          }

          await updatePayment(payment.id, { status: 'paid' });

          showToast.success(
            `Pago confirmado exitosamente. ${payment.reservations!.length} reservación(es) actualizada(s).`
          );
          updateFilters({});
        } catch (error) {
          console.error('Error confirming payment:', error);
          showToast.error('Error al confirmar el pago. Por favor, intente nuevamente.');
        } finally {
          setUpdatingPayment(false);
        }
      },
    });
  };

  const cancelPayment = async (payment: IPayment) => {
    if (payment.status === 'failed') {
      showToast.error('El pago ya está cancelado');
      return;
    }

    showConfirmation({
      title: '¿Cancelar pago?',
      message: '¿Está seguro de que desea cancelar este pago?',
      confirmText: 'Cancelar Pago',
      cancelText: 'Volver',
      isDangerous: true,
      onConfirm: async () => {
        setUpdatingPayment(true);
        try {
          await updatePayment(payment.id, { status: 'failed' });
          showToast.success('Pago cancelado exitosamente');
          updateFilters({});
        } catch (error) {
          console.error('Error canceling payment:', error);
          showToast.error('Error al cancelar el pago. Por favor, intente nuevamente.');
        } finally {
          setUpdatingPayment(false);
        }
      },
    });
  };

  const actions: TableAction<IPayment>[] = useMemo(
    () => [
      {
        label: 'Confirmar Pago',
        variant: 'primary',
        onClick: confirmPayment,
        isDisabled: (payment) => ['paid', 'failed'].includes(payment.status),
      },
      {
        label: 'Cancelar',
        variant: 'secondary',
        onClick: cancelPayment,
        isDisabled: (payment) => payment.status === 'failed' || payment.status === 'paid',
      },
    ],
    [confirmPayment, cancelPayment]
  );

  return (
    <div className="space-y-6">
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="number"
              placeholder="Buscar por ID..."
              className="input input-bordered w-full md:w-auto"
              onChange={(e) =>
                updateFilters({ id: e.target.value ? Number(e.target.value) : undefined })
              }
            />
            <input
              type="text"
              placeholder="Buscar por Referencia..."
              className="input input-bordered w-full md:w-auto"
              onChange={(e) => updateFilters({ transactionReference: e.target.value || undefined })}
            />
            <select
              className="select select-bordered w-full md:w-auto"
              value={filters.status || ''}
              onChange={(e) =>
                updateFilters({
                  status: (e.target.value || undefined) as
                    | 'pending'
                    | 'paid'
                    | 'failed'
                    | 'refunded'
                    | undefined,
                  page: 1,
                })
              }
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Total Pagos</div>
          <div className="stat-value text-primary">{total}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Monto Total</div>
          <div className="stat-value text-success">
            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Pagados</div>
          <div className="stat-value text-info">
            {payments.filter((p) => p.status.toLowerCase() === 'paid').length}
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <Table
            columns={columns}
            data={payments}
            actions={actions}
            loading={loading}
            rowKey="id"
            onSort={handleSort}
            pagination={{
              currentPage: filters.page || 1,
              totalPages,
              pageSize: filters.limit || 10,
              totalItems: total,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
            emptyMessage="No se encontraron pagos"
          />
        </div>
      </div>

      {detailsPayment && (
        <dialog open className="modal modal-open modal-bottom sm:modal-middle z-30">
          <div className="modal-box max-h-[90dvh] w-full max-w-4xl overflow-hidden sm:w-11/12">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold">Detalle de pago #{detailsPayment.id}</h3>
                <div className="text-base-content/60 mt-1 flex flex-wrap items-center gap-2 text-sm">
                  {getStatusBadge(detailsPayment.status)}
                  <span className="font-semibold">{formatCurrency(detailsPayment.amount)}</span>
                  <span className="font-mono text-xs">
                    {detailsPayment.transactionReference || 'Sin referencia'}
                  </span>
                  <span className="text-xs">{formatDate(detailsPayment.createdAt)}</span>
                </div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setDetailsPayment(null)}>
                Cerrar
              </button>
            </div>

            <div className="divider my-3" />

            <div className="max-h-[70dvh] space-y-3 overflow-y-auto pr-1">
              {(detailsPayment.reservations || []).length === 0 ? (
                <div className="text-base-content/60 text-sm">
                  Este pago no tiene reservaciones.
                </div>
              ) : (
                (detailsPayment.reservations || []).map((reservation) => {
                  const student = reservation.student || detailsPayment.student;
                  const slot = reservation.slot;
                  const classTitle = slot?.class?.title || 'Clase N/A';
                  const courseAcronym = slot?.class?.course?.acronym;
                  const professorName =
                    slot?.professor?.name || (slot?.professorId ? `#${slot.professorId}` : 'N/A');
                  const range = formatSlotRange(slot?.startTime, slot?.endTime);

                  return (
                    <div
                      key={reservation.id}
                      className="border-base-300 bg-base-100 rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm leading-tight font-semibold">
                            {student?.name || 'N/A'}
                          </div>
                          <div className="text-base-content/60 text-xs leading-tight">
                            {student?.rut || 'RUT N/A'}
                          </div>
                          <div className="text-base-content/60 text-xs leading-tight">
                            {student?.email || 'Email N/A'}
                          </div>
                        </div>

                        <div className="min-w-0 sm:text-right">
                          <div className="text-sm leading-tight font-semibold">
                            {courseAcronym ? `${courseAcronym} · ` : ''}
                            {classTitle}
                          </div>
                          <div className="text-base-content/60 text-xs leading-tight">
                            Prof: {professorName}
                          </div>
                          <div className="text-base-content/60 text-xs leading-tight">{range}</div>
                          <div className="text-base-content/60 mt-1 text-xs leading-tight">
                            Reserva #{reservation.id} · {reservation.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setDetailsPayment(null)}>
            <button>Cerrar</button>
          </form>
        </dialog>
      )}

      <ConfirmationModal />
    </div>
  );
}
