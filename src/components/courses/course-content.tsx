"use client"

import { useEffect, useState } from "react"
import { Play, CheckCircle2, Circle, ChevronDown, ChevronUp, FileText, Code } from "lucide-react"
import { httpClient } from '@/client/config'
import * as React from 'react'

interface CourseContentProps {
  course?: any
  courseId?: string
}

export function CourseContent({ course: propCourse, courseId }: CourseContentProps) {
  const [expandedSections, setExpandedSections] = useState<number[]>([1, 2])
  const [course, setCourse] = useState<any | null>(propCourse || null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(!propCourse)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true
    async function loadCourse() {
      if (!courseId) return
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await httpClient.get(`/courses/${courseId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        if (!mounted) return
        setCourse(res.data || null)

        // fetch sessions (same as StudentCourseView)
        try {
          const sessionsRes = await httpClient.get(`/courses/${courseId}/sessions`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          })
          if (!mounted) return
          setSessions(sessionsRes.data || [])
        } catch (e) {
          // ignore sessions error
          setSessions([])
        }
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Error loading course')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (!propCourse) loadCourse()
    return () => {
      mounted = false
    }
  }, [courseId, propCourse])

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "exercise":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // default sample course to show UI when no data is available
  const defaultCourse = {
    title: 'Example Course',
    description: 'This is a sample course description used for previewing the course content layout.',
    curriculum: [
      {
        id: 1,
        title: 'Introduction',
        lessons: [
          { id: 11, title: 'Welcome', duration: '5m', completed: true, type: 'video' },
          { id: 12, title: 'Setup', duration: '10m', completed: false, type: 'exercise' },
        ],
      },
      {
        id: 2,
        title: 'Core Concepts',
        lessons: [
          { id: 21, title: 'Topic A', duration: '20m', completed: false, type: 'video' },
          { id: 22, title: 'Topic B', duration: '25m', completed: false, type: 'article' },
        ],
      },
    ],
  }

  const hasFullCourse = (c: any) => c && Array.isArray(c.curriculum) && c.curriculum.length > 0

  const displayCourse = hasFullCourse(propCourse)
    ? propCourse
    : hasFullCourse(course)
    ? course
    : defaultCourse

  const resolvedCourseId = courseId || propCourse?.id || course?.id

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">About This Course</h2>
          <p className="text-muted-foreground leading-relaxed">{displayCourse.description}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Course Curriculum</h2>
        <div className="space-y-3">
          {displayCourse.curriculum.map((section: any) => {
            const isExpanded = expandedSections.includes(section.id)
            const completedCount = section.lessons.filter((l: any) => l.completed).length
            const totalCount = section.lessons.length

            return (
              <div key={section.id} className="card bg-base-100 shadow-xl border overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {section.id}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedCount} of {totalCount} lessons completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-outline badge-sm">
                      {totalCount} lessons
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {section.lessons.map((lesson: any, index: number) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                          index !== section.lessons.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-muted-foreground">{getLessonIcon(lesson.type)}</span>
                            <span
                              className={`${lesson.completed ? "text-muted-foreground" : "text-foreground font-medium"}`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          {!lesson.completed && (
                            <button className="btn btn-sm btn-ghost text-primary hover:text-primary">
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {/* Sessions (available classes) - show after the curriculum, like old StudentCourseView */}
      <div className="card bg-base-100 shadow-xl border mt-6">
        <div className="card-body p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Clases disponibles</h2>
          <div className="grid gap-3">
            {sessions && sessions.length > 0 ? (
              sessions.map((session: any) => (
                <div key={session.id} className="card bg-base-100 shadow-sm border">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{session.title}</h3>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`badge badge-outline badge-sm ${session.isActive ? 'badge-success' : 'badge-ghost'}`}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {resolvedCourseId ? (
                          <a
                            href={`/dashboard/session/${resolvedCourseId}/${session.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No se encontraron clases.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}