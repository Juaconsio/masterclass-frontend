import { httpClient } from '../config';
import type { IPayment, TableResponse } from '@/interfaces';
import { buildQueryString } from '@/lib/queryParams';

export interface AdminCourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}

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
  title?: string;
  url?: string;
  type?: string;
  filename?: string;
  classId: number;
}

export interface Class {
  id: number;
  title: string;
  description: string | null;
  objectives?: string | null;
  orderIndex: number;
  courseId: number;
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

export type IPlainCourse = {
  id: number;
  title: string;
  classes: Pick<Class, 'id' | 'title'>[];
  professors: Pick<Professor, 'id' | 'name'>[];
};

interface CoursesApiResponse {
  data: AdminCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminCoursesClient = {
  async getAll(filters?: AdminCourseFilters): Promise<TableResponse<AdminCourse>> {
    const params = filters
      ? { ...filters, ...(filters.status === 'all' && { status: undefined }) }
      : undefined;
    const query = buildQueryString(params);
    const response = await httpClient.get<CoursesApiResponse>(`/admin/courses${query}`);
    const r = response.data;
    return {
      data: r.data,
      total: r.total,
      page: r.page,
      limit: r.pageSize,
      totalPages: r.totalPages,
    };
  },

  async getAllPlain(): Promise<IPlainCourse[]> {
    const response = await httpClient.get<IPlainCourse[]>('/admin/courses/plain');
    return response.data;
  },

  async getAllWithClasses(): Promise<AdminCourseDetail[]> {
    const response = await httpClient.get<AdminCourseDetail[]>('/admin/courses/with-classes/all');
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
    isActive: boolean;
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
      isActive: boolean;
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

  async updateClass(
    id: number,
    payload: {
      title?: string;
      description?: string;
      objectives?: string;
      orderIndex?: number;
    }
  ): Promise<Class> {
    const response = await httpClient.put<Class>(`/admin/classes/${id}`, payload);
    return response.data;
  },
};
