import { httpClient } from '../config';
import type { IMaterial, IClass, ICourse } from '@/interfaces';

export interface MaterialWithUrl extends IMaterial {
  downloadUrl: string;
}

export interface ClassMaterialsResponse {
  materials: MaterialWithUrl[];
  class: IClass;
  course: ICourse;
}

export async function getMyClassMaterials(classId: number): Promise<ClassMaterialsResponse> {
  const response = await httpClient.get<ClassMaterialsResponse>(
    `/students/me/classes/${classId}/materials`
  );
  return response.data;
}

export async function getAccessibleClasses(): Promise<IClass[]> {
  const response = await httpClient.get<IClass[]>('/students/me/classes');
  return response.data;
}
