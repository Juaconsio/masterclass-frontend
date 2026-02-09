import { defineCollection, z } from 'astro:content';

const courseSchema = z.object({
  id: z.string(), // Matches backend course ID
  acronym: z.string(),
  title: z.string(),
  department: z.enum([
    'Matemática',
    'Física',
    'Eléctrica',
    'Computación',
    'Industrial',
    'Ingeniería',
  ]),
  level: z.enum(['Plan Común', 'Major', 'Minor']),
  description: z.string(),
  prerequisites: z.array(z.string()).optional(),
  basePrice: z.number(), // TODO : ver precio
  image: z.string().optional(),
  featured: z.boolean().default(false),
  class_count: z.number().optional(),
});

const coursesCollection = defineCollection({
  type: 'content',
  schema: courseSchema,
});

const reviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  profile: z.string(),
  studies: z.string(),
  comment: z.string(),
  course: z.string(),
  rating: z.number().min(1).max(5).optional(),
  image: z.string().optional(),
  featured: z.boolean().default(false), // For highlighting special reviews
  date: z.string().optional(), // For sorting by date if needed
});

const reviewsCollection = defineCollection({
  type: 'content',
  schema: reviewSchema,
});

export const collections = {
  courses: coursesCollection,
  reviews: reviewsCollection,
};

export type Course = z.infer<typeof courseSchema>;
export type Review = z.infer<typeof reviewSchema>;
