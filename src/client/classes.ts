import { httpClient } from './config';

async function fetchClasses() {
  const res = await httpClient.get('/classes');
  return res.data;
}

async function createClass(payload: any) {
  const res = await httpClient.post('/classes', payload);
  return res.data;
}

async function updateClass(payload: any) {
  const res = await httpClient.put('/classes', payload);
  return res.data;
}

async function deleteClass() {
  const res = await httpClient.delete('/classes');
  return res.data;
}

export { fetchClasses, createClass, updateClass, deleteClass };
