"use client"

import React, { useEffect, useState } from 'react'
import { reserveSlot, fetchUpcomingSlots } from '../../client/slots'

type Slot = any

export default function UpcomingClasses() {
  const [courses, setCourses] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reserving, setReserving] = useState<number | null>(null)
  const [requestLogs, setRequestLogs] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined
        setRequestLogs((l) => [`GET /upcoming — start ${new Date().toLocaleTimeString()}`, ...l].slice(0, 10))
        const t0 = Date.now()
        const slots = await fetchUpcomingSlots(14, token)
        setRequestLogs((l) => [`GET /upcoming — done ${new Date().toLocaleTimeString()} (${Date.now() - t0}ms)`, ...l].slice(0, 10))
        if (!mounted) return
        // slots is expected to be an array with the endpoint shape
        const mapped = (Array.isArray(slots) ? slots : []).map((s: any) => ({
          slot: { ...s },
          courseId: s.courseId,
          courseTitle: s.courseTitle,
          classId: s.classId,
          classTitle: s.classTitle,
          startTime: new Date(s.startTime).getTime(),
          reservedCount: s.reservedCount ?? 0,
          isReservedByMe: !!s.isReservedByMe,
          available: s.available ?? true,
        }))
        setSessions(mapped)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load upcoming classes')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const onReserve = async (slotId: number) => {
    setReserving(slotId)
    try {
      setRequestLogs((l) => [`POST /slots/${slotId}/reserve — start ${new Date().toLocaleTimeString()}`, ...l].slice(0, 10))
      const t0 = Date.now()
      await reserveSlot(slotId)
      setRequestLogs((l) => [`POST /slots/${slotId}/reserve — done ${new Date().toLocaleTimeString()} (${Date.now() - t0}ms)`, ...l].slice(0, 10))
      // optimistic feedback — could refresh data or show toast
      alert('Reserved successfully')
    } catch (err: any) {
      setRequestLogs((l) => [`POST /slots/${slotId}/reserve — error ${new Date().toLocaleTimeString()} ${err?.message ?? ''}`, ...l].slice(0, 10))
      alert(err?.message ?? 'Failed to reserve')
    } finally {
      setReserving(null)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading upcoming classes...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="card bg-card border border-border shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Upcoming sessions</h3>
          <p className="text-sm text-muted-foreground">Reserve a slot for any upcoming session below</p>
          <div className="mt-4 space-y-3">
            {sessions.length === 0 && <div className="text-sm text-muted-foreground">No upcoming sessions.</div>}
            {sessions.map((s, idx) => (
              <div key={`${s.courseId}-${s.classId}-${s.slot.id}-${idx}`} className="flex items-center justify-between bg-secondary p-3 rounded">
                <div>
                  <div className="font-medium">{s.courseTitle} — {s.classTitle}</div>
                  <div className="text-sm text-muted-foreground">{new Date(s.slot.startTime).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{s.slot.modality} · {s.slot.minStudents ?? 0}–{s.slot.maxStudents ?? '∞'} students</div>
                  <div className="text-xs text-muted-foreground">Reserved: {s.reservedCount} · Available: {s.available ? 'Yes' : 'No'} · {s.isReservedByMe ? 'You reserved' : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => window.location.href = `/dashboard/course-content/${s.courseId}`}>
                    View course
                  </button>
                  <button className="btn btn-sm btn-accent" disabled={reserving === s.slot.id} onClick={() => onReserve(s.slot.id)}>
                    {reserving === s.slot.id ? 'Reserving...' : 'Reserve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card bg-card border border-border shadow-lg">
        <div className="card-body">
          <h4 className="font-medium">Request logs (dev)</h4>
          <div className="text-xs text-muted-foreground">
            {requestLogs.length === 0 ? 'No requests yet' : null}
            <ul className="list-disc list-inside">
              {requestLogs.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground">{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
