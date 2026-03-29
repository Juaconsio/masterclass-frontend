import type { AdminPricingPlanListItem } from '@/client/admin/pricingPlans';
import type { ReservationsFilters } from '@/client/admin/reservations';
import type { AppliedPaymentAdvanced, FilterBadgeItem, QuickFilter } from './types';
import { QUICK_FILTER_LABELS } from './constants';

export function buildPaymentFilterBadgeItems(
  adv: AppliedPaymentAdvanced,
  planOptions: AdminPricingPlanListItem[]
): FilterBadgeItem[] {
  const items: FilterBadgeItem[] = [];
  const hasCustomDates = Boolean(adv.paymentDateFrom?.trim() || adv.paymentDateTo?.trim());
  if (hasCustomDates) {
    const from = adv.paymentDateFrom?.trim() || adv.paymentDateTo!.trim();
    const to = adv.paymentDateTo?.trim() || adv.paymentDateFrom!.trim();
    items.push({
      key: 'pay-dates',
      label: 'Fechas pago',
      value: from === to ? from : `${from} → ${to}`,
    });
  }
  if (adv.id) items.push({ key: 'id', label: 'ID pago', value: `#${adv.id}` });
  if (adv.transactionReference?.trim()) {
    items.push({ key: 'ref', label: 'Referencia', value: adv.transactionReference.trim() });
  }
  if (adv.studentRut?.trim()) {
    items.push({ key: 'rut', label: 'RUT', value: adv.studentRut.trim() });
  }
  if (adv.pricingPlanId) {
    const pname = planOptions.find((p) => p.id === adv.pricingPlanId)?.name;
    items.push({
      key: 'plan',
      label: 'Plan',
      value: pname ? `${pname} (#${adv.pricingPlanId})` : `#${adv.pricingPlanId}`,
    });
  }
  return items;
}

export function buildReservationFilterBadgeItems(
  quickFilter: QuickFilter,
  rf: ReservationsFilters
): FilterBadgeItem[] {
  const items: FilterBadgeItem[] = [];
  items.push({ key: 'quick', label: 'Vista', value: QUICK_FILTER_LABELS[quickFilter] });
  if (rf.id) items.push({ key: 'rid', label: 'ID reserva', value: `#${rf.id}` });
  if (rf.transactionReference?.trim()) {
    items.push({ key: 'rref', label: 'Ref. pago', value: rf.transactionReference.trim() });
  }
  return items;
}
