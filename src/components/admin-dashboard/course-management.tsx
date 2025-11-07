"use client"

import { useEffect, useState } from "react"
import { fetchCourses } from "../../client/courses"

type Course = {
  id: string
  title: string
  description: string
  visible: boolean
  professor: string
  studentsCount: number
  category: string
}

// initial mock removed - courses will be fetched from the API

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchCourses()
        if (!mounted) return
        // Attempt to map API shape to local Course type if necessary
        setCourses(
          Array.isArray(data)
            ? data.map((c: any) => ({
                id: String(c.id),
                title: c.title ?? c.name ?? "Untitled",
                description: c.description ?? "",
                visible: typeof c.visible === "boolean" ? c.visible : Boolean(c.isVisible ?? true),
                professor: c.professor?.name ?? c.professor ?? c.instructor ?? "",
                studentsCount: Number(c.studentsCount ?? c.enrolled ?? 0),
                category: c.category ?? c.subject ?? "",
              }))
            : [],
        )
      } catch (err: any) {
        console.error('Failed to load courses', err)
        setError(err?.message ?? 'Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleVisibility = (courseId: string) => {
    setCourses(courses.map((course) => (course.id === courseId ? { ...course, visible: !course.visible } : course)))
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Total Courses</div>
            <div className="stat-value text-foreground">{courses.length}</div>
            <div className="stat-desc text-muted-foreground">All courses</div>
          </div>
        </div>
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Visible</div>
            <div className="stat-value text-accent">{courses.filter((c) => c.visible).length}</div>
            <div className="stat-desc text-muted-foreground">Published courses</div>
          </div>
        </div>
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Total Students</div>
            <div className="stat-value text-accent">{courses.reduce((sum, c) => sum + c.studentsCount, 0)}</div>
            <div className="stat-desc text-muted-foreground">Enrolled students</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card bg-card border border-border shadow-lg">
        <div className="card-body">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search courses or professors..."
              className="input input-bordered w-full bg-secondary text-foreground placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading && (
        <div className="card bg-card border border-border shadow-lg">
          <div className="card-body">
            <div className="animate-pulse text-muted-foreground">Loading courses...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="card bg-card border border-border shadow-lg">
          <div className="card-body">
            <div className="text-error">{error}</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="card bg-card border border-border shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <h3 className="card-title text-foreground text-base">{course.title}</h3>
                <div className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <span className="label-text text-xs text-muted-foreground">Visible</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-sm"
                      checked={course.visible}
                      onChange={() => toggleVisibility(course.id)}
                    />
                  </label>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{course.description}</p>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  <span className="text-muted-foreground">{course.professor}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                  <span className="text-muted-foreground">{course.studentsCount} students</span>
                </div>
              </div>

              <div className="card-actions justify-between items-center mt-4">
                <span className="badge badge-ghost text-xs">{course.category}</span>
                <button onClick={() => setSelectedCourse(course)} className="btn btn-sm btn-accent">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <>
          <input type="checkbox" id="course-modal" className="modal-toggle" checked readOnly />
          <div className="modal" onClick={() => setSelectedCourse(null)}>
            <div className="modal-box bg-card border border-border max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg text-foreground mb-4">{selectedCourse.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-muted-foreground">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full bg-secondary text-foreground"
                    rows={3}
                    defaultValue={selectedCourse.description}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-muted-foreground">Assigned Professor</span>
                  </label>
                  <select className="select select-bordered w-full bg-secondary text-foreground">
                    <option>Carol Williams</option>
                    <option>Emma Davis</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-muted-foreground">Category</span>
                  </label>
                  <select className="select select-bordered w-full bg-secondary text-foreground">
                    <option>Web Development</option>
                    <option>Programming</option>
                    <option>Design</option>
                    <option>Backend</option>
                    <option>Database</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="toggle toggle-accent"
                      checked={selectedCourse.visible}
                      onChange={() => toggleVisibility(selectedCourse.id)}
                    />
                    <span className="label-text text-foreground">Course Visible to Students</span>
                  </label>
                </div>
              </div>

              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => setSelectedCourse(null)}>
                  Cancel
                </button>
                <button className="btn btn-accent" onClick={() => setSelectedCourse(null)}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
