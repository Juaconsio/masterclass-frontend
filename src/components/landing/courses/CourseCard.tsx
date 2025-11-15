import { Link } from 'react-router';
import type { Course } from '@/lib/content';

// Department colors for UI
const DEPARTMENT_COLORS = {
  Matemática: 'badge-primary',
  Física: 'badge-secondary',
  Eléctrica: 'badge-accent',
  Computación: 'badge-info',
  Industrial: 'badge-warning',
} as const;

// Level colors for UI
const LEVEL_COLORS = {
  'Plan Común': 'badge-info badge-soft',
  Major: 'badge-success badge-soft',
  Minor: 'badge-error badge-soft',
} as const;

// Department icons
const DEPARTMENT_ICONS = {
  Matemática: '📐',
  Física: '⚛️',
  Eléctrica: '⚡',
  Computación: '💻',
  Industrial: '⚙️',
} as const;

interface Props {
  course: Course;
  index?: number;
}

const getUsalAnimation = (idx: number | null) => {
  if (idx === null) return 'fade-u';
  switch (idx % 4) {
    case 0:
      return 'fade-r delay-[100]';
    case 1:
      return 'fade-u delay-[200]';
    case 2:
      return 'fade-b delay-[300]';
    case 3:
      return 'fade-l delay-[400]';
    default:
      return 'fade-u';
  }
};

export default function CourseCard({ course, index }: Props) {
  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 course-card"
      data-department={course.department}
      data-level={course.level}
      data-acronym={course.acronym}
      data-usal={getUsalAnimation(index ?? null)}
    >
      {/* Course Image */}
      {course.image ? (
        <figure className="relative">
          <img
            src={course.image}
            alt={course.title}
            className="h-32 sm:h-36 md:h-40 w-full object-cover"
            loading="lazy"
          />
          {course.featured && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <div className="badge badge-primary badge-sm sm:badge-lg font-bold shadow-lg">
                ⭐ Destacado
              </div>
            </div>
          )}
        </figure>
      ) : (
        <figure className="bg-gradient-to-br from-primary/20 to-secondary/20 h-36 sm:h-40 md:h-48 flex items-center justify-center relative">
          <div className="text-4xl sm:text-5xl md:text-6xl opacity-50">
            {DEPARTMENT_ICONS[course.department]}
          </div>
          {course.featured && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <div className="badge badge-primary badge-sm sm:badge-lg font-bold shadow-lg">
                ⭐ Destacado
              </div>
            </div>
          )}
        </figure>
      )}

      <div className="card-body p-4 sm:p-5 md:p-6 justify-between">
        {/* Course Acronym and Title */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <div className="badge badge-ghost font-mono font-bold text-xs sm:text-sm">
              {course.acronym}
            </div>
            <div
              className={`badge badge-soft ${LEVEL_COLORS[course.level]} font-mono font-bold text-xs sm:text-sm`}
            >
              {course.level}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
            <h2 className="card-title text-lg sm:text-xl md:text-2xl font-bold line-clamp-2">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Department and Level Badges */}
        <div className="text-base-content/50 text-xs sm:text-sm flex items-center gap-1">
          {DEPARTMENT_ICONS[course.department]}
          <span className="truncate">{course.department}</span>
        </div>

        {/* Course Description */}
        <p className="text-base-content/50 text-xs sm:text-sm line-clamp-3">
          {course.description}
        </p>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-xs sm:text-sm font-medium flex items-center gap-2 py-2 sm:py-3 min-h-0">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-warning shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Prerequisites ({course.prerequisites.length})
              </div>
              <div className="collapse-content px-3 sm:px-4">
                <div className="space-y-1 text-xs">
                  {course.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <svg
                        className="w-3 h-3 text-error shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Actions */}
        <div className="card-actions justify-end pt-3 sm:pt-4 border-t border-base-300">
          <Link
            to={'/courses/' + course.slug}
            className="btn btn-primary btn-sm sm:btn-md btn-block hover:btn-primary-focus transition-colors group"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  );
}
