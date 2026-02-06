import { useMemo, useCallback, useState } from 'react';
import { getPayments, updatePayment, type PaymentsFilters } from '@/client/admin/payments';
import type { IPayment, IReservation } from '@/interfaces';
import { useTableData } from '@/hooks/useTableData';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { updateReservation } from '@/client/reservations';
import { showToast } from '@/lib/toast';
import { useConfirmAction } from '@/hooks/useConfirmAction';

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
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get status badge color
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

  // Table columns definition
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
        label: 'Fecha',
        sortable: true,
        formatter: (value) => <span className="text-sm">{formatDate(value as string)}</span>,
      },
      {
        key: 'reservations',
        label: 'Reservaciones',
        formatter: (value, row) => {
          const reservations = value as IReservation[] | undefined;
          const count = reservations?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <span className="badge badge-info">{count}</span>
              {reservations && reservations.length > 0 && (
                <span className="text-base-content/60 text-xs">
                  {reservations.map((r) => r.slot?.class?.title || 'N/A').join(', ')}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [formatCurrency, formatDate, getStatusBadge]
  );

  // Confirm payment
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
          // Update all associated reservations
          for (const reservation of payment.reservations!) {
            await updateReservation(reservation.id, { status: 'confirmed' });
          }

          // Update payment status
          await updatePayment(payment.id, { status: 'paid' });

          showToast.success(
            `Pago confirmado exitosamente. ${payment.reservations!.length} reservación(es) actualizada(s).`
          );
          updateFilters({}); // Refresh payments
        } catch (error) {
          console.error('Error confirming payment:', error);
          showToast.error('Error al confirmar el pago. Por favor, intente nuevamente.');
        } finally {
          setUpdatingPayment(false);
        }
      },
    });
  };

  // Cancel payment
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
          updateFilters({}); // Refresh payments
        } catch (error) {
          console.error('Error canceling payment:', error);
          showToast.error('Error al cancelar el pago. Por favor, intente nuevamente.');
        } finally {
          setUpdatingPayment(false);
        }
      },
    });
  };

  // Table actions definition
  const actions: TableAction<IPayment>[] = useMemo(
    () => [
      {
        label: 'Confirmar Pago',
        variant: 'primary',
        onClick: confirmPayment,
        isDisabled: (payment) => payment.status === 'paid' || !payment.reservations?.length,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-base-content/60 mt-2">
            Administra todos los pagos del sistema ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Stats Cards */}
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

      {/* Table */}
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

      <ConfirmationModal />
    </div>
  );
}
