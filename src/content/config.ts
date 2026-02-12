import { defineCollection, z } from 'astro:content';

const courseSchema = z.object({
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
  featured: z.boolean().default(false),
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

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  cover: z.string().optional(),
  heroImage: z.string().optional(),
  heroImageFit: z.enum(['cover', 'contain']).optional(),
  heroImagePosition: z.string().optional(),
  author: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: blogSchema,
});

export const collections = {
  courses: coursesCollection,
  reviews: reviewsCollection,
  blog: blogCollection,
};

export type Course = z.infer<typeof courseSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type BlogPost = z.infer<typeof blogSchema>;
