import { httpClient } from './config';
import { buildSlug } from '@/lib/courseCatalog';

export interface ProfessorCourse {
  id: number;
  title: string;
  acronym: string;
  description: string;
  isActive: boolean;
}

export async function fetchProfessorCourses(professorId: number): Promise<ProfessorCourse[]> {
  try {
    const response = await httpClient.get<ProfessorCourse[]>(
      `/public/professors/${professorId}/courses`
    );
    return response.data ?? [];
  } catch {
    return [];
  }
}

export function professorCoursesToSlugs(courses: ProfessorCourse[]): string[] {
  return courses.map((c) => buildSlug(c.acronym, c.title));
}
