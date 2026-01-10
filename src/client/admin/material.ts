import { httpClient } from '../config';
import axios from 'axios';

export interface makeUploadUrlPayload {
  classId: number;
  contentType: string;
  ext: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  contentType: string;
}

export async function makeUploadUrl({
  classId,
  contentType,
  ext,
}: makeUploadUrlPayload): Promise<UploadUrlResponse> {
  const { data } = await httpClient.post<UploadUrlResponse>('/admin/materials/upload-url', {
    classId,
    contentType,
    ext,
  });
  return data;
}

export async function uploadFileToBucket(uploadUrl: string, file: File): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}

export async function confirmUpload(
  classId: string,
  filename: string,
  key: string,
  contentType: string
): Promise<void> {
  await httpClient.post('/admin/materials/confirm-upload', {
    classId,
    filename,
    key,
    contentType,
  });
}
