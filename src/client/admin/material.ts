import { httpClient } from '../config';
import axios from 'axios';

export interface makeUploadUrlPayload {
  courseAcronym: string;
  classIndex: number;
  contentType: string;
  ext: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  fileName: string;
}

export async function makeUploadUrl({
  courseAcronym,
  classIndex,
  contentType,
  ext,
}: makeUploadUrlPayload): Promise<UploadUrlResponse> {
  const { data } = await httpClient.post<UploadUrlResponse>('/admin/materials/upload-url', {
    courseAcronym,
    classIndex,
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
