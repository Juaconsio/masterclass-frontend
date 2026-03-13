import { httpClient } from '../config';
import axios from 'axios';

export interface makeUploadUrlPayload {
  classId: number;
  filename: string;
  contentType: string;
  ext: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  contentType: string;
}

export async function makeUploadUrl(payload: makeUploadUrlPayload): Promise<UploadUrlResponse> {
  const { data } = await httpClient.post<UploadUrlResponse>('/admin/materials/upload-url', payload);
  return data;
}

export async function uploadFileToBucket(
  uploadUrl: string,
  file: File,
  contentType?: string
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType || file.type || 'application/octet-stream',
    },
  });
}

export interface ConfirmUploadPayload {
  classId: string;
  filename: string;
  key: string;
  contentType: string;
  moduleId?: number;
  displayName?: string;
  orderIndex?: number;
}

export async function confirmUpload(payload: ConfirmUploadPayload): Promise<void> {
  await httpClient.post('/admin/materials/confirm-upload', payload);
}
