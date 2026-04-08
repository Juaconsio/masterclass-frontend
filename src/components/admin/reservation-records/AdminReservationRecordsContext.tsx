import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { AdminReservationRecordsApi } from '@/hooks/useAdminReservationRecords';

export interface AdminReservationRecordsContextValue {
  shell: {
    periodLabel: string;
    goPrevMonth: () => void;
    goNextMonth: () => void;
  };
  records: AdminReservationRecordsApi;
  ConfirmationModal: FC;
}

const AdminReservationRecordsContext = createContext<AdminReservationRecordsContextValue | null>(
  null
);

export function AdminReservationRecordsProvider({
  value,
  children,
}: {
  value: AdminReservationRecordsContextValue;
  children: ReactNode;
}) {
  return (
    <AdminReservationRecordsContext.Provider value={value}>
      {children}
    </AdminReservationRecordsContext.Provider>
  );
}

export function useAdminReservationRecordsPageContext(): AdminReservationRecordsContextValue {
  const v = useContext(AdminReservationRecordsContext);
  if (!v) {
    throw new Error(
      'useAdminReservationRecordsPageContext debe usarse dentro de AdminReservationRecordsProvider'
    );
  }
  return v;
}

export function useAdminReservationRecordsShell() {
  return useAdminReservationRecordsPageContext().shell;
}

export function useAdminReservationRecordsTab() {
  return useAdminReservationRecordsPageContext().records;
}
