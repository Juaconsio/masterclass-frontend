import { httpClient } from './config';

export interface ConfirmReservationResponse {
  success: boolean;
  reservationId: string;
  message?: string;
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
