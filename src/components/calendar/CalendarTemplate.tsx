import { useEffect, useState } from "react";
import { startOfWeek, addDays, format, getDay, isToday, addWeeks, subWeeks } from "date-fns";

import Toolbar from "./Toolbar";
import CalendarGrid from "./CalendarGrid";
import EventDetailsModal from "./EventDetailsModal";
import NewEventModal from "./NewEventModal";
import type { IEvent } from "@interfaces/IEvent";

const initialEvents: IEvent[] = [
  {
    id: "1",
    title: "Reunión de Equipo",
    start: new Date(2025, 7, 30, 9, 0), // 30 ago 2025 09:00
    end: new Date(2025, 7, 30, 12, 0),
    location: "Sala de Conferencias A",
    participants: ["Ana García", "Carlos López", "María Rodríguez"],
    description:
      "Revisión semanal del progreso del proyecto y planificación de tareas.",
    color: "bg-primary",
    slotUsed: 3,
  },
  {
    id: "2",
    title: "Presentación Cliente",
    start: new Date(2025, 7, 29, 10, 0), // 29 ago 2025 10:00
    end: new Date(2025, 7, 29, 11, 30), // 29 ago 2025 11:30
    location: "Oficina Principal",
    participants: ["Juan Pérez", "Laura Martín"],
    description: "Presentación de la propuesta final al cliente ABC Corp.",
    color: "bg-accent",
    slotUsed: 2,
  },
  {
    id: "3",
    title: "Workshop Diseño",
    start: new Date(2025, 7, 29, 13, 0),
    end: new Date(2025, 7, 29, 14, 0),
    location: "Sala Creativa",
    participants: [
      "Pedro Sánchez",
      "Elena Torres",
      "Miguel Ruiz",
      "Sofia Vega",
    ],
    description: "Sesión colaborativa para definir la nueva identidad visual.",
    color: "bg-secondary",
    slotUsed: 3,
  },
];


export default function CalendarTemplate() {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [events, setEvents] = useState<IEvent[]>(initialEvents);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

const today = new Date()

const [currentWeek, setCurrentWeek] = useState(
  startOfWeek(today, { weekStartsOn: 1 })
)

  useEffect(() => {
    console.log(events);
  }, [events]);


function goPrevWeek() {
  setCurrentWeek(subWeeks(currentWeek, 1))
}

function goNextWeek() {
  setCurrentWeek(addWeeks(currentWeek, 1))
}

function goToday() {
  setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))
}
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Toolbar
      currentWeek={currentWeek}
        onPrev={goPrevWeek}
        onNext={goNextWeek}
        onToday={goToday}
        openCreateEventModal={() => setShowNewEventModal(true)}
      />
      <CalendarGrid currentWeek={currentWeek} events={events} onEventClick={setSelectedEvent} />
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <NewEventModal
        open={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onCreate={(newEvent) =>
          setEvents([...events, { ...newEvent, slotUsed: 1 }])
        }
      />
    </div>
  );
}
