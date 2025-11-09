import { httpClient } from './config';

async function fetchReservations() {
  const res = await httpClient.get('/reservations');
  return res.data;
}

async function createReservation(slotId: number) {
  const res = await httpClient.post('/reservations', { slotId });

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

export { fetchReservations, createReservation, updateReservation, deleteReservation };
