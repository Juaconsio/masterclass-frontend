import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  getPayments,
  getPaymentSummary,
  confirmPayment,
  rejectPayment,
  type PaymentsFilters,
  type AdminPayment,
  type AdminPaymentSummary,
} from '@/client/admin/payments';
import { useTableData } from '@/hooks/useTableData';
import type { TableAction, TableColumn } from '@components/UI';
import { showToast } from '@/lib/toast';
import type { ConfirmActionOptions } from '@/hooks/useConfirmAction';
import { adminPricingPlansClient, type AdminPricingPlanListItem } from '@/client/admin/pricingPlans';
import { utcMonthInclusiveISO } from '@/components/admin/reservations-payments/dateUtils';
import { buildPaymentFilterUpdates } from '@/components/admin/reservations-payments/paymentFilterUtils';
import { buildPaymentFilterBadgeItems } from '@/components/admin/reservations-payments/filterBadgeUtils';
import { PAYMENT_STATUS_CARD_LABELS } from '@/components/admin/reservations-payments/constants';
import { createPaymentTableColumns } from '@/components/admin/reservations-payments/paymentTableColumns';
import { PaymentTableActions } from '@/components/admin/reservations-payments/PaymentTableActions';
import type {
  AppliedPaymentAdvanced,
  PaymentSearchDraft,
  PaymentStatusFilter,
} from '@/components/admin/reservations-payments/types';

const emptyPaymentSearchDraft = (): PaymentSearchDraft => ({
  id: '',
  transactionReference: '',
  studentRut: '',
  pricingPlanId: '',
  paymentDateFrom: '',
  paymentDateTo: '',
});

export interface UseAdminPaymentsOptions {
  showConfirmation: (options: ConfirmActionOptions) => void;
  formatCurrency: (n: number) => string;
  formatDate: (s?: string) => string;
  /** Tras confirmar un pago de plan, refrescar listados externos (p. ej. reservas legacy). */
  onAfterPaymentConfirmed?: () => void;
}

/**
 * Lista, filtros y acciones de pagos admin (planes). Sin reservas.
 */
