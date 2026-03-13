import { httpClient } from './config';

export interface CourseMaterial {
  id: number;
  classId: number;
  mimeType: string;
  filename: string;
  bucketKey: string;
  downloadUrl?: string;
  displayName?: string | null;
  orderIndex?: number;
  moduleId?: number | null;
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

export async function deleteMaterial(materialId: number) {
  const response = await httpClient.delete(`/admin/materials/${materialId}`);
  return response.data;
}

export async function requestReplaceUrl(materialId: number, data: {
  filename: string;
  contentType: string;
  ext: string;
}) {
  const response = await httpClient.put(
    `/admin/materials/${materialId}/replace`,
    data
  );
  return response.data;
}

export async function confirmReplaceMaterial(
  materialId: number,
  data: {
    filename: string;
    newKey: string;
    contentType: string;
    moduleId?: number | null;
    displayName?: string;
    orderIndex?: number;
  }
) {
  const response = await httpClient.post(
    `/admin/materials/${materialId}/confirm-replace`,
    data
  );
  return response.data;
}

export async function updateMaterialMetadata(
  materialId: number,
  data: { moduleId?: number | null; displayName?: string; orderIndex?: number }
) {
  const response = await httpClient.patch(
    `/admin/materials/${materialId}`,
    data
  );
  return response.data;
}
