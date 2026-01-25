import { httpClient } from '../config';
import type { IPayment, TableResponse } from '@/interfaces';

export interface AdminCourse {
  id: number;
  title: string;
  acronym: string;
  description: string | null;
  isActive: boolean;
  classesCount: number;
  studentsCount: number;
  professorsCount: number;
}

export interface Professor {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Reservation {
  id: number;
  studentId: number;
  slotId: number;
  status: string;
  createdAt: string;
  payment: IPayment | null;
  student: Student;
}

export interface Slot {
  id: number;
  classId: number;
  startTime: string;
  endTime: string;
  capacity: number;
  reservations: Reservation[];
}

export interface Material {
  id: number;
  title: string;
  url: string;
  type: string;
  classId: number;
}

export interface Class {
  id: number;
  title: string;
  description: string | null;
  courseId: number;
  createdAt: string;
  slots: Slot[];
  materials: Material[];
}

export interface AdminCourseDetail extends AdminCourse {
  professors: Professor[];
  students: Student[];
  classes: Class[];
  _count: {
    classes: number;
    students: number;
    professors: number;
  };
}

export const adminCoursesClient = {
  async getAll(): Promise<TableResponse<AdminCourse>> {
    const response = await httpClient.get('/admin/courses');
    return response.data;
  },

  async getById(id: number): Promise<AdminCourseDetail> {
    const response = await httpClient.get<AdminCourseDetail>(`/admin/courses/${id}`);
    return response.data;
  },

  async create(payload: {
    title: string;
    description: string;
    acronym: string;
    professorIds: number[];
  }): Promise<AdminCourse> {
    const response = await httpClient.post<AdminCourse>('/admin/courses', payload);
    return response.data;
  },

  async update(
    id: number,
    payload: {
      title: string;
      description: string;
      acronym: string;
      professorIds: number[];
    }
  ): Promise<AdminCourse> {
    const response = await httpClient.put<AdminCourse>(`/admin/courses/${id}`, payload);
    return response.data;
  },

  async createClass(payload: {
    title: string;
    description: string;
    objectives: string;
    courseId: number;
    orderIndex: number;
  }): Promise<Class> {
    const response = await httpClient.post<Class>('/admin/classes', payload);
    return response.data;
  },
};
