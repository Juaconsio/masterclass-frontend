import { httpClient } from './config';

export interface PublicCourseBase {
  id: number;
  title: string;
  acronym: string;
  description: string;
  isActive: boolean;
}

export async function fetchPublicCourses(): Promise<PublicCourseBase[]> {
  try {
    const response = await httpClient.get<PublicCourseBase[]>('/public/courses');
    return response.data ?? [];
  } catch {
    return [];
  }
}
