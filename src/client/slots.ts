import { httpClient } from './config';

async function fetchSlots() {
  const res = await httpClient.get('/slots');
  return res.data;
}

async function createSlot(payload: any) {
  const res = await httpClient.post('/slots', payload);
  return res.data;
}

async function updateSlot(id: number, payload: any) {
  const res = await httpClient.put(`/slots/${id}`, payload);
  return res.data;
}

async function deleteSlot(id: number) {
  const res = await httpClient.delete(`/slots/${id}`);
  return res.data;
}

async function reserveSlot(slotId: number) {
  const res = await httpClient.post(`v2/slots/${slotId}/reserve`);
  return res.data;
}

async function fetchUpcomingSlots(daysAhead?: number, token?: string) {
  const params: any = {}
  if (typeof daysAhead === 'number') params.daysAhead = daysAhead
  const config = token
    ? { params, headers: { Authorization: `Bearer ${token}` } }
    : { params }
  const res = await httpClient.get('v2/upcoming', config)
  return res.data
}

export { fetchSlots, fetchUpcomingSlots, createSlot, updateSlot, deleteSlot, reserveSlot };
