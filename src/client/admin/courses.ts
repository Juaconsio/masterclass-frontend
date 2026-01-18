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
  /**
   * Get all courses with counts (admin view)
   */
  async getAll(): Promise<TableResponse<AdminCourse>> {
    const response = await httpClient.get('/admin/courses');
    return response.data;
  },

  /**
   * Get a single course with full details (admin view)
   */
  async getById(id: number): Promise<AdminCourseDetail> {
    const response = await httpClient.get<AdminCourseDetail>(`/admin/courses/${id}`);
    return response.data;
  },
};
