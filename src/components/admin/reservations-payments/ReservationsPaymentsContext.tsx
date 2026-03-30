import { createContext, useContext, type Dispatch, type FC, type ReactNode, type SetStateAction } from 'react';
import type { AdminPaymentsTabApi } from '@/hooks/useAdminPayments';
import type { AdminReservationsLegacyTabApi } from '@/hooks/useAdminReservationsLegacy';
import type { TabKind } from './types';

export interface ReservationsPaymentsContextValue {
  shell: {
    activeTab: TabKind;
    setActiveTab: Dispatch<SetStateAction<TabKind>>;
    periodLabel: string;
    goPrevMonth: () => void;
    goNextMonth: () => void;
  };
  payments: AdminPaymentsTabApi;
  reservations: AdminReservationsLegacyTabApi;
  formatCurrency: (n: number) => string;
  formatDate: (s?: string) => string;
  ConfirmationModal: FC;
}

const ReservationsPaymentsContext = createContext<ReservationsPaymentsContextValue | null>(null);

export function ReservationsPaymentsProvider({
  value,
  children,
}: {
  value: ReservationsPaymentsContextValue;
  children: ReactNode;
}) {
  return (
    <ReservationsPaymentsContext.Provider value={value}>{children}</ReservationsPaymentsContext.Provider>
  );
}

export function useReservationsPaymentsContext(): ReservationsPaymentsContextValue {
  const v = useContext(ReservationsPaymentsContext);
  if (!v) {
    throw new Error('useReservationsPaymentsContext debe usarse dentro de ReservationsPaymentsProvider');
  }
  return v;
}

export function useReservationsPaymentsShell() {
  return useReservationsPaymentsContext().shell;
}

export function useAdminPaymentsTab() {
  return useReservationsPaymentsContext().payments;
}

export function useAdminReservationsLegacyTab() {
  return useReservationsPaymentsContext().reservations;
}

export function useReservationsPaymentsFormats() {
  const { formatCurrency, formatDate } = useReservationsPaymentsContext();
  return { formatCurrency, formatDate };
}
