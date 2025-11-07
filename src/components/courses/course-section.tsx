import { Clock } from 'lucide-react';
import { Link } from 'react-router';

// Use courses passed in via props; default to empty array to avoid relying on mock data

type CoursesSectionProps = {
  courses?: any[];
  loading?: boolean;
};

export function CoursesSection({ courses: propCourses, loading }: CoursesSectionProps) {
  const data = (propCourses && propCourses.length ? propCourses : []) as any[];

  return (
    <section>
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-foreground mb-2 text-2xl font-bold">Mis Cursos</h2>
          <p className="text-muted-foreground">Continúa aprendiendo y sigue tu progreso</p>
        </div>
        <div>
          <a href="/courses" className="btn btn-primary btn-soft text-primary hover:underline">
            Ver todos los cursos aquí
          </a>
        </div>
      </div>
      {loading && <div className="text-muted-foreground">Cargando...</div>}
      {!loading && data.length === 0 && (
        <div className="text-muted-foreground">No se encontraron cursos.</div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.map((course) => (
          <div
            key={course.id}
            className="card bg-base-100 group border shadow-xl transition-all duration-300 hover:shadow-2xl"
          >
            <div className="bg-secondary relative aspect-video overflow-hidden">
              <img
                src={course.thumbnail || '/placeholder.svg'}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`badge ${
                    course.status === 'Completed'
                      ? 'badge-success'
                      : course.status === 'In Progress'
                        ? 'badge-secondary'
                        : 'badge-outline'
                  }`}
                >
                  {course.status}
                </span>
              </div>
            </div>
            <div className="card-body space-y-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-foreground group-hover:text-primary mb-1 font-semibold text-balance transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {course.instructor || course.instructors || course.teacher || ''}
                  </p>
                  {course.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-3 text-sm">
                      {course.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Link to={`/app/cursos/${course.id}`} className="btn btn-sm btn-primary ml-4">
                    View
                  </Link>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{course.progress}%</span>
                  </div>
                  <progress
                    className="progress progress-primary h-2"
                    value={course.progress}
                    max="100"
                  ></progress>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
