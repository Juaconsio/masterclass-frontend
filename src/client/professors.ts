import { httpClient } from './config';

async function fetchProfessors() {
  const res = await httpClient.get('/professors');
  return res.data;
}

async function createProfessor(payload: any) {
  const res = await httpClient.post('/professors', payload);
  return res.data;
}

async function updateProfessor(payload: any) {
  const res = await httpClient.put('/professors', payload);
  return res.data;
}

async function deleteProfessor() {
  const res = await httpClient.delete('/professors');
  return res.data;
}

export { fetchProfessors, createProfessor, updateProfessor, deleteProfessor };
