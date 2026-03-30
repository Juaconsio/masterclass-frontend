import { httpClient } from '../config';
import type { IPayment } from '@/interfaces';
import { buildQueryString } from '@/lib/queryParams';
import type { Filters, TableResponse } from '@/interfaces';

export interface PaymentsFilters extends Omit<Filters, 'sortBy'> {
  id?: number;
  studentId?: number;
  /** Subcadena del RUT del estudiante (insensible a mayúsculas) */
  studentRut?: string;
  /** Plan de precios asociado a la compra (`studentPlanPurchase`) */
  pricingPlanId?: number;
  transactionReference?: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  slotId?: number;
  courseId?: number;
  sortBy?: 'id' | 'amount' | 'status' | 'createdAt';
  /** ISO 8601 — filtra `createdAt` del pago (inclusive) */
  createdFrom?: string;
  createdTo?: string;
}

export interface AdminPaymentSummaryByStatus {
  count: number;
  amountSum: number;
}

export interface AdminPaymentSummary {
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  byStatus: Record<string, AdminPaymentSummaryByStatus>;
  totals: { count: number; amountSum: number };
}

export interface AdminPaymentPlanInfo {
  id: number;
  creditsTotal: number;
  creditsRemaining: number;
  pricingPlan?: {
    id: number;
    name: string;
    course?: { id: number; title: string; acronym: string };
  };
}

export interface AdminPayment extends IPayment {
  studentPlanPurchaseId?: number | null;
  studentPlanPurchase?: AdminPaymentPlanInfo | null;
}

export async function getPayments(filters?: PaymentsFilters): Promise<TableResponse<AdminPayment>> {
  const queryString = buildQueryString(filters);
  const response = await httpClient.get(`/admin/payments${queryString}`);
  return response.data;
}

export type PaymentSummaryParams = {
  year: number;
  month: number;
} & Partial<
  Pick<
    PaymentsFilters,
    | 'createdFrom'
    | 'createdTo'
    | 'status'
    | 'id'
    | 'transactionReference'
    | 'studentRut'
    | 'pricingPlanId'
    | 'studentId'
    | 'slotId'
    | 'courseId'
  >
>;

export async function getPaymentSummary(params: PaymentSummaryParams): Promise<AdminPaymentSummary> {
  const queryString = buildQueryString(params);
  const response = await httpClient.get(`/admin/payments/summary${queryString}`);
  return response.data;
}

export async function updatePayment(id: number, data: Partial<IPayment>): Promise<IPayment> {
  const response = await httpClient.put(`/admin/payments/${id}`, data);
  return response.data;
}

export async function confirmPayment(id: number): Promise<AdminPayment> {
  const response = await httpClient.post(`/admin/payments/${id}/confirm`);
  return response.data;
}

export async function rejectPayment(id: number): Promise<AdminPayment> {
  const response = await httpClient.post(`/admin/payments/${id}/reject`);
  return response.data;
}
