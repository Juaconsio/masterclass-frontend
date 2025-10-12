import { Card } from "@components/ui-dashboard/card"
import { Clock } from "lucide-react"
import { Badge } from "@components/ui-dashboard/badge"
import { Progress } from "@components/ui-dashboard/progress"

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
          <Card
            key={course.id}
            className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <div className="aspect-video relative overflow-hidden bg-secondary">
              <img
                src={course.thumbnail || '/placeholder.svg'}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    course.status === 'Completed'
                      ? 'default'
                      : course.status === 'In Progress'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="bg-background/90 backdrop-blur-sm"
                >
                  {course.status}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
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
                    className="ml-4 rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700 text-sm"
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
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
