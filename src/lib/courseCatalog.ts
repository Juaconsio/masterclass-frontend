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

function buildSlug(acronym: string, title: string) {
  return `${acronym.toLowerCase()}-${slugifyTitle(title)}`;
}

function mergeCourse(
  baseCourse: PublicCourseSummary,
  marketing?: CollectionEntry<'courseDescriptions'>
): CourseListingEntry {
  const data = marketing?.data;

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
      basePrice: data?.basePrice ?? defaultMarketing.basePrice,
      featured: data?.featured ?? defaultMarketing.featured,
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
