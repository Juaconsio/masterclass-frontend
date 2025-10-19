import { httpClient } from './config';

async function fetchReservations() {
  const res = await httpClient.get('/reservations');
  return res.data;
}

async function createReservation(payload: any) {
  const res = await httpClient.post('/reservations', payload);
  return res.data;
}

async function updateReservation(payload: any) {
  const res = await httpClient.put('/reservations', payload);
  return res.data;
}

async function deleteReservation() {
  const res = await httpClient.delete('/reservations');
  return res.data;
}

export { fetchReservations, createReservation, updateReservation, deleteReservation };
