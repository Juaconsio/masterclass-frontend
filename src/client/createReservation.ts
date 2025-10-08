import { httpClient } from './config';

export async function createReservation(studentId: number, slotId: number) {
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
