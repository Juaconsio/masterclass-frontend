import { httpClient } from '../config';
import type { IReservation } from '@/interfaces';
import { buildQueryString } from '@/lib/queryParams';
import type { TableResponse } from '@/interfaces';

export interface ReservationsFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  id?: number;
  status?: string;
  studentId?: number;
  slotId?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionReference?: string;
  /** ISO 8601 — filtra por `payment.createdAt` (inclusive) */
  paymentCreatedFrom?: string;
  paymentCreatedTo?: string;
}

export interface AdminReservationStats {
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  reservationsByStatus: Record<string, number>;
  paymentsLinkedByStatus: Record<string, { count: number; amountSum: number }>;
}

export async function getReservations(
  filters?: ReservationsFilters
): Promise<TableResponse<IReservation>> {
  const queryString = buildQueryString(filters);
  const response = await httpClient.get(`/admin/reservations${queryString}`);
  const data = response.data as any;
  return {
    ...data,
    limit: data.pageSize ?? data.limit ?? 10,
  };
}

export async function getReservation(id: number): Promise<IReservation> {
  const response = await httpClient.get(`/admin/reservations/${id}`);
  return response.data;
}

export type ReservationStatsParams = {
  year: number;
  month: number;
} & Partial<
  Pick<
    ReservationsFilters,
    | 'id'
    | 'status'
    | 'paymentStatus'
    | 'transactionReference'
    | 'paymentCreatedFrom'
    | 'paymentCreatedTo'
    | 'studentId'
    | 'slotId'
  >
>;

export async function getReservationStats(
  params: ReservationStatsParams
): Promise<AdminReservationStats> {
  const queryString = buildQueryString(params);
  const response = await httpClient.get(`/admin/reservations/stats${queryString}`);
  return response.data;
}

export async function processRefund(id: number): Promise<IReservation> {
  const response = await httpClient.post(`/admin/reservations/${id}/process-refund`);
  return response.data;
}

export async function confirmReservationPayment(id: number): Promise<IReservation> {
  const response = await httpClient.post(`/admin/reservations/${id}/confirm-payment`);
  return response.data;
}

export async function rejectReservationPayment(id: number): Promise<IReservation> {
  const response = await httpClient.post(`/admin/reservations/${id}/reject-payment`);
  return response.data;
}
