import coursesData from '../data/courses.json';
import reviewsData from '../data/reviews.json';

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
  content?: string;
}

export interface Review {
  id: string;
  name: string;
  profile: string;
  studies: string;
  comment: string;
  course: string;
  rating?: number;
  image?: string;
  featured: boolean;
  date?: string;
}

export type Department = 'Matemática' | 'Física' | 'Eléctrica' | 'Computación' | 'Industrial';
export type Level = 'Plan Común' | 'Major' | 'Minor';

export function getCourses(): Course[] {
  return coursesData as Course[];
}

export function getReviews(): Review[] {
  return reviewsData as Review[];
}

export function getCourseBySlug(slug: string): Course | undefined {
  const courses = getCourses();
  return courses.find(course => course.slug === slug || course.acronym === slug);
}
