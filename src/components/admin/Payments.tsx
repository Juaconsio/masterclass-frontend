import { useMemo, useCallback } from 'react';
import { getPayments, type PaymentsFilters } from '@/client/admin/payments';
import type { Payment } from '@/interfaces';
import { useTableData } from '@/hooks/useTableData';
import Table, { type TableColumn, type TableAction } from '@/components/UI/Table';

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
  } = useTableData<Payment, PaymentsFilters>({
    fetchFn: getPayments,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

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
  const columns: TableColumn<Payment>[] = useMemo(
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
    ],
    [formatCurrency, formatDate, getStatusBadge]
  );

  // Table actions definition
  const actions: TableAction<Payment>[] = useMemo(
    () => [
      {
        label: 'Ver detalles',
        variant: 'primary',
        onClick: (payment) => {
          // TODO: Implement view details modal
        },
      },
      {
        label: 'Descargar',
        variant: 'secondary',
        onClick: (payment) => {
          // TODO: Implement download receipt
        },
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        ),
      },
    ],
    []
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
                    | 'completed'
                    | 'failed'
                    | undefined,
                  page: 1,
                })
              }
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
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
          <div className="stat-title">Completados</div>
          <div className="stat-value text-info">
            {payments.filter((p) => p.status.toLowerCase() === 'completed').length}
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
    </div>
  );
}
