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
      name: 'Clase de prueba',
      description: 'Primera clase con descuento',
      price: 0,
      currency: 'CLP',
      frequency: 'one-time',
      features: ['30 minutos', 'Zoom', 'Material básico'],
    },
    {
      id: 'single',
      name: 'Clase individual',
      description: 'Pago por una clase',
      price: 14990,
      currency: 'CLP',
      frequency: 'one-time',
      features: ['1 hora', 'Grabación incluida', 'Soporte por WhatsApp'],
    },
    {
      id: 'pack-4',
      name: 'Pack 4 clases',
      description: 'Ahorra 10%',
      price: 53960,
      currency: 'CLP',
      frequency: 'one-time',
      features: ['4 clases', 'Prioridad de agenda', 'Material premium'],
    },
  ];
  // }
}
