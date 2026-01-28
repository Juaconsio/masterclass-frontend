import { httpClient } from '../config';
import type { UserRole } from '@/interfaces/enums';
import { buildQueryString } from '@/lib/queryParams';

// ==================== TYPES ====================

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  rut: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  profilePictureUrl?: string | null;
}

export interface CreateStudentPayload {
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

export interface UpdateStudentPayload {
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

export interface StudentFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string; // Buscar por nombre, email o RUT
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== CRUD OPERATIONS ====================

/**
 * Obtener lista de usuarios con filtros opcionales
 */
export async function getStudents(filters?: StudentFilters): Promise<StudentsResponse> {
  try {
    const params = buildQueryString(filters);
    const response = await httpClient.get<StudentsResponse>(`admin/students${params}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching students:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
  }
}

/**
 * Obtener usuario por ID
 */
export async function getStudentById(id: number): Promise<Student> {
  try {
    const response = await httpClient.get<Student>(`admin/students/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching student ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al obtener usuario');
  }
}

/**
 * Crear nuevo usuario (solo admin)
 */
export async function createStudent(payload: CreateStudentPayload): Promise<Student> {
  try {
    const response = await httpClient.post<Student>('admin/students', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error creating student:', error);
    throw new Error(error.response?.data?.message || 'Error al crear usuario');
  }
}

/**
 * Actualizar usuario existente
 */
export async function updateStudent(id: number, payload: UpdateStudentPayload): Promise<Student> {
  try {
    const response = await httpClient.patch<Student>(`admin/students/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating student ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
  }
}

/**
 * Actualizar perfil del estudiante autenticado (nombre, email, teléfono, dirección)
 */
export async function updateMyProfile(payload: {
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}): Promise<Student> {
  try {
    const response = await httpClient.patch<Student>('students/me/profile', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
  }
}

/**
 * Actualizar contraseña del estudiante autenticado
 */
export async function updateMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await httpClient.patch('students/me/password', payload);
  } catch (error: any) {
    console.error('Error updating password:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
  }
}

/**
 * Eliminar usuario (soft delete - marca como inactivo)
 */
export async function deleteStudent(id: number): Promise<void> {
  try {
    await httpClient.delete(`admin/students/${id}`);
  } catch (error: any) {
    console.error(`Error deleting student ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
  }
}

/**
 * Activar/Desactivar usuario
 */
export async function toggleStudentStatus(id: number, isActive: boolean): Promise<Student> {
  try {
    const response = await httpClient.patch<Student>(`admin/students/${id}/status`, { isActive });
    return response.data;
  } catch (error: any) {
    console.error(`Error toggling student status ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado del usuario');
  }
}

// ==================== BULK OPERATIONS ====================

/**
 * Eliminar múltiples usuarios
 */
export async function bulkDeleteStudents(ids: number[]): Promise<void> {
  try {
    await httpClient.post('admin/students/bulk-delete', { ids });
  } catch (error: any) {
    console.error('Error bulk deleting students:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar usuarios');
  }
}

/**
 * Actualizar estado de múltiples usuarios
 */
export async function bulkUpdateStudentStatus(ids: number[], isActive: boolean): Promise<void> {
  try {
    await httpClient.post('admin/students/bulk-status', { ids, isActive });
  } catch (error: any) {
    console.error('Error bulk updating student status:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar estado de usuarios');
  }
}

// ==================== PROMOTE ====================

/**
 * Promover estudiante a profesor
 */
export async function promoteStudent(studentId: number): Promise<void> {
  try {
    await httpClient.post(`admin/students/promote/${studentId}`);
  } catch (error: any) {
    console.error(`Error promoting student ${studentId}:`, error);
    throw new Error(error.response?.data?.message || 'Error al promover estudiante');
  }
}

// ==================== STATISTICS ====================

/**
 * Obtener estadísticas de usuarios
 */
export async function getStudentStats(): Promise<{
  total: number;
  students: number;
  professors: number;
  admins: number;
  active: number;
  inactive: number;
}> {
  try {
    const response = await httpClient.get('admin/students/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching student stats:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
  }
}

// ==================== EXPORT ====================

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  bulkDeleteStudents,
  bulkUpdateStudentStatus,
  getStudentStats,
  promoteStudent,
};
