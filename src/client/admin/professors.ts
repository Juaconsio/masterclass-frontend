import { httpClient } from '../config';
import type { TableResponse } from '@/interfaces';

export interface AdminProfessor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  rut?: string;
  confirmed?: boolean;
  profilePictureUrl?: string;
  _count: {
    courses: number;
    slots: number;
    futureSlots: number;
    pastSlots: number;
  };
}

export interface ProfessorCourse {
  id: number;
  title: string;
  acronym: string;
  isActive: boolean;
}

export interface ProfessorSlot {
  id: number;
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  link: string;
  modality: string;
  studentsGroup: string;
  location: string | null;
  status: string;
  minStudents: number;
  maxStudents: number;
  class: {
    id: number;
    courseId: number;
    title: string;
    description: string;
    objectives: string;
    orderIndex: number;
    course: {
      id: number;
      title: string;
      acronym: string;
    };
  };
  reservations: Array<{
    id: number;
    studentId: number;
    slotId: number;
    status: string;
    paymentId: number;
    notificationSentAt: string | null;
    pricingPlanId: number;
    student: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

export interface AdminProfessorDetail extends AdminProfessor {
  courses: ProfessorCourse[];
  slots: ProfessorSlot[];
}

export const adminProfessorsClient = {
  async getAll(filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TableResponse<AdminProfessor>> {
    const response = await httpClient.get('/admin/professors', { params: filters });
    return response.data;
  },

  async getById(id: number): Promise<AdminProfessorDetail> {
    const response = await httpClient.get<AdminProfessorDetail>(`/admin/professors/${id}`);
    return response.data;
  },

  async create(payload: {
    name: string;
    email: string;
    rut: string;
    phone?: string;
    bio?: string;
  }): Promise<AdminProfessor> {
    const response = await httpClient.post<AdminProfessor>('/admin/professors', payload);
    return response.data;
  },

  async update(
    id: number,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      bio?: string;
    }
  ): Promise<AdminProfessor> {
    const response = await httpClient.patch<AdminProfessor>(`/admin/professors/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/professors/${id}`);
  },

  async getCourses(id: number): Promise<ProfessorCourse[]> {
    const response = await httpClient.get<ProfessorCourse[]>(`/admin/professors/${id}/courses`);
    return response.data;
  },

  async getSlots(id: number): Promise<ProfessorSlot[]> {
    const response = await httpClient.get<ProfessorSlot[]>(`/admin/professors/${id}/slots`);
    return response.data;
  },

  async associateCourse(professorId: number, courseId: number): Promise<void> {
    await httpClient.post(`/admin/professors/${professorId}/courses`, { courseId });
  },

  async dissociateCourse(professorId: number, courseId: number, force = false): Promise<void> {
    const endpoint = force
      ? `/admin/professors/${professorId}/courses/${courseId}/force`
      : `/admin/professors/${professorId}/courses/${courseId}`;
    await httpClient.delete(endpoint);
  },
};
