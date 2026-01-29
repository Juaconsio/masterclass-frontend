import { httpClient } from '../config';
import type { IPlainCourse } from '../admin/courses';

export const professorCoursesClient = {
  async getAllPlain(): Promise<IPlainCourse[]> {
    const response = await httpClient.get<IPlainCourse[]>('professors/courses/plain');
    return response.data;
  },
};
