import { httpClient } from '../config';
import type { ISlot } from '@/interfaces/models';

export interface CreateSlotPayload {
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality?: 'online' | 'presencial';
  studentsGroup?: string | null;
  location?: string | null;
  maxStudents?: number;
  minStudents?: number;
  link?: string | null;
  status?: string;
}

export interface UpdateSlotPayload {
  professorId?: number;
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

export const adminSlotsClient = {
  async getAll(): Promise<ISlot[]> {
    const response = await httpClient.get<ISlot[]>('/admin/slots');
    return response.data;
  },

  async getById(id: number): Promise<ISlot> {
    const response = await httpClient.get<ISlot>(`/admin/slots/${id}`);
    return response.data;
  },

  async create(payload: CreateSlotPayload): Promise<ISlot> {
    const response = await httpClient.post<ISlot>('/admin/slots', payload);
    return response.data;
  },

  async update(id: number, payload: UpdateSlotPayload): Promise<ISlot> {
    const response = await httpClient.patch<ISlot>(`/admin/slots/${id}`, payload);
    return response.data;
  },

  async delete(id: number, force: boolean = false): Promise<void> {
    await httpClient.delete(`/admin/slots/${id}`, {
      params: { force },
    });
  },
};
