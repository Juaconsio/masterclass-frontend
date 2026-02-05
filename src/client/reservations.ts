import { httpClient } from './config';
import type { ICourse, IPayment, IPricingPlan, IReservation, ISlot } from '@/interfaces';
import buildQuery from './lib/buildQuery';

async function fetchReservations() {
  const res = await httpClient.get('/reservations');
  return res.data;
}

async function getReservationEnroll(options: {
  courseId: number;
  slotId: number;
  pricingPlanId: string;
}): Promise<{
  course: ICourse;
  slot: ISlot;
  reservation: IReservation;
  pricingPlan: IPricingPlan;
}> {
  const { courseId, slotId, pricingPlanId } = options;
  const query = buildQuery({
    courseId: courseId || undefined,
    slotId: slotId || undefined,
    pricingPlanId: pricingPlanId || undefined,
  });
  const res = await httpClient.get(`/reservations/enroll${query ? `?${query}` : ''}`);
  return res.data;
}

async function createReservation(payload: {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
  pricingPlanId?: string;
}): Promise<{ course: ICourse; reservation: IReservation; payment: IPayment; slot: ISlot }> {
  const res = await httpClient.post('/reservations', payload);

  return res.data;
}

async function updateReservation(reservationId: number, payload: any) {
  const res = await httpClient.put(`/reservations/${reservationId}`, payload);
  return res.data;
}

async function deleteReservation(reservationId: number) {
  const res = await httpClient.delete(`/reservations/${reservationId}`);
  return res.data;
}

export {
  fetchReservations,
  getReservationEnroll,
  createReservation,
  updateReservation,
  deleteReservation,
};
