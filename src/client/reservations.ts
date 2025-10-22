import { httpClient } from './config';

async function fetchReservations() {
  const res = await httpClient.get('/reservations');
  return res.data;
}

async function fetchMyReservations(token?: string) {
  // If a token is provided, include it explicitly; otherwise rely on httpClient interceptor
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

  const res = await httpClient.get('v2/me/reservations', config);
  return res.data; // expected shape: { reservations: [...], courses: [...] }
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

export {
  fetchReservations,
  fetchMyReservations,
  createReservation,
  updateReservation,
  deleteReservation,
};
