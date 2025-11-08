import type { Course, Payment, Reservation } from '@/interfaces';
import { httpClient } from './config';

export interface ConfirmReservationResponse {
  course: Course;
  reservation: Reservation;
  payment: Payment;
}

export async function confirmReservation(payload: {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
  planId?: string;
}): Promise<ConfirmReservationResponse> {
  const res = await httpClient.post('/courses/enroll', payload);
  return res.data;
}
