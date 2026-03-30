import { Search } from 'lucide-react';
import { ActiveFilterBadges } from './ActiveFilterBadges';
import {
  useAdminPaymentsTab,
  useAdminReservationsLegacyTab,
  useReservationsPaymentsShell,
} from './ReservationsPaymentsContext';

export function AdminPaymentsToolbar() {
  const { activeTab, periodLabel, goPrevMonth, goNextMonth } = useReservationsPaymentsShell();
  const payments = useAdminPaymentsTab();
  const reservations = useAdminReservationsLegacyTab();

  return (
    <div className="border-base-300 bg-base-200/40 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={goPrevMonth}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="min-w-[9rem] text-center text-sm font-semibold capitalize sm:min-w-[11rem]">
          {periodLabel}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={goNextMonth}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:min-w-0">
        {activeTab === 'payments' && (
          <ActiveFilterBadges items={payments.paymentFilterBadgeItems} className="justify-end" />
        )}
        {activeTab === 'reservations' && (
          <ActiveFilterBadges
            items={reservations.reservationFilterBadgeItems}
            className="justify-end"
          />
        )}
        {activeTab === 'payments' && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
