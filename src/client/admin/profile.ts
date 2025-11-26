import { httpClient } from '../config';
import type { IAdmin } from '@/interfaces/models';

export async function getMyAdminProfile(): Promise<IAdmin> {
  try {
    const response = await httpClient.get<IAdmin>('admin/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
}

export async function updateMyAdminProfile(payload: {
  name?: string;
  email?: string;
}): Promise<IAdmin> {
  try {
    const response = await httpClient.patch<IAdmin>('admin/me/profile', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
  }
}

export async function updateMyAdminPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await httpClient.patch('admin/me/password', payload);
  } catch (error: any) {
    console.error('Error updating admin password:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
  }
}
