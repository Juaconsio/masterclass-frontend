import { httpClient } from '../config';
import type { IPricingPlan, PricingPlanAccessMode } from '@/interfaces';

export interface AdminPricingPlanListItem extends IPricingPlan {
  id: number;
  reservationCount: number;
  courseId: number | null;
  accessMode: PricingPlanAccessMode;
  allowReschedule: boolean;
  allowedModalities: string[];
  allowedStudentsGroups: string[];
  allowedClasses: { id: number; title?: string; courseId?: number }[];
}

export interface AdminPricingPlansResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: AdminPricingPlanListItem[];
}

export interface CreatePricingPlanPayload {
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  reservationCount?: number;
  courseId?: number | null;
  allowReschedule?: boolean;
  accessMode?: 'sessions_and_materials' | 'materials_only';
  allowedModalities?: string[];
  allowedStudentsGroups?: string[];
  classIds?: number[];
}

export interface UpdatePricingPlanPayload {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  reservationCount?: number;
  allowReschedule?: boolean;
  accessMode?: 'sessions_and_materials' | 'materials_only';
  allowedModalities?: string[];
  allowedStudentsGroups?: string[];
  classIds?: number[];
}

export const adminPricingPlansClient = {
  async list(params?: {
    courseId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<AdminPricingPlansResponse> {
    const searchParams = new URLSearchParams();
    if (params?.courseId != null) searchParams.set('courseId', String(params.courseId));
    if (params?.page != null) searchParams.set('page', String(params.page));
    if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    const res = await httpClient.get<AdminPricingPlansResponse>(
      `/admin/pricing-plans${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  async getById(id: number): Promise<
    AdminPricingPlanListItem & {
      allowedClasses: { id: number; title?: string; courseId?: number }[];
    }
  > {
    const res = await httpClient.get(`/admin/pricing-plans/${id}`);
    return res.data;
  },

  async create(payload: CreatePricingPlanPayload): Promise<AdminPricingPlanListItem> {
    const res = await httpClient.post('/admin/pricing-plans', payload);
    return res.data;
  },

  async update(id: number, payload: UpdatePricingPlanPayload): Promise<AdminPricingPlanListItem> {
    const res = await httpClient.put(`/admin/pricing-plans/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/pricing-plans/${id}`);
  },
};
