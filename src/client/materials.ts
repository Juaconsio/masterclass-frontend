import { httpClient } from './config';

export interface CourseMaterial {
  id: number;
  classId: number;
  mimeType: string;
  filename: string;
  bucketKey: string;
  downloadUrl: string;
}

/**
 * Gets all materials for a specific class
 * @param classId - The class identifier
 * @returns Promise with array of course materials
 */
export async function getClassMaterials(classId: string) {
  const response = await httpClient.get<CourseMaterial[]>(`/classes/${classId}/materials`);
  return response.data;
}
