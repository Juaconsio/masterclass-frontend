import { httpClient } from './config';

export interface PublicCourseBase {
  id: number;
  title: string;
  acronym: string;
  description: string;
  isActive: boolean;
}

export interface PublicCoursePlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  reservationCount: number;
  accessMode: 'sessions_and_materials' | 'materials_only';
  allowReschedule: boolean;
  allowedModalities?: string[];
  allowedStudentsGroups?: string[];
  allowedClasses?: { id: number }[];
}

export interface CoursePlansResponse {
  course: { id: number; acronym: string; title: string };
  plans: PublicCoursePlan[];
}

export async function fetchPublicCourses(): Promise<PublicCourseBase[]> {
  try {
    const response = await httpClient.get<PublicCourseBase[]>('/public/courses');
    return response.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicCoursePlans(acronym: string): Promise<CoursePlansResponse | null> {
  try {
    const response = await httpClient.get<CoursePlansResponse>(`/public/courses/${encodeURIComponent(acronym)}/plans`);
    return response.data ?? null;
  } catch {
    return null;
  }
}
