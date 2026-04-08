import { useCallback } from 'react';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { useUtcMonthPeriod } from '@/hooks/useUtcMonthPeriod';
import { useAdminReservationRecords } from '@/hooks/useAdminReservationRecords';
import {
  AdminReservationRecordsProvider,
  type AdminReservationRecordsContextValue,
} from './reservation-records/AdminReservationRecordsContext';
import { AdminReservationRecordsLayout } from './reservation-records/AdminReservationRecordsLayout';

export default function AdminReservationRecords() {
  const { showConfirmation, ConfirmationModal } = useConfirmAction();
  const { periodYear, periodMonth, periodLabel, setYearMonth } = useUtcMonthPeriod();

  const records = useAdminReservationRecords(periodYear, periodMonth, {
    showConfirmation,
  });

  const goPrevMonth = useCallback(() => {
    const y = periodMonth <= 1 ? periodYear - 1 : periodYear;
    const m = periodMonth <= 1 ? 12 : periodMonth - 1;
    setYearMonth(y, m);
    records.onUtcMonthChange(y, m);
  }, [periodYear, periodMonth, setYearMonth, records.onUtcMonthChange]);

  const goNextMonth = useCallback(() => {
    const y = periodMonth >= 12 ? periodYear + 1 : periodYear;
    const m = periodMonth >= 12 ? 1 : periodMonth + 1;
    setYearMonth(y, m);
    records.onUtcMonthChange(y, m);
  }, [periodYear, periodMonth, setYearMonth, records.onUtcMonthChange]);

  const contextValue: AdminReservationRecordsContextValue = {
    shell: {
      periodLabel,
      goPrevMonth,
      goNextMonth,
    },
    records,
    ConfirmationModal,
  };

  return (
    <AdminReservationRecordsProvider value={contextValue}>
      <AdminReservationRecordsLayout />
    </AdminReservationRecordsProvider>
  );
}
