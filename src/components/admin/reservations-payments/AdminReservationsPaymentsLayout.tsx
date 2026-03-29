import { ADMIN_PAYMENTS_TABS_RADIO_NAME } from './constants';
import { useReservationsPaymentsContext, useReservationsPaymentsShell } from './ReservationsPaymentsContext';
import { AdminPaymentsToolbar } from './AdminPaymentsToolbar';
import { PaymentsTabPanel } from './PaymentsTabPanel';
import { ReservationsTabPanel } from './ReservationsTabPanel';
import { PaymentSearchModal } from './PaymentSearchModal';
import { ReservationDetailModal } from './ReservationDetailModal';

/**
 * Solo estructura visual (toolbar, tabs, modales). Datos y acciones vía contexto.
 */
export function AdminReservationsPaymentsLayout() {
  const { activeTab, setActiveTab } = useReservationsPaymentsShell();
  const { ConfirmationModal } = useReservationsPaymentsContext();

  return (
    <div className="space-y-5 py-4">
      <AdminPaymentsToolbar />

      <div className="tabs tabs-border w-full flex-wrap">
        <input
          type="radio"
          name={ADMIN_PAYMENTS_TABS_RADIO_NAME}
          role="tab"
          className="tab font-semibold"
          aria-label="Pagos (planes)"
          checked={activeTab === 'payments'}
          onChange={() => setActiveTab('payments')}
        />
        <div
          role="tabpanel"
          className="tab-content border-base-300 bg-base-200/25 w-full flex-shrink-0 space-y-4 border-x border-b px-3 py-4 sm:px-4"
        >
          <PaymentsTabPanel />
        </div>

        <input
          type="radio"
          name={ADMIN_PAYMENTS_TABS_RADIO_NAME}
          role="tab"
          className="tab text-base-content/65 font-semibold"
          aria-label="Reservas · legacy"
          checked={activeTab === 'reservations'}
          onChange={() => setActiveTab('reservations')}
        />
        <div
          role="tabpanel"
          className="tab-content border-base-300 bg-base-200/25 w-full flex-shrink-0 space-y-4 border-x border-b px-3 py-4 sm:px-4"
        >
          <ReservationsTabPanel />
        </div>
      </div>

      <ReservationDetailModal />
      <PaymentSearchModal />
      <ConfirmationModal />
    </div>
  );
}
