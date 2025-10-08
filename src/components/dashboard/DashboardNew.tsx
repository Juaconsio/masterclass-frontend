"use client"

import React, { useEffect, useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { CoursesSection } from './course-section'
import { ReservationsCalendar } from './reservations-calendar'
import { httpClient } from '@/client/config'
import { fetchSlots } from '@/client/slots'

type Course = any
type Reservation = any
type Slot = any
type ClassItem = any

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadAll() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        // courses
        const coursesRes = await httpClient.get('/courses', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        const coursesData = coursesRes.data || []

        // reservations
        const reservationsRes = await httpClient.get('/reservations', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        const reservationsData = reservationsRes.data || []

        // classes / sessions
        let classesData: any[] = []
        try {
          const classesRes = await httpClient.get('/courses/sessions', {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          })
          classesData = classesRes.data || []
        } catch (e) {
          // endpoint optional
          classesData = []
        }

        // slots
        let slotsData: any[] = []
        try {
          slotsData = await fetchSlots()
        } catch (e) {
          slotsData = []
        }

        if (!mounted) return
        setCourses(coursesData)
        setReservations(reservationsData)
        setClasses(classesData)
        setSlots(slotsData)
        // debug: help verify API data flow in the browser console
        try {
          // eslint-disable-next-line no-console
          console.debug('Dashboard loaded', {
            courses: (coursesData || []).length,
            reservations: (reservationsData || []).length,
            slots: (slotsData || []).length,
            classes: (classesData || []).length,
          })
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Error loading dashboard data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAll()
    return () => {
      mounted = false
    }
  }, [])

  // transform reservations into date-keyed map for the calendar component
  const reservationsByDate: Record<string, any[]> = {}
  for (const r of reservations) {
    const slot = slots.find((s) => s.id === r.slotId)
    const start = slot?.startTime ? new Date(slot.startTime) : null
    const dateKey = start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
          start.getDate(),
        ).padStart(2, '0')}`
      : null
    if (dateKey) {
      reservationsByDate[dateKey] = reservationsByDate[dateKey] || []
      reservationsByDate[dateKey].push({ ...r, slot })
    }
  }

  async function removeReservation(reservationId: number) {
    const token = localStorage.getItem('token')
    // optimistically remove
    setReservations((prev) => prev.filter((r) => r.id !== reservationId))
    try {
      await httpClient.delete(`/reservations/${reservationId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
    } catch (err) {
      console.error('Failed to delete reservation', err)
      // revert: refetch minimal data or reload
      try {
        const reservationsRes = await httpClient.get('/reservations', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        setReservations(reservationsRes.data || [])
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <CoursesSection courses={courses} loading={loading} />
        <ReservationsCalendar
          reservationsByDate={reservationsByDate}
          slots={slots}
          classes={classes}
          courses={courses}
          onDeleteReservation={removeReservation}
        />
      </main>
    </div>
  )
}
