import { httpClient } from './config';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | string;
  joinedDate?: string;
  coursesCount?: number;
};

export async function fetchUsers(): Promise<ApiUser[]> {
  const res = await httpClient.get('/professors/all-users');
  const payload = res.data;

  // Normalize common backend shapes: array directly, { data: [...] }, or { users: [...] }
  if (Array.isArray(payload)) return payload as ApiUser[];
  if (payload && Array.isArray(payload.data)) return payload.data as ApiUser[];
  if (payload && Array.isArray(payload.users)) return payload.users as ApiUser[];

  // Backend returns grouped lists: { students: [...], professors: [...], admins: [...] }
  if (payload && (Array.isArray(payload.students) || Array.isArray(payload.professors) || Array.isArray(payload.admins))) {
    const students = Array.isArray(payload.students) ? payload.students.map((s: any) => ({ ...s, role: 'student' })) : [];
    const professors = Array.isArray(payload.professors) ? payload.professors.map((p: any) => ({ ...p, role: 'teacher' })) : [];
    const admins = Array.isArray(payload.admins) ? payload.admins.map((a: any) => ({ ...a, role: 'teacher' })) : [];
    return [...students, ...professors, ...admins] as ApiUser[];
  }

  // Unexpected shape: return empty array and warn in dev
  if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn('fetchUsers: unexpected response shape', payload);
  }
  return [];
}

export async function promoteUserToTeacher(userId: string): Promise<void> {
  await httpClient.post(`/professors/promote/${userId}`);
}

export async function demoteUserToStudent(userId: string): Promise<void> {
  await httpClient.post(`/professors/demote/${userId}`);
}


export default fetchUsers;
