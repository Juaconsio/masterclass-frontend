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
  const res = await httpClient.patch(`/slots/${id}`, payload);
  return res.data;
}

async function deleteSlot(id: number) {
  const res = await httpClient.delete(`/slots/${id}`);
  return res.data;
}

export { fetchSlots, createSlot, updateSlot, deleteSlot };
