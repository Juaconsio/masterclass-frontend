import { httpClient } from '../config';
import type { ISlot } from '@/interfaces/models';

export interface CreateSlotPayload {
  classId: number;
  startTime: string;
  endTime: string;
  modality?: 'online' | 'presencial';
  studentsGroup?: string | null;
  location?: string | null;
  maxStudents?: number;
  minStudents?: number;
  link?: string | null;
}

export interface UpdateSlotPayload {
  startTime?: string;
  endTime?: string;
  modality?: 'online' | 'presencial';
  studentsGroup?: string | null;
  location?: string | null;
  maxStudents?: number;
  minStudents?: number;
  status?: string;
  link?: string | null;
}

export const professorSlotsClient = {
  async getAll(): Promise<ISlot[]> {
    const response = await httpClient.get<ISlot[]>('/professors/me/slots');
    return response.data;
  },

  async getById(id: number): Promise<ISlot> {
    const response = await httpClient.get<ISlot>(`/professors/me/slots/${id}`);
    return response.data;
  },

  async create(payload: CreateSlotPayload): Promise<ISlot> {
    const response = await httpClient.post<ISlot>('/professors/me/slots', payload);
    return response.data;
  },

  async update(id: number, payload: UpdateSlotPayload): Promise<ISlot> {
    const response = await httpClient.patch<ISlot>(`/professors/me/slots/${id}`, payload);
    return response.data;
  },

  async delete(id: number, force: boolean = false): Promise<void> {
    await httpClient.delete(`/professors/me/slots/${id}`, {
      params: { force },
    });
  },
};
