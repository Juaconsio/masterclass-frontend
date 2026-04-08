import { Search } from 'lucide-react';
import { ActiveFilterBadges } from '../shared/ActiveFilterBadges';
import { AdminMonthNavigation } from '../shared/AdminMonthNavigation';
import { useAdminPaymentsShell, useAdminPaymentsTab } from './AdminPaymentsContext';

export function AdminPaymentsToolbar() {
  const { periodLabel, goPrevMonth, goNextMonth } = useAdminPaymentsShell();
  const payments = useAdminPaymentsTab();

  return (
    <div className="border-base-300 bg-base-200/40 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
      <AdminMonthNavigation
        periodLabel={periodLabel}
        goPrevMonth={goPrevMonth}
        goNextMonth={goNextMonth}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:min-w-0">
        <ActiveFilterBadges items={payments.paymentFilterBadgeItems} className="justify-end" />
        {payments.hasPaymentAdvanced && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={payments.clearPaymentAdvanced}
          >
            Limpiar búsqueda
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1"
          onClick={payments.openPaymentSearchModal}
        >
          <Search className="h-4 w-4 shrink-0" />
          Buscar
        </button>
      </div>
    </div>
  );
}
