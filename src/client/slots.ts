import { httpClient } from './config';

async function fetchSlots() {
  const res = await httpClient.get('/slots');
  return res.data;
}

async function createSlot(payload: any) {
  const res = await httpClient.post('/slots', payload);
  return res.data;
}

async function updateSlot(payload: any) {
  const res = await httpClient.put('/slots', payload);
  return res.data;
}

async function deleteSlot() {
  const res = await httpClient.delete('/slots');
  return res.data;
}

export { fetchSlots, createSlot, updateSlot, deleteSlot };