export function useAdminPayments(
  periodYear: number,
  periodMonth: number,
  {
    showConfirmation,
    formatCurrency,
    formatDate,
    onAfterPaymentConfirmed,
  }: UseAdminPaymentsOptions
) {
  const initialRange = utcMonthInclusiveISO(periodYear, periodMonth);

  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>('all');
  const [appliedPaymentAdvanced, setAppliedPaymentAdvanced] = useState<AppliedPaymentAdvanced>({});
  const appliedAdvancedRef = useRef<AppliedPaymentAdvanced>({});
  const [paymentSearchOpen, setPaymentSearchOpen] = useState(false);
  const [planOptions, setPlanOptions] = useState<AdminPricingPlanListItem[]>([]);
  const [paymentSearchDraft, setPaymentSearchDraft] = useState<PaymentSearchDraft>(
    emptyPaymentSearchDraft
  );
  const [paymentSummary, setPaymentSummary] = useState<AdminPaymentSummary | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    appliedAdvancedRef.current = appliedPaymentAdvanced;
  }, [appliedPaymentAdvanced]);

  useEffect(() => {
    adminPricingPlansClient
      .list({ pageSize: 100 })
      .then((r) => setPlanOptions(r.data))
      .catch(() => setPlanOptions([]));
  }, []);

  const {
    data: payments,
    loading: paymentsLoading,
    total: paymentsTotal,
    filters: paymentsFilters,
    totalPages: paymentsTotalPages,
    handleSort: handlePaymentsSort,
    handlePageChange: handlePaymentsPageChange,
    handlePageSizeChange: handlePaymentsPageSizeChange,
    updateFilters: updatePaymentsFilters,
    reload: reloadPayments,
  } = useTableData<AdminPayment, PaymentsFilters>({
    fetchFn: getPayments,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      createdFrom: initialRange.createdFrom,
      createdTo: initialRange.createdTo,
    } as PaymentsFilters,
  });

  const hasPaymentAdvanced = useMemo(
    () =>
      Boolean(
        appliedPaymentAdvanced.id ||
          appliedPaymentAdvanced.transactionReference?.trim() ||
          appliedPaymentAdvanced.studentRut?.trim() ||
          appliedPaymentAdvanced.pricingPlanId ||
          appliedPaymentAdvanced.paymentDateFrom?.trim() ||
          appliedPaymentAdvanced.paymentDateTo?.trim()
      ),
    [appliedPaymentAdvanced]
  );

  const onUtcMonthChange = useCallback(
    (y: number, m: number) => {
      const adv: AppliedPaymentAdvanced = {
        ...appliedAdvancedRef.current,
        paymentDateFrom: undefined,
        paymentDateTo: undefined,
      };
      appliedAdvancedRef.current = adv;
      setAppliedPaymentAdvanced(adv);
      updatePaymentsFilters(buildPaymentFilterUpdates(adv, paymentStatusFilter, y, m));
    },
    [paymentStatusFilter, updatePaymentsFilters]
  );

  const selectPaymentStatusFilter = useCallback(
    (f: PaymentStatusFilter) => {
      setPaymentStatusFilter(f);
      updatePaymentsFilters(
        buildPaymentFilterUpdates(appliedAdvancedRef.current, f, periodYear, periodMonth)
      );
    },
    [periodYear, periodMonth, updatePaymentsFilters]
  );

  const openPaymentSearchModal = useCallback(() => {
    const a = appliedAdvancedRef.current;
    setPaymentSearchDraft({
      id: a.id ? String(a.id) : '',
      transactionReference: a.transactionReference ?? '',
      studentRut: a.studentRut ?? '',
      pricingPlanId: a.pricingPlanId ? String(a.pricingPlanId) : '',
      paymentDateFrom: a.paymentDateFrom ?? '',
      paymentDateTo: a.paymentDateTo ?? '',
    });
    setPaymentSearchOpen(true);
    adminPricingPlansClient
      .list({ pageSize: 100 })
      .then((r) => setPlanOptions(r.data))
      .catch(() => setPlanOptions([]));
  }, []);

  const applyPaymentSearchFromModal = useCallback(() => {
    const idNum = paymentSearchDraft.id.trim() ? Number(paymentSearchDraft.id) : NaN;
    if (paymentSearchDraft.id.trim() && !Number.isInteger(idNum)) {
      showToast.error('ID de pago inválido');
      return;
    }
    const planRaw = paymentSearchDraft.pricingPlanId.trim();
    const planNum = planRaw ? Number(planRaw) : undefined;
    if (planRaw && (planNum === undefined || !Number.isInteger(planNum) || planNum <= 0)) {
      showToast.error('Plan inválido');
      return;
    }
    const adv: AppliedPaymentAdvanced = {
      id: paymentSearchDraft.id.trim() ? idNum : undefined,
      transactionReference: paymentSearchDraft.transactionReference.trim() || undefined,
      studentRut: paymentSearchDraft.studentRut.trim() || undefined,
      pricingPlanId: planNum && planNum > 0 ? planNum : undefined,
      paymentDateFrom: paymentSearchDraft.paymentDateFrom.trim() || undefined,
      paymentDateTo: paymentSearchDraft.paymentDateTo.trim() || undefined,
    };
    setAppliedPaymentAdvanced(adv);
    appliedAdvancedRef.current = adv;
    updatePaymentsFilters(
      buildPaymentFilterUpdates(adv, paymentStatusFilter, periodYear, periodMonth)
    );
    setPaymentSearchOpen(false);
  }, [paymentSearchDraft, paymentStatusFilter, periodYear, periodMonth, updatePaymentsFilters]);

  const clearPaymentAdvanced = useCallback(() => {
    const adv: AppliedPaymentAdvanced = {};
    setAppliedPaymentAdvanced(adv);
    appliedAdvancedRef.current = adv;
    updatePaymentsFilters(
      buildPaymentFilterUpdates(adv, paymentStatusFilter, periodYear, periodMonth)
    );
  }, [paymentStatusFilter, periodYear, periodMonth, updatePaymentsFilters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPaymentSummary({
          year: periodYear,
          month: periodMonth,
          createdFrom: paymentsFilters.createdFrom,
          createdTo: paymentsFilters.createdTo,
          status: paymentsFilters.status,
          id: paymentsFilters.id,
          transactionReference: paymentsFilters.transactionReference,
          studentRut: paymentsFilters.studentRut,
          pricingPlanId: paymentsFilters.pricingPlanId,
          studentId: paymentsFilters.studentId,
          slotId: paymentsFilters.slotId,
          courseId: paymentsFilters.courseId,
        });
        if (!cancelled) setPaymentSummary(p);
      } catch {
        if (!cancelled) setPaymentSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    periodYear,
    periodMonth,
    paymentsFilters.createdFrom,
    paymentsFilters.createdTo,
    paymentsFilters.status,
    paymentsFilters.id,
    paymentsFilters.transactionReference,
    paymentsFilters.studentRut,
    paymentsFilters.pricingPlanId,
    paymentsFilters.studentId,
    paymentsFilters.slotId,
    paymentsFilters.courseId,
  ]);

  const handleConfirmPayment = useCallback(
    (p: AdminPayment) => {
      if (p.status === 'paid') {
        showToast.error('El pago ya está confirmado');
        return;
      }
      const planName = p.studentPlanPurchase?.pricingPlan?.name ?? 'plan';
      showConfirmation({
        title: '¿Confirmar pago?',
        message: `Se confirmará el pago #${p.id} del ${planName}. El plan quedará activo y se liberarán acceso a material y reservas.`,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isDangerous: false,
        onConfirm: async () => {
          setProcessing(true);
          setProcessingId(p.id);
          try {
            await confirmPayment(p.id);
            showToast.success('Pago confirmado. Plan activo.');
            reloadPayments();
            onAfterPaymentConfirmed?.();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al confirmar');
          } finally {
            setProcessing(false);
            setProcessingId(null);
          }
        },
      });
    },
    [showConfirmation, reloadPayments, onAfterPaymentConfirmed]
  );

  const handleRejectPayment = useCallback(
    (p: AdminPayment) => {
      if (p.status === 'failed') {
        showToast.error('El pago ya está rechazado');
        return;
      }
      showConfirmation({
        title: '¿Rechazar pago?',
        message: 'El pago se marcará como fallido.',
        confirmText: 'Rechazar',
        cancelText: 'Cancelar',
        isDangerous: true,
        onConfirm: async () => {
          setProcessing(true);
          setProcessingId(p.id);
          try {
            await rejectPayment(p.id);
            showToast.success('Pago rechazado');
            reloadPayments();
          } catch (err: any) {
            showToast.error(err?.response?.data?.message ?? 'Error al rechazar');
          } finally {
            setProcessing(false);
            setProcessingId(null);
          }
        },
      });
    },
    [showConfirmation, reloadPayments]
  );

  const paymentFilterBadgeItems = useMemo(
    () => buildPaymentFilterBadgeItems(appliedPaymentAdvanced, planOptions),
    [appliedPaymentAdvanced, planOptions]
  );

  const paymentsEmptyMessage =
    paymentStatusFilter === 'all'
      ? 'No hay pagos en este periodo'
      : `No hay pagos «${PAYMENT_STATUS_CARD_LABELS[paymentStatusFilter]}» en este periodo`;

  const paymentColumns: TableColumn<AdminPayment>[] = useMemo(
    () => createPaymentTableColumns(formatCurrency, formatDate),
    [formatCurrency, formatDate]
  );

  const paymentActions: TableAction<AdminPayment>[] = useMemo(
    () => [
      {
        render: (p) => (
          <PaymentTableActions
            payment={p}
            processing={processing}
            processingId={processingId}
            onConfirm={handleConfirmPayment}
            onReject={handleRejectPayment}
          />
        ),
      },
    ],
    [handleConfirmPayment, handleRejectPayment, processing, processingId]
  );

  return {
    onUtcMonthChange,
    hasPaymentAdvanced,
    clearPaymentAdvanced,
    openPaymentSearchModal,
    paymentSearchOpen,
    setPaymentSearchOpen,
    paymentSearchDraft,
    setPaymentSearchDraft,
    applyPaymentSearchFromModal,
    planOptions,
    paymentStatusFilter,
    selectPaymentStatusFilter,
    paymentSummary,
    paymentFilterBadgeItems,
    payments,
    paymentsLoading,
    handlePaymentsSort,
    paymentsFilters,
    paymentsTotalPages,
    paymentsTotal,
    handlePaymentsPageChange,
    handlePaymentsPageSizeChange,
    paymentsEmptyMessage,
    reloadPayments,
    paymentColumns,
    paymentActions,
    processing,
    processingId,
  };
}

export type AdminPaymentsTabApi = ReturnType<typeof useAdminPayments>;
