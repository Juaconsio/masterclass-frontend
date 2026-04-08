import { useCallback } from 'react';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { useLocaleFormats } from '@/hooks/useLocaleFormats';
import { useUtcMonthPeriod } from '@/hooks/useUtcMonthPeriod';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { AdminPaymentsProvider, type AdminPaymentsContextValue } from './payments/AdminPaymentsContext';
import { AdminPaymentsLayout } from './payments/AdminPaymentsLayout';

export default function AdminPayments() {
  const { showConfirmation, ConfirmationModal } = useConfirmAction();
  const { formatCurrency, formatDate } = useLocaleFormats();
  const { periodYear, periodMonth, periodLabel, setYearMonth } = useUtcMonthPeriod();

  const payments = useAdminPayments(periodYear, periodMonth, {
    showConfirmation,
    formatCurrency,
    formatDate,
  });

  const goPrevMonth = useCallback(() => {
    const y = periodMonth <= 1 ? periodYear - 1 : periodYear;
    const m = periodMonth <= 1 ? 12 : periodMonth - 1;
    setYearMonth(y, m);
    payments.onUtcMonthChange(y, m);
  }, [periodYear, periodMonth, setYearMonth, payments.onUtcMonthChange]);

  const goNextMonth = useCallback(() => {
    const y = periodMonth >= 12 ? periodYear + 1 : periodYear;
    const m = periodMonth >= 12 ? 1 : periodMonth + 1;
    setYearMonth(y, m);
    payments.onUtcMonthChange(y, m);
  }, [periodYear, periodMonth, setYearMonth, payments.onUtcMonthChange]);

  const contextValue: AdminPaymentsContextValue = {
    shell: {
      periodLabel,
      goPrevMonth,
      goNextMonth,
    },
    payments,
    formatCurrency,
    formatDate,
    ConfirmationModal,
  };

  return (
    <AdminPaymentsProvider value={contextValue}>
      <AdminPaymentsLayout />
    </AdminPaymentsProvider>
  );
}
