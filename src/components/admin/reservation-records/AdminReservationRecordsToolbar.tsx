import { ActiveFilterBadges } from '../shared/ActiveFilterBadges';
import { AdminMonthNavigation } from '../shared/AdminMonthNavigation';
import {
  useAdminReservationRecordsShell,
  useAdminReservationRecordsTab,
} from './AdminReservationRecordsContext';

export function AdminReservationRecordsToolbar() {
  const { periodLabel, goPrevMonth, goNextMonth } = useAdminReservationRecordsShell();
  const records = useAdminReservationRecordsTab();

  return (
    <div className="border-base-300 bg-base-200/40 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
      <AdminMonthNavigation
        periodLabel={periodLabel}
        goPrevMonth={goPrevMonth}
        goNextMonth={goNextMonth}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:min-w-0">
        <ActiveFilterBadges items={records.reservationFilterBadgeItems} className="justify-end" />
      </div>
    </div>
  );
}
