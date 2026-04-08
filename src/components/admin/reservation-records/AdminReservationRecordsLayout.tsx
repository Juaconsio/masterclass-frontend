import { useAdminReservationRecordsPageContext } from './AdminReservationRecordsContext';
import { AdminReservationRecordsToolbar } from './AdminReservationRecordsToolbar';
import { ReservationRecordsPanel } from './ReservationRecordsPanel';
import { ReservationDetailModal } from './ReservationDetailModal';

export function AdminReservationRecordsLayout() {
  const { ConfirmationModal } = useAdminReservationRecordsPageContext();

  return (
    <div className="space-y-5 py-4">
      <AdminReservationRecordsToolbar />
      <div className="border-base-300 bg-base-200/25 w-full space-y-4 rounded-xl border px-3 py-4 sm:px-4">
        <ReservationRecordsPanel />
      </div>
      <ReservationDetailModal />
      <ConfirmationModal />
    </div>
  );
}
