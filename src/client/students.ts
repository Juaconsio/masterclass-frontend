import { httpClient } from './config';
import type { IStudent, UserRole } from '@/interfaces';

export interface CreateIStudentPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  rut: string;
  role: UserRole;
  profilePictureUrl?: string;
  bio?: string;
  address?: string;
}

export interface UpdateIStudentPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  rut?: string;
  role?: UserRole;
  isActive?: boolean;
  profilePictureUrl?: string | null;
  bio?: string | null;
  address?: string | null;
}

export interface IStudentFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string; // Buscar por nombre, email o RUT
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getMe(): Promise<IStudent> {
  try {
    const response = await httpClient.get('students/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
}

export async function updateMe(payload: {
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}): Promise<IStudent> {
  try {
    const response = await httpClient.put<IStudent>('students/me', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
  }
}
