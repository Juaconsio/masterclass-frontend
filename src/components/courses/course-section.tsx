'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMyReservations } from '../../client/reservations';

// Use courses passed in via props; if none provided, fetch via /me/reservations

type CoursesSectionProps = {
  courses?: any[];
  loading?: boolean;
};

export function CoursesSection({
  courses: propCourses,
  loading: propLoading,
}: CoursesSectionProps) {
  const [fetchedCourses, setFetchedCourses] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(!!propLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // only fetch when no courses passed via props
    if (propCourses && propCourses.length) {
      setFetchedCourses(propCourses);
      setLoading(Boolean(propLoading));
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== 'undefined' ? (localStorage.getItem('token') ?? undefined) : undefined;
        const res = await fetchMyReservations(token);
        if (!mounted) return;
        const returnedCourses = res?.courses ?? []
        const reservations = res?.reservations ?? []

        if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
          // eslint-disable-next-line no-console
          console.debug('fetchMyReservations response', { returnedCourses, reservations })
        }

        // Group reservations by courseId
        const byCourse = new Map<number, any[]>()
        for (const r of reservations) {
          const courseId = r?.slot?.class?.courseId ?? r?.slot?.class?.course?.id
          if (!courseId) continue
          const list = byCourse.get(courseId) ?? []
          list.push(r)
          byCourse.set(courseId, list)
        }

        // Map API course shape into UI-friendly course objects and attach reservation info
        const mapped = (Array.isArray(returnedCourses) ? returnedCourses : []).map((c: any) => {
          const cid = Number(c.id)
          const courseReservations = byCourse.get(cid) ?? []

          // find next session (earliest startTime) and list of formatted start times
          let nextSession: string | null = null
          const reservationsList: string[] = []
          if (courseReservations.length) {
            const startTimesRaw = courseReservations
              .map((r: any) => r?.slot?.startTime)
              .filter(Boolean)
            const startTimesMillis = startTimesRaw.map((s: string) => new Date(s).getTime())
            if (startTimesMillis.length) {
              const earliest = Math.min(...startTimesMillis)
              nextSession = new Date(earliest).toLocaleString()
            }
            // formatted list (sorted ascending)
            const sorted = startTimesMillis
              .sort((a, b) => a - b)
              .map((ms) => new Date(ms).toLocaleString())
            reservationsList.push(...sorted)
          }

          return {
            id: String(c.id),
            title: c.title ?? c.name ?? 'Untitled',
            description: c.description ?? '',
            instructor: c.professor?.name ?? c.professor ?? c.instructor ?? '',
            thumbnail: c.thumbnail ?? c.image ?? '/placeholder.svg',
            duration: c.duration ?? c.totalDuration ?? '',
            progress: c.progress ?? 0,
            status: c.status ?? (c.visible ? 'In Progress' : 'Hidden'),
            reservationsCount: courseReservations.length,
            nextSession,
            reservationsList,
          }
        })

        setFetchedCourses(mapped)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [propCourses, propLoading]);

  const data = (fetchedCourses && fetchedCourses.length ? fetchedCourses : []) as any[];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-foreground mb-2 text-2xl font-bold">My Courses</h2>
        <p className="text-muted-foreground">Continue learning and track your progress</p>
      </div>
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && data.length === 0 && (
        <div className="text-muted-foreground">No courses found.</div>
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
                    <p className="text-muted-foreground mt-1 text-sm">{course.description}</p>
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

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.nextSession ?? course.duration ?? 'No upcoming sessions'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground">Reservations:</span>
                <span className="font-medium text-foreground">{course.reservationsCount ?? 0}</span>
              </div>
                {Array.isArray(course.reservationsList) && course.reservationsList.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <div className="text-xs text-muted-foreground">Upcoming sessions:</div>
                    <ul className="list-disc list-inside text-sm">
                      {course.reservationsList.map((d: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
