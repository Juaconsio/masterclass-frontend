"use client"

import { useState } from "react"
import { Card } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Badge } from "@components/ui/badge"

// No mock reservation data — use only the provided reservationsByDate prop

type ReservationsCalendarProps = {
  reservationsByDate?: Record<string, any[]>
  slots?: any[]
  classes?: any[]
  courses?: any[]
  onDeleteReservation?: (id: number) => void | Promise<void>
}

export function ReservationsCalendar({
  reservationsByDate: propReservationsByDate,
  slots: propSlots,
  classes: propClasses,
  courses: propCourses,
  onDeleteReservation,
}: ReservationsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    // start at the first day of the current month
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const resForDay = reservationsMap[dateStr]
    console.debug('[Calendar] clicked date', dateStr, { found: !!resForDay, resForDay })
    if (resForDay && resForDay.length) {
      setSelectedDate(dateStr)
      setIsDialogOpen(true)
    } else {
      // still set selected date so dialog can show a friendly message
      setSelectedDate(dateStr)
      setIsDialogOpen(true)
    }
  }

  const reservationsMap: Record<string, any[]> = (propReservationsByDate as Record<string, any[]>) || {}

  const hasReservation = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return reservationsMap[dateStr]
  }

  const selectedReservations: any[] = selectedDate ? reservationsMap[selectedDate] || [] : []

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">My Reservations</h2>
        <p className="text-muted-foreground">View and manage your upcoming course sessions</p>
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const reservation = hasReservation(day)
            const today = new Date()
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear()

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium
                  transition-all duration-200 relative
                  ${
                    reservation
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }
                  ${isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}
                `}
              >
                <span>{day}</span>
                {reservation && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {Array.from({ length: Math.min(reservation.length, 3) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary-foreground" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Has reservations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-accent ring-offset-2 ring-offset-background bg-secondary" />
            <span>Today</span>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="bg-card border-border max-h-[70vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Reservations for{" "}
              {selectedDate &&
                new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have {selectedReservations?.length || 0} session{selectedReservations?.length !== 1 ? "s" : ""}{" "}
              scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-3 max-h-[60vh] overflow-y-auto pr-2">
            {(!selectedReservations || selectedReservations.length === 0) && (
              <div className="p-4 text-muted-foreground">No reservations found for this day.</div>
            )}

            {selectedReservations?.map((reservation: any) => {
              // reservation may be the API reservation augmented with `slot` in DashboardNew
              const slot = reservation.slot || propSlots?.find((s: any) => s.id === reservation.slotId)

              const course =
                propCourses?.find((c: any) => c.id === slot?.classId || c.id === slot?.courseId) ||
                propCourses?.find((c: any) => c.id === reservation.courseId) ||
                null

              const classData = propClasses?.find((cl: any) => cl.id === slot?.classId) || null

              const courseTitle = course?.title || reservation.course || 'Untitled course'
              const classTitle = classData?.title || reservation.classTitle || ''
              const instructor = reservation.instructor || classData?.instructor || course?.instructor || 'TBA'

              // Time rendering
              let timeLabel = reservation.time || ''
              if (slot?.startTime) {
                try {
                  const start = new Date(slot.startTime)
                  const end = slot.endTime ? new Date(slot.endTime) : null
                  timeLabel = `${start.toLocaleDateString()} ${start.toLocaleTimeString()}${end ? ' - ' + end.toLocaleTimeString() : ''}`
                } catch (e) {
                  // keep reservation.time
                }
              }

              const modality = slot?.modality || reservation.modality || reservation.type || '—'
              const status = slot?.status || reservation.status || 'scheduled'

              return (
                <Card key={reservation.id} className="p-3 border-border bg-secondary/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-0.5">{courseTitle}</h4>
                      {classTitle && <div className="text-xs text-muted-foreground">Class: {classTitle}</div>}
                      <p className="text-xs text-muted-foreground">Instructor: {instructor}</p>
                    </div>
                    <Badge variant="outline" className="bg-background/50 text-xs px-2 py-0.5">
                      {modality}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeLabel}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Status: {status}</div>
                  <div className="mt-2 flex gap-1">
                    {classData && (
                      <a
                        href={`/dashboard/session/${classData.id}`}
                        className="rounded bg-primary px-2 py-0.5 text-white text-xs hover:bg-primary/90"
                      >
                        Go to class
                      </a>
                    )}
                    <button
                      className="rounded bg-red-600 px-2 py-0.5 text-white text-xs hover:bg-red-700"
                      onClick={() => onDeleteReservation?.(reservation.id)}
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
