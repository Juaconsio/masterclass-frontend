export interface Course {
  id: string;
  slug: string;
  acronym: string;
  title: string;
  department: Department;
  level: Level;
  description: string;
  basePrice: number;
  prerequisites?: string[];
  image?: string;
  featured: boolean;
}

export type Department = 'Matemática' | 'Física' | 'Eléctrica' | 'Computación' | 'Industrial';
export type Level = 'Plan Común' | 'Major' | 'Minor';

// Department colors for UI
export const DEPARTMENT_COLORS = {
  'Matemática': 'badge-primary',
  'Física': 'badge-secondary', 
  'Eléctrica': 'badge-accent',
  'Computación': 'badge-info',
  'Industrial': 'badge-warning'
} as const;

// Level colors for UI
export const LEVEL_COLORS = {
  'Plan Común': 'badge-neutral',
  'Major': 'badge-success',
  'Minor': 'badge-error'
} as const;

// Department icons
export const DEPARTMENT_ICONS = {
  'Matemática': '📐',
  'Física': '⚛️',
  'Eléctrica': '⚡',
  'Computación': '💻',
  'Industrial': '⚙️'
} as const;