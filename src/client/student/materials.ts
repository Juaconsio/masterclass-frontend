import { httpClient } from '../config';
import type { IMaterial, IClass, ICourse } from '@/interfaces';

export interface MaterialWithUrl extends IMaterial {
  downloadUrl?: string;
  displayName?: string | null;
  orderIndex?: number;
  moduleId?: number | null;
}

export interface ClassModuleWithMaterials {
  id: number;
  classId: number;
  title: string;
  orderIndex: number;
  materials: MaterialWithUrl[];
}

export interface ClassMaterialsResponse {
  materials: MaterialWithUrl[];
  class: IClass;
  course: ICourse;
}

export interface ClassModulesResponse {
  modules: ClassModuleWithMaterials[];
  materialsWithoutModule: MaterialWithUrl[];
  class: IClass;
  course: ICourse;
}

export async function getMyClassMaterials(classId: number): Promise<ClassMaterialsResponse> {
  const response = await httpClient.get<ClassMaterialsResponse>(
    `/students/me/classes/${classId}/materials`
  );
  return response.data;
}

export async function getMyClassModules(classId: number): Promise<ClassModulesResponse> {
  const response = await httpClient.get<ClassModulesResponse>(
    `/students/me/classes/${classId}/modules`
  );
  return response.data;
}

export async function getAccessibleClasses(): Promise<IClass[]> {
  const response = await httpClient.get<IClass[]>('/students/me/classes');
  return response.data;
}
