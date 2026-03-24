import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { CourseListingEntry, PublicCourseSummary } from '@/types/course';
import { fetchPublicCourses } from '@/client/publicCourses';

const defaultMarketing = {
  department: 'General',
  level: 'Plan Común',
  basePrice: 0,
  featured: false,
} as const;

function slugifyTitle(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function buildSlug(acronym: string, title: string) {
  return `${acronym.toLowerCase()}-${slugifyTitle(title)}`;
}

import course1 from '@/assets/courses/course-1.jpg?url';
import course2 from '@/assets/courses/course-2.jpg?url';
import course3 from '@/assets/courses/course-3.jpg?url';
import course4 from '@/assets/courses/course-4.jpg?url';
import course5 from '@/assets/courses/course-5.jpg?url';
import course6 from '@/assets/courses/course-6.jpg?url';

const COURSE_IMAGES: Record<string, string> = {
  'course-1.jpg': course1,
  'course-2.jpg': course2,
  'course-3.jpg': course3,
  'course-4.jpg': course4,
  'course-5.jpg': course5,
  'course-6.jpg': course6,
};

function mergeCourse(
  baseCourse: PublicCourseSummary,
  marketing?: CollectionEntry<'courseDescriptions'>
): CourseListingEntry {
  const data = marketing?.data;
  const image = data?.image ? COURSE_IMAGES[data.image] : undefined;

  return {
    slug: baseCourse.slug,
    data: {
      id: baseCourse.id,
      slug: baseCourse.slug,
      acronym: baseCourse.acronym,
      title: baseCourse.title,
      description: baseCourse.description,
      department: data?.department ?? defaultMarketing.department,
      level: data?.level ?? defaultMarketing.level,
      image,
    },
  };
}

export async function getPublicCourseCatalog(options?: {
  includeInactive?: boolean;
}): Promise<CourseListingEntry[]> {
  try {
    const { includeInactive = false } = options ?? {};
    const [baseCourses, marketingEntries] = await Promise.all([
      fetchPublicCourses(),
      getCollection('courseDescriptions'),
    ]);
    const marketingBySlug = new Map(marketingEntries.map((entry) => [entry.slug, entry]));

    const visibleCourses = includeInactive
      ? baseCourses
      : baseCourses.filter((course) => course.isActive);

    return visibleCourses.map((course) => {
      const slug = buildSlug(course.acronym, course.title);
      const baseSummary: PublicCourseSummary = {
        ...course,
        slug,
      };
      return mergeCourse(baseSummary, marketingBySlug.get(slug));
    });
  } catch {
    return [];
  }
}
