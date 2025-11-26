import { httpClient } from './config';
import type { IProfessor } from '@/interfaces/models';

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

/**
 * Obtener perfil del profesor autenticado
 */
export async function getMyProfessorProfile(): Promise<IProfessor> {
  try {
    const response = await httpClient.get<IProfessor>('professors/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching professor profile:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
}

/**
 * Actualizar perfil del profesor autenticado
 */
export async function updateMyProfessorProfile(payload: {
  name?: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
}): Promise<IProfessor> {
  try {
    const response = await httpClient.put<IProfessor>('professors/me', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error updating professor profile:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
  }
}

/**
 * Actualizar contraseña del profesor autenticado
 */
export async function updateMyProfessorPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await httpClient.patch('professors/me/password', payload);
  } catch (error: any) {
    console.error('Error updating professor password:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
  }
}

export { fetchProfessors, createProfessor, updateProfessor, deleteProfessor };
