import { httpClient } from '@/client/config';

// Types for dashboard response
export interface AdminDashboardStats {
  stats: {
    courses: { total: number; newThisMonth: number };
    students: { total: number; newThisMonth: number };
    reservations: { active: number; pending: number };
    revenue: { thisMonth: number; lastMonth: number; changePercent: number };
  };
  recentActivity: {
    reservations: Array<{
      id: number;
      status: string; // 'confirmed' | 'pending' | etc.
      student: { id: number; name: string; email: string };
      class: {
        title: string;
        orderIndex: number;
        course: { id: number; title: string; acronym: string };
      };
      slot: { id: number; startTime: string; endTime: string };
    }>;
    pendingPayments: Array<{
      id: number;
      amount: number;
      transactionReference: string;
      createdAt: string;
      student: { id: number; name: string; email: string };
      courses: Array<{ title: string; acronym: string; classTitle: string }>;
    }>;
  };
}

// Fetch function for admin dashboard
export async function getAdminDashboard(): Promise<AdminDashboardStats> {
  const response = await httpClient.get('/admin/dashboard');
  return response.data;
}
