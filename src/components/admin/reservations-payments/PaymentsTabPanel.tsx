import { Table } from '@components/UI';
import { PAYMENT_STATUS_CARD_LABELS, PAYMENT_STATUS_CARD_ORDER } from './constants';
import {
  useAdminPaymentsTab,
  useReservationsPaymentsFormats,
} from './ReservationsPaymentsContext';

export function PaymentsTabPanel() {
  const payments = useAdminPaymentsTab();
  const { formatCurrency } = useReservationsPaymentsFormats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PAYMENT_STATUS_CARD_ORDER.map((key) => {
          const active = payments.paymentStatusFilter === key;
          const count =
            payments.paymentSummary != null
              ? key === 'all'
                ? payments.paymentSummary.totals.count
                : (payments.paymentSummary.byStatus[key]?.count ?? 0)
              : null;
          const amountSum =
            payments.paymentSummary != null
              ? key === 'all'
                ? payments.paymentSummary.totals.amountSum
                : (payments.paymentSummary.byStatus[key]?.amountSum ?? 0)
              : null;
          return (
            <button
              key={key}
              type="button"
              onClick={() => payments.selectPaymentStatusFilter(key)}
              className={`card card-compact border-2 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-base-300 bg-base-200 hover:border-base-content/20'
              }`}
            >
              <div className="card-body gap-0.5 p-3 sm:p-3.5">
                <p className="text-base-content/50 text-[10px] font-semibold uppercase sm:text-[11px]">
                  {PAYMENT_STATUS_CARD_LABELS[key]}
                </p>
                <p className="text-success text-lg leading-tight font-bold tabular-nums sm:text-xl">
                  {amountSum === null ? '—' : formatCurrency(amountSum)}
                </p>
                <p className="text-base-content/45 text-[11px] tabular-nums">
                  {count === null ? '—' : `${count} pago${count !== 1 ? 's' : ''}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Table
        columns={payments.paymentColumns}
        data={payments.payments}
        actions={payments.paymentActions}
        loading={payments.paymentsLoading}
        rowKey="id"
        striped={false}
        onSort={payments.handlePaymentsSort}
        scroll={{ maxHeight: '60vh' }}
        pagination={{
          currentPage: payments.paymentsFilters.page ?? 1,
          totalPages: payments.paymentsTotalPages,
          pageSize: payments.paymentsFilters.limit ?? 10,
          totalItems: payments.paymentsTotal,
          onPageChange: payments.handlePaymentsPageChange,
          onPageSizeChange: payments.handlePaymentsPageSizeChange,
        }}
        emptyMessage={payments.paymentsEmptyMessage}
      />
    </div>
  );
}
