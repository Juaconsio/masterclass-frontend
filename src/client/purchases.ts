import type { IReservation } from '@/interfaces';
import { httpClient } from './config';

export interface StudentPlanPurchase {
  id: number;
  studentId: number;
  pricingPlanId: number;
  creditsTotal: number;
  creditsRemaining: number;
  expiresAt?: string | null;
  pricingPlan?: {
    id: number;
    name: string;
    reservationCount: number;
    course?: { id: number; title: string; acronym: string };
    allowedClasses?: { id: number; title: string; orderIndex: number; courseId: number }[];
  };
}

export interface CreatePurchaseResult {
  purchase: StudentPlanPurchase;
  payment: { id: number; amount: number; currency: string; status: string };
  reservation?: IReservation;
}

export async function getMyPurchases(): Promise<StudentPlanPurchase[]> {
  const res = await httpClient.get<StudentPlanPurchase[]>('/students/me/purchases');
  return res.data ?? [];
}

export async function createPurchase(payload: {
  pricingPlanId: number;
  slotId?: number;
}): Promise<CreatePurchaseResult> {
  const res = await httpClient.post<CreatePurchaseResult>('/students/me/purchases', payload);
  return res.data;
}
