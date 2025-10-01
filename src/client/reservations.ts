import { httpClient } from './config';

export async function fetchStudentReservations(studentId: number) {
  const res = await httpClient.get(`/reservations?studentId=${studentId}`);
  return res.data;
}
