import { httpClient } from './config';
import type { IProfessor, ICourse, ISlot } from '@/interfaces/models';

export interface ProfessorDashboardData {
  professor: IProfessor;
  courses: ICourse[];
  slots: ISlot[];
}

export async function getMyProfessorDashboard(): Promise<ProfessorDashboardData> {
  try {
    const response = await httpClient.get<ProfessorDashboardData>('professors/dashboard');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching professor dashboard:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener datos del profesor');
  }
}

export async function getMyProfessorProfile(): Promise<IProfessor> {
  try {
    const response = await httpClient.get<IProfessor>('professors/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching professor profile:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
}

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

export async function getMyProfessorCourses(): Promise<ICourse[]> {
  try {
    const response = await httpClient.get<ICourse[]>('professors/me/courses');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching professor courses:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener cursos');
  }
}
