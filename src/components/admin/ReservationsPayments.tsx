import { useCallback, useState } from 'react';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { useLocaleFormats } from '@/hooks/useLocaleFormats';
import { useUtcMonthPeriod } from '@/hooks/useUtcMonthPeriod';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { useAdminReservationsLegacy } from '@/hooks/useAdminReservationsLegacy';
import {
  ReservationsPaymentsProvider,
  type ReservationsPaymentsContextValue,
} from './reservations-payments/ReservationsPaymentsContext';
import { AdminReservationsPaymentsLayout } from './reservations-payments/AdminReservationsPaymentsLayout';
import type { TabKind } from './reservations-payments/types';

/**
 * Orquestador: hooks, clientes vía hooks de dominio, valor del Provider. Sin layout.
 */
export default function AdminReservationsPayments() {
  const [activeTab, setActiveTab] = useState<TabKind>('payments');
  const { showConfirmation, ConfirmationModal } = useConfirmAction();
  const { formatCurrency, formatDate } = useLocaleFormats();
  const { periodYear, periodMonth, periodLabel, setYearMonth } = useUtcMonthPeriod();

  const reservations = useAdminReservationsLegacy(periodYear, periodMonth, {
    showConfirmation,
    formatCurrency,
  });

  const payments = useAdminPayments(periodYear, periodMonth, {
    showConfirmation,
    formatCurrency,
    formatDate,
    onAfterPaymentConfirmed: reservations.reloadReservations,
  });

  const goPrevMonth = useCallback(() => {
    const y = periodMonth <= 1 ? periodYear - 1 : periodYear;
    const m = periodMonth <= 1 ? 12 : periodMonth - 1;
    setYearMonth(y, m);
    payments.onUtcMonthChange(y, m);
    reservations.onUtcMonthChange(y, m);
  }, [
    periodYear,
    periodMonth,
    setYearMonth,
    payments.onUtcMonthChange,
    reservations.onUtcMonthChange,
  ]);

  const goNextMonth = useCallback(() => {
    const y = periodMonth >= 12 ? periodYear + 1 : periodYear;
    const m = periodMonth >= 12 ? 1 : periodMonth + 1;
    setYearMonth(y, m);
    payments.onUtcMonthChange(y, m);
    reservations.onUtcMonthChange(y, m);
  }, [
    periodYear,
    periodMonth,
    setYearMonth,
    payments.onUtcMonthChange,
    reservations.onUtcMonthChange,
  ]);

  const contextValue: ReservationsPaymentsContextValue = {
    shell: {
      activeTab,
      setActiveTab,
      periodLabel,
      goPrevMonth,
      goNextMonth,
    },
    payments,
    reservations,
    formatCurrency,
    formatDate,
    ConfirmationModal,
  };

  return (
    <ReservationsPaymentsProvider value={contextValue}>
      <AdminReservationsPaymentsLayout />
    </ReservationsPaymentsProvider>
  );
}
