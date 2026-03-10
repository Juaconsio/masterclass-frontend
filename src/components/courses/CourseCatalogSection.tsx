import { Link } from 'react-router';
import { BookOpen, ShoppingCart } from 'lucide-react';

export type CatalogCourse = {
  id: number;
  title: string;
  acronym: string;
  description?: string | null;
  isActive?: boolean;
};

type CourseCatalogSectionProps = {
  courses: CatalogCourse[];
  enrolledCourseIds: Set<number>;
  loading: boolean;
};

export function CourseCatalogSection({
  courses,
  enrolledCourseIds,
  loading,
}: CourseCatalogSectionProps) {
  if (loading) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-foreground mb-2 text-2xl font-bold">Cursos</h2>
          <p className="text-muted-foreground">Catálogo de cursos disponibles</p>
        </div>
        <div className="flex min-h-[200px] items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-foreground mb-2 text-2xl font-bold">Cursos</h2>
          <p className="text-muted-foreground">
            Explora todos los cursos. Inscritos tienen acceso a material y clases.
          </p>
        </div>
      </div>
      {courses.length === 0 ? (
        <div className="text-muted-foreground border-base-content/20 bg-base-200/50 rounded-xl border-2 border-dashed p-8 text-center">
          No hay cursos disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <div
                key={course.id}
                className="card bg-base-100 group border shadow-xl transition-all duration-300 hover:shadow-2xl"
              >
                <div className="card-body space-y-3 p-4">
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="text-foreground group-hover:text-primary text-2xl font-semibold text-balance transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-base-content/60 font-mono text-lg">{course.acronym}</p>
                    {course.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-3 text-sm">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="card-actions justify-end">
                    <Link to={`/app/cursos/${course.id}`} className="btn btn-primary btn-sm">
                      {isEnrolled ? 'Ver curso' : 'Ver información'}
                    </Link>
                    {!isEnrolled && (
                      <Link
                        to={`/checkout?courseAcronym=${encodeURIComponent(course.acronym)}`}
                        className="btn btn-outline btn-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Comprar plan
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
