export interface Course {
  id: string;
  title: string;
  description: string;
  tutor: string;
  frequency: string;
  level: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  format: string[];
  topics: string[];
  prerequisites?: string[];
}