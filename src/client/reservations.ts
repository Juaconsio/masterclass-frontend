import { httpClient } from './config';

async function fetchReservations() {
  const res = await httpClient.get('/reservations');
  return res.data;
}

async function createReservation(studentId: number, slotId: number) {
  const token = localStorage.getItem('token');
  const res = await httpClient.post(
    '/reservations',
    { studentId, slotId },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );
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
