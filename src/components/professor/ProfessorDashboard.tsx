"use client"

import React, { useEffect, useState } from 'react'
import { fetchCourses } from '../../client/courses'
import { fetchClassesByCourse } from '../../client/classes'
import { createClass } from '../../client/classes'

type Course = { id: number; title: string }
type Class = { id: number; courseId: number; title: string }
type Slot = {
  id: number
  classId: number
  startTime: string
  modality?: string
  minStudents?: number
  maxStudents?: number
  durationMinutes?: number
}

const mockCourses: Course[] = [
  { id: 1, title: 'Física I' },
  { id: 2, title: 'Cálculo II' },
]

const mockClasses: Class[] = [
  { id: 11, courseId: 1, title: 'Dinámica' },
  { id: 12, courseId: 1, title: 'Electromagnetismo' },
  { id: 21, courseId: 2, title: 'Series y sucesiones' },
]

const initialSlots: Slot[] = [
  { id: 100, classId: 11, startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), modality: 'Presencial', minStudents: 1, maxStudents: 20, durationMinutes: 60 },
  { id: 101, classId: 21, startTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), modality: 'Online', minStudents: 1, maxStudents: 30, durationMinutes: 90 },
]

export default function ProfessorDashboard() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [classes, setClasses] = useState<Class[]>(mockClasses)
  // separate date and time inputs
  const initialDate = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const defaultDate = `${initialDate.getFullYear()}-${pad(initialDate.getMonth() + 1)}-${pad(initialDate.getDate())}`
  const defaultTime = `${pad(initialDate.getHours())}:${pad(initialDate.getMinutes())}`

  const firstClassId = classes.length > 0 ? classes[0].id : (mockClasses[0]?.id ?? null)
  const [form, setForm] = useState<{ classId: number | null; date: string; time: string; modality: string; minStudents: number; maxStudents: number; durationMinutes: number }>({
    classId: firstClassId,
    date: defaultDate,
    time: defaultTime,
    modality: 'Presencial',
    minStudents: 1,
    maxStudents: 20,
    durationMinutes: 60,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const cs = await fetchCourses()
        if (!mounted) return
        if (Array.isArray(cs) && cs.length > 0) {
          setCourses(cs)
        }
      } catch (e) {
        // keep mocks on error
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const courseId = classes.length > 0 ? classes[0].courseId : courses[0]?.id
    ;(async () => {
      try {
        if (courses.length > 0) {
          // fetch classes for first course by default
          const cid = courses[0].id
          const cls = await fetchClassesByCourse(cid)
          if (!mounted) return
          if (Array.isArray(cls) && cls.length > 0) setClasses(cls)
        }
      } catch (e) {
        // ignore and keep mocks
      }
    })()
    return () => { mounted = false }
  }, [courses.length])

  // when classes are loaded, ensure form.classId is set
  useEffect(() => {
    if ((form.classId === null || form.classId === undefined) && classes.length > 0) {
      setForm((f) => ({ ...f, classId: classes[0].id }))
    }
  }, [classes.length])

  // create class inline
  const [newClassTitle, setNewClassTitle] = useState('')
  const createNewClass = async (courseId: number) => {
    if (!newClassTitle.trim()) return
    try {
      const payload = { courseId, title: newClassTitle }
      const res = await createClass(payload)
      // assume res is the created class
      if (res && res.id) {
        setClasses((c) => [res, ...c])
        setForm((f) => ({ ...f, classId: res.id }))
        setNewClassTitle('')
        return
      }
    } catch (e) {
      // fall back to local mock creation
    }

    const nextId = Math.max(0, ...classes.map((c) => c.id)) + 1
    const mock = { id: nextId, courseId, title: newClassTitle }
    setClasses((c) => [mock, ...c])
    setForm((f) => ({ ...f, classId: mock.id }))
    setNewClassTitle('')
  }

  const createSlot = () => {
    if (!form.classId) return
    const nextId = Math.max(0, ...slots.map((s) => s.id)) + 1
    // combine date + time into ISO string in local timezone
    const combined = new Date(`${form.date}T${form.time}`)
    const newSlot: Slot = {
      id: nextId,
      classId: form.classId,
      startTime: combined.toISOString(),
      modality: form.modality,
      minStudents: form.minStudents,
      maxStudents: form.maxStudents,
      durationMinutes: form.durationMinutes,
    }
    setSlots((s) => [newSlot, ...s])
  }

  const deleteSlot = (id: number) => {
    setSlots((s) => s.filter((sl) => sl.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profesor - Gestión de slots (mock)</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card bg-base-200 p-4">
          <h2 className="font-semibold">Crear nuevo slot</h2>
          <div className="space-y-2 mt-3">
            <label className="block text-sm">Clase</label>
            <select className="select w-full" value={form.classId ?? ''} onChange={(e) => setForm({ ...form, classId: Number(e.target.value) })}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {courses.find((co) => co.id === c.courseId)?.title || mockCourses.find((co) => co.id === c.courseId)?.title} — {c.title}
                </option>
              ))}
            </select>

            <div className="mt-2">
              <label className="block text-sm">Crear nueva clase</label>
              <div className="flex gap-2 mt-1">
                <input type="text" className="input flex-1" placeholder="Título de la nueva clase" value={newClassTitle} onChange={(e) => setNewClassTitle(e.target.value)} />
                <button className="btn btn-secondary" onClick={() => {
                  const selectedClass = classes.find((cc) => cc.id === form.classId)
                  const courseId = selectedClass ? selectedClass.courseId : (courses[0]?.id ?? mockCourses[0].id)
                  createNewClass(courseId)
                }}>Crear</button>
              </div>
            </div>

            <label className="block text-sm">Fecha</label>
            <input type="date" className="input w-full" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <label className="block text-sm">Hora</label>
            <input type="time" className="input w-full" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />

            <label className="block text-sm">Modalidad</label>
            <select className="select w-full" value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>
              <option>Presencial</option>
              <option>Online</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Min estudiantes</label>
                <input type="number" className="input w-full" value={form.minStudents} onChange={(e) => setForm({ ...form, minStudents: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm">Max estudiantes</label>
                <input type="number" className="input w-full" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })} />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm">Duración</label>
              <select className="select w-48" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}>
                {[20,40,60,80,100,120,140,160,180].map((m) => (
                  <option key={m} value={m}>{m} minutos</option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <button className="btn btn-primary" onClick={createSlot}>
                Crear slot (mock)
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 p-4">
          <h2 className="font-semibold">Slots existentes</h2>
          <div className="mt-3 space-y-2">
            {slots.length === 0 && <div className="text-sm text-muted-foreground">No hay slots creados.</div>}
            {slots.map((s) => {
              const cls = mockClasses.find((c) => c.id === s.classId)
              const course = mockCourses.find((co) => co.id === cls?.courseId)
              return (
                <div key={s.id} className="flex items-center justify-between rounded bg-white p-3">
                  <div>
                    <div className="font-medium">{course?.title} — {cls?.title}</div>
                    <div className="text-sm text-muted-foreground">{new Date(s.startTime).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{s.modality} · {s.minStudents}–{s.maxStudents} students · {s.durationMinutes ?? '-'} min</div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-error" onClick={() => deleteSlot(s.id)}>Eliminar</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
