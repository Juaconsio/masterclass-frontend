import { httpClient } from '../config';
import type { Payment } from '@/interfaces';
import { buildQueryString } from '@/lib/queryParams';
import type { Filters, TableResponse } from '@/interfaces';

export interface PaymentsFilters extends Filters {
  id?: number;
  studentId?: number;
  transactionReference?: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  slotId?: number;
  courseId?: number;
}

export async function getPayments(filters?: PaymentsFilters): Promise<TableResponse<Payment>> {
  const queryString = buildQueryString(filters);
  const response = await httpClient.get(`/admin/payments${queryString}`);
  return response.data;
}

export async function updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
  const response = await httpClient.put(`/admin/payments/${id}`, data);
  return response.data;
}
