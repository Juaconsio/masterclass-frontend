import { useAdminPaymentsPageContext } from './AdminPaymentsContext';
import { AdminPaymentsToolbar } from './AdminPaymentsToolbar';
import { PaymentsTabPanel } from './PaymentsTabPanel';
import { PaymentSearchModal } from './PaymentSearchModal';

export function AdminPaymentsLayout() {
  const { ConfirmationModal } = useAdminPaymentsPageContext();

  return (
    <div className="space-y-5 py-4">
      <AdminPaymentsToolbar />
      <div className="border-base-300 bg-base-200/25 w-full space-y-4 rounded-xl border px-3 py-4 sm:px-4">
        <PaymentsTabPanel />
      </div>
      <PaymentSearchModal />
      <ConfirmationModal />
    </div>
  );
}
