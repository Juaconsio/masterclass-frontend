import { Clock } from "lucide-react"

// Use courses passed in via props; default to empty array to avoid relying on mock data

type CoursesSectionProps = {
  courses?: any[]
  loading?: boolean
}

export function CoursesSection({ courses: propCourses, loading }: CoursesSectionProps) {
  const data = (propCourses && propCourses.length ? propCourses : []) as any[]

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">My Courses</h2>
        <p className="text-muted-foreground">Continue learning and track your progress</p>
      </div>
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {!loading && data.length === 0 && <div className="text-muted-foreground">No courses found.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((course) => (
          <div
            key={course.id}
            className="card bg-base-100 shadow-xl border hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="aspect-video relative overflow-hidden bg-secondary">
              <img
                src={course.thumbnail || '/placeholder.svg'}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <span className={`badge ${
                  course.status === 'Completed'
                    ? 'badge-success'
                    : course.status === 'In Progress'
                      ? 'badge-secondary'
                      : 'badge-outline'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
            <div className="card-body p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-balance mb-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{course.instructor || course.instructors || course.teacher || ''}</p>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <a
                    href={`/dashboard/course-content/${course.id}`}
                    className="btn btn-sm btn-primary ml-4"
                  >
                    View
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              {course.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <progress className="progress progress-primary h-2" value={course.progress} max="100"></progress>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
