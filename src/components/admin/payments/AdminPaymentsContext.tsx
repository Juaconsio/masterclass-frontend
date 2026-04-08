import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { AdminPaymentsTabApi } from '@/hooks/useAdminPayments';

export interface AdminPaymentsContextValue {
  shell: {
    periodLabel: string;
    goPrevMonth: () => void;
    goNextMonth: () => void;
  };
  payments: AdminPaymentsTabApi;
  formatCurrency: (n: number) => string;
  formatDate: (s?: string) => string;
  ConfirmationModal: FC;
}

const AdminPaymentsContext = createContext<AdminPaymentsContextValue | null>(null);

export function AdminPaymentsProvider({
  value,
  children,
}: {
  value: AdminPaymentsContextValue;
  children: ReactNode;
}) {
  return <AdminPaymentsContext.Provider value={value}>{children}</AdminPaymentsContext.Provider>;
}

export function useAdminPaymentsPageContext(): AdminPaymentsContextValue {
  const v = useContext(AdminPaymentsContext);
  if (!v) {
    throw new Error('useAdminPaymentsPageContext debe usarse dentro de AdminPaymentsProvider');
  }
  return v;
}

export function useAdminPaymentsShell() {
  return useAdminPaymentsPageContext().shell;
}

export function useAdminPaymentsTab() {
  return useAdminPaymentsPageContext().payments;
}

export function useAdminPaymentsFormats() {
  const { formatCurrency, formatDate } = useAdminPaymentsPageContext();
  return { formatCurrency, formatDate };
}
