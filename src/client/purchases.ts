import type { IReservation } from '@/interfaces';
import { httpClient } from './config';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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
    accessMode?: 'sessions_and_materials' | 'materials_only';
    course?: { id: number; title: string; acronym: string };
    allowedClasses?: { id: number; title: string; orderIndex: number; courseId: number }[];
  };
  payments?: { id: number; status: PaymentStatus }[];
}

export interface CreatePurchaseResult {
  purchase: StudentPlanPurchase;
  payment: { id: number; amount: number; currency: string; status: string };
  reservation?: IReservation;
  checkoutUrl?: string | null;
}

export async function getMyPurchases(): Promise<StudentPlanPurchase[]> {
  const res = await httpClient.get<StudentPlanPurchase[]>('/students/me/purchases');
  return res.data ?? [];
}

export interface SlotsForPurchaseSlot {
  id: number;
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality: string;
  professor?: { id: number; name: string };
  availableSeats: number;
}

export interface PlanConstraints {
  allowedModalities: string[];
  allowedStudentsGroups: string[];
  allowedClasses: { id: number; title: string }[];
}

export interface SlotsForPurchaseResponse {
  purchase: {
    id: number;
    creditsRemaining: number;
    pricingPlan: {
      name: string;
      course?: { id: number; title: string; acronym: string };
    };
    planConstraints?: PlanConstraints;
  };
  classes: { title: string; slots: SlotsForPurchaseSlot[] }[];
}

export async function getSlotsForPurchase(purchaseId: number): Promise<SlotsForPurchaseResponse> {
  const res = await httpClient.get<SlotsForPurchaseResponse>(
    `/students/me/purchases/${purchaseId}/slots`
  );
  return res.data;
}

export async function createPurchase(payload: {
  pricingPlanId: number;
  slotId?: number;
  paymentMethod?: 'mercadopago' | 'manual';
}): Promise<CreatePurchaseResult> {
  const res = await httpClient.post<CreatePurchaseResult>('/students/me/purchases', payload);
  return res.data;
}
