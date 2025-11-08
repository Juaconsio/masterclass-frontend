import { httpClient } from './config';

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  frequency?: 'one-time' | 'monthly' | 'weekly';
  features?: string[];
}

export interface QuoteParams {
  courseId: string | number;
  classId?: string | number;
  slotId?: string | number;
}

export async function getPaymentPlans(params: QuoteParams): Promise<PaymentPlan[]> {
  // try {
  //   const res = await httpClient.get('/payments/plans', { params });
  //   return res.data?.plans ?? [];
  // } catch (err) {
  // Fallback mock if API not ready
  return [
    {
      id: 'trial',
      name: 'Clase Grupal',
      description: 'Clase regular en grupo',
      price: 11_000,
      currency: 'CLP',
      frequency: 'one-time',
      features: ['60 minutos', 'Zoom', 'Material básico'],
    },
  ];
  // }
}
