import { Table } from '@components/UI';
import { RESERVATION_STATUS_LABELS } from '../shared/constants';
import {
  useAdminReservationRecordsTab,
} from './AdminReservationRecordsContext';

export function ReservationRecordsPanel() {
  const records = useAdminReservationRecordsTab();

  const quickCards = [
    { key: 'all' as const, title: 'Todas', count: records.reservationMonthTotals?.resCountSum ?? null },
    {
      key: 'pending_refund' as const,
      title: 'Pend. reembolso',
      count: records.reservationMonthTotals?.toRefund ?? null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickCards.map((item) => {
          const active = records.quickFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => records.applyQuickFilter(item.key)}
              className={`card card-compact border-2 text-left transition-all ${
                active
                  ? 'border-secondary bg-secondary/10 shadow-md'
                  : 'border-base-300 bg-base-200 hover:border-base-content/20'
              }`}
            >
              <div className="card-body gap-1 p-3">
                <p className="text-base-content/55 text-[10px] font-semibold uppercase">
                  {item.title}
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {item.count === null ? '—' : item.count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="stat border-base-300 bg-base-200/50 rounded-lg border">
        <div className="stat-title">Coinciden filtro</div>
        <div className="stat-value text-primary">{records.reservationsTotal}</div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body gap-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <label className="form-control w-fit">
                <span className="text-base-content/60 label-text text-xs">ID reserva</span>
                <input
                  type="number"
                  placeholder="Ej: 123"
                  className="input input-bordered input-sm w-28"
                  value={records.reservationsFilters.id ?? ''}
                  onChange={(e) =>
                    records.updateReservationsFilters({
                      id: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                />
              </label>
              <label className="form-control w-fit">
                <span className="text-base-content/60 label-text text-xs">Estado reserva</span>
                <select
                  className="select select-bordered select-sm w-44"
                  value={records.reservationsFilters.status ?? ''}
                  onChange={(e) =>
                    records.updateReservationsFilters({
                      status: e.target.value || undefined,
                      page: 1,
                    })
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

      <div className="card">
        <div className="card-body">
          <Table
            columns={records.reservationColumns}
            data={records.reservations}
            actions={records.reservationActions}
            loading={records.reservationsLoading}
            rowKey="id"
            onSort={records.handleReservationsSort}
            scroll={{ maxHeight: '60vh' }}
            pagination={{
              currentPage: records.reservationsFilters.page ?? 1,
              totalPages: records.reservationsTotalPages,
              pageSize: records.reservationsFilters.limit ?? 10,
              totalItems: records.reservationsTotal,
              onPageChange: records.handleReservationsPageChange,
              onPageSizeChange: records.handleReservationsPageSizeChange,
            }}
            emptyMessage="No se encontraron reservas con los filtros actuales"
          />
        </div>
      </div>
    </div>
  );
}
