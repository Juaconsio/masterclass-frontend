export interface Course {
  id: string;
  slug: string;
  acronym: string;
  title: string;
  department: Department;
  level: Level;
  description: string;
  basePrice: number;
  image?: string;
  featured: boolean;
}

export interface PublicCourseSummary {
  id: number;
  slug: string;
  acronym: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface CourseListingData {
  id: number;
  slug: string;
  acronym: string;
  title: string;
  description: string;
  department: Department;
  level: Level;
  image?: string;
}

export interface CourseListingEntry {
  slug: string;
  data: CourseListingData;
}

export type Department =
  | 'Matemática'
  | 'Física'
  | 'Eléctrica'
  | 'Computación'
  | 'Industrial'
  | 'Ingeniería'
  | 'General';
export type Level = 'Plan Común' | 'Major' | 'Minor';

// Department colors for UI
export const DEPARTMENT_COLORS = {
  Matemática: 'badge-primary ',
  Física: 'badge-secondary',
  Eléctrica: 'badge-accent',
  Computación: 'badge-info',
  Industrial: 'badge-warning',
  Ingeniería: 'badge-neutral',
  General: 'badge-ghost',
} as const;

// Level colors for UI
// TO DO
export const LEVEL_COLORS = {
  'Plan Común': 'badge-info badge-soft',
  Major: 'badge-success badge-soft',
  Minor: 'badge-error badge-soft',
} as const;

// Department icons
export const DEPARTMENT_ICONS = {
  Matemática: '📐',
  Física: '⚛️',
  Eléctrica: '⚡',
  Computación: '💻',
  Industrial: '⚙️',
  Ingeniería: '🏗️',
  General: '📘',
} as const;
