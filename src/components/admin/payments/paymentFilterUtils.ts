import type { PaymentsFilters } from '@/client/admin/payments';
import type { AppliedPaymentAdvanced, PaymentStatusFilter } from '../shared/types';
import { utcDayRangeInclusiveISO, utcMonthInclusiveISO } from '../shared/dateUtils';

export function paymentCreatedBounds(
  periodYear: number,
  periodMonth: number,
  adv: AppliedPaymentAdvanced
): { createdFrom: string; createdTo: string } {
  const df = adv.paymentDateFrom?.trim();
  const dt = adv.paymentDateTo?.trim();
  if (df || dt) {
    const from = df || dt!;
    const to = dt || df!;
    return utcDayRangeInclusiveISO(from, to);
  }
  return utcMonthInclusiveISO(periodYear, periodMonth);
}

export function buildPaymentFilterUpdates(
  adv: AppliedPaymentAdvanced,
  status: PaymentStatusFilter,
  periodYear: number,
  periodMonth: number
): Partial<PaymentsFilters> {
  const { createdFrom, createdTo } = paymentCreatedBounds(periodYear, periodMonth, adv);
  return {
    createdFrom,
    createdTo,
    status: status === 'all' ? undefined : status,
    page: 1,
    id: adv.id != null && adv.id > 0 ? adv.id : undefined,
    transactionReference: adv.transactionReference?.trim() || undefined,
    studentRut: adv.studentRut?.trim() || undefined,
    pricingPlanId:
      adv.pricingPlanId != null && adv.pricingPlanId > 0 ? adv.pricingPlanId : undefined,
  };
}
