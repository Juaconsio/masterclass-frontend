import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  getReservations,
  getReservation,
  processRefund,
  getReservationStats,
  type ReservationsFilters,
  type AdminReservationStats,
} from '@/client/admin/reservations';
import type { IReservation } from '@/interfaces';
import { useTableData } from '@/hooks/useTableData';
import type { TableAction, TableColumn } from '@components/UI';
import { showToast } from '@/lib/toast';
import type { ConfirmActionOptions } from '@/hooks/useConfirmAction';
import { utcMonthInclusiveISO } from '@/components/admin/reservations-payments/dateUtils';
import { buildReservationFilterBadgeItems } from '@/components/admin/reservations-payments/filterBadgeUtils';
import { createReservationTableColumns } from '@/components/admin/reservations-payments/reservationTableColumns';
import { ReservationTableActions } from '@/components/admin/reservations-payments/ReservationTableActions';
import type { QuickFilter } from '@/components/admin/reservations-payments/types';

export interface UseAdminReservationsLegacyOptions {
  showConfirmation: (options: ConfirmActionOptions) => void;
  formatCurrency: (n: number) => string;
}

/**
 * Pestaña legacy de reservas admin (tabla, stats mensuales, reembolsos). Sin lógica de pagos de plan.
 */
export function useAdminReservationsLegacy(
  periodYear: number,
  periodMonth: number,
  { showConfirmation, formatCurrency }: UseAdminReservationsLegacyOptions
) {
  const initialRange = utcMonthInclusiveISO(periodYear, periodMonth);

  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [reservationStats, setReservationStats] = useState<AdminReservationStats | null>(null);
  const [detailReservation, setDetailReservation] = useState<IReservation | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data: reservations,
    loading: reservationsLoading,
    total: reservationsTotal,
    filters: reservationsFilters,
    totalPages: reservationsTotalPages,
    handleSort: handleReservationsSort,
    handlePageChange: handleReservationsPageChange,
    handlePageSizeChange: handleReservationsPageSizeChange,
    updateFilters: updateReservationsFilters,
    reload: reloadReservations,
  } = useTableData<IReservation, ReservationsFilters>({
    fetchFn: getReservations,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'id',
      sortOrder: 'desc',
      paymentCreatedFrom: initialRange.createdFrom,
      paymentCreatedTo: initialRange.createdTo,
    },
  });

  const onUtcMonthChange = useCallback(
    (y: number, m: number) => {
      const { createdFrom, createdTo } = utcMonthInclusiveISO(y, m);
      updateReservationsFilters({
        paymentCreatedFrom: createdFrom,
        paymentCreatedTo: createdTo,
        page: 1,
      });
    },
    [updateReservationsFilters]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getReservationStats({
          year: periodYear,
          month: periodMonth,
          id: reservationsFilters.id,
          status: reservationsFilters.status,
          paymentStatus: reservationsFilters.paymentStatus,
          transactionReference: reservationsFilters.transactionReference,
          paymentCreatedFrom: reservationsFilters.paymentCreatedFrom,
          paymentCreatedTo: reservationsFilters.paymentCreatedTo,
          studentId: reservationsFilters.studentId,
          slotId: reservationsFilters.slotId,
        });
        if (!cancelled) setReservationStats(r);
      } catch {
        if (!cancelled) setReservationStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    periodYear,
    periodMonth,
    reservationsFilters.id,
    reservationsFilters.status,
    reservationsFilters.paymentStatus,
    reservationsFilters.transactionReference,
    reservationsFilters.paymentCreatedFrom,
    reservationsFilters.paymentCreatedTo,
    reservationsFilters.studentId,
    reservationsFilters.slotId,
  ]);

  const applyQuickFilter = useCallback(
    (filter: QuickFilter) => {
      setQuickFilter(filter);
      const { createdFrom, createdTo } = utcMonthInclusiveISO(periodYear, periodMonth);
      const base = {
        page: 1 as const,
        paymentCreatedFrom: createdFrom,
        paymentCreatedTo: createdTo,
      };
      if (filter === 'pending_confirm') {
        updateReservationsFilters({ ...base, paymentStatus: 'pending', status: undefined });
      } else if (filter === 'pending_refund') {
        updateReservationsFilters({ ...base, status: 'to_refund', paymentStatus: undefined });
      } else {
        updateReservationsFilters({ ...base, status: undefined, paymentStatus: undefined });
      }
    },
    [updateReservationsFilters, periodYear, periodMonth]
  );

  const openDetail = useCallback(async (r: IReservation) => {
    try {
      const full = await getReservation(r.id);
      setDetailReservation(full);
    } catch {
      showToast.error('Error al cargar detalle');
    }
  }, []);

  const handleProcessRefund = useCallback(
    (r: IReservation) => {
      if (r.status !== 'to_refund') {
        showToast.error('Solo se puede procesar reembolso en reservas pendientes de reembolso');
        return;
      }
      showConfirmation({
        title: '¿Procesar reembolso?',
        message: `Se marcará la reserva #${r.id} como reembolsada.`,
        confirmText: 'Procesar reembolso',
        cancelText: 'Cancelar',
        isDangerous: false,
        onConfirm: async () => {
          setProcessing(true);
          setProcessingId(r.id);
          try {
            await processRefund(r.id);
            showToast.success('Reembolso procesado correctamente');
            setDetailReservation(null);
            reloadReservations();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al procesar reembolso');
          } finally {
            setProcessing(false);
            setProcessingId(null);
          }
        },
      });
    },
    [showConfirmation, reloadReservations]
  );

  const reservationMonthTotals = useMemo(() => {
    if (!reservationStats) return null;
    const resCountSum = Object.values(reservationStats.reservationsByStatus).reduce(
      (a, b) => a + b,
      0
    );
    const paidAmountMonth = reservationStats.paymentsLinkedByStatus.paid?.amountSum ?? 0;
    const pendingPayments = reservationStats.paymentsLinkedByStatus.pending?.count ?? 0;
    const toRefund = reservationStats.reservationsByStatus.to_refund ?? 0;
    return { resCountSum, paidAmountMonth, pendingPayments, toRefund };
  }, [reservationStats]);

  const reservationFilterBadgeItems = useMemo(
    () => buildReservationFilterBadgeItems(quickFilter, reservationsFilters),
    [quickFilter, reservationsFilters]
  );

  const reservationColumns: TableColumn<IReservation>[] = useMemo(
    () => createReservationTableColumns(formatCurrency),
    [formatCurrency]
  );

  const reservationActions: TableAction<IReservation>[] = useMemo(
    () => [
      {
        render: (r) => (
          <ReservationTableActions
            reservation={r}
            processing={processing}
            processingId={processingId}
            onViewDetail={openDetail}
            onProcessRefund={handleProcessRefund}
          />
        ),
      },
    ],
    [openDetail, handleProcessRefund, processing, processingId]
  );

  return {
    onUtcMonthChange,
    quickFilter,
    applyQuickFilter,
    reservationMonthTotals,
    reservationFilterBadgeItems,
    reservations,
    reservationsLoading,
    reservationsTotal,
    reservationsFilters,
    updateReservationsFilters,
    handleReservationsSort,
    reservationsTotalPages,
    handleReservationsPageChange,
    handleReservationsPageSizeChange,
    detailReservation,
    setDetailReservation,
    handleProcessRefund,
    reservationColumns,
    reservationActions,
    processing,
    processingId,
    reloadReservations,
  };
}

export type AdminReservationsLegacyTabApi = ReturnType<typeof useAdminReservationsLegacy>;
