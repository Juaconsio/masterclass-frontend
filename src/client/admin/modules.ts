import { httpClient } from '../config';
import type { ClassModule } from './courses';
import type { ClassModulesResponse } from '@/client/student/materials';

/** Creates a module; backend assigns orderIndex as last. */
export async function createModule(
  classId: number,
  payload: { title: string }
): Promise<ClassModule> {
  const { data } = await httpClient.post<ClassModule>(
    `/admin/classes/${classId}/modules`,
    payload
  );
  return data;
}

export async function getClassModules(classId: number): Promise<ClassModule[]> {
  const { data } = await httpClient.get<ClassModule[]>(
    `/admin/classes/${classId}/modules`
  );
  return data;
}

export async function updateModule(
  id: number,
  payload: { title?: string; orderIndex?: number }
): Promise<ClassModule> {
  const { data } = await httpClient.patch<ClassModule>(`/admin/modules/${id}`, payload);
  return data;
}

export async function deleteModule(id: number): Promise<void> {
  await httpClient.delete(`/admin/modules/${id}`);
}

export async function getAdminClassPreview(classId: number): Promise<ClassModulesResponse> {
  const { data } = await httpClient.get<ClassModulesResponse>(
    `/admin/classes/${classId}/preview`
  );
  return data;
}
