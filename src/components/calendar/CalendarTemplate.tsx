import { useEffect, useState } from 'react';
import { startOfWeek, addDays, format, getDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { fetchSlots } from '@client/slots';
import Toolbar from './Toolbar';
import CalendarGrid from './CalendarGrid';
import EventDetailsModal from './EventDetailsModal';
import NewEventModal from './EventFormModal';
import type { IEvent } from '@interfaces/events/IEvent';
import { useSessionContext } from '../../context/SessionContext';

export default function CalendarTemplate() {
  const { user, isAuthenticated } = useSessionContext();

  useEffect(() => {
    if (!isAuthenticated) {
      // window.location.href = '/ingresar';
      console.log('No auth en context');
    }
  }, [isAuthenticated]);

  console.log('User from context:', user);

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  const today = new Date();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(today, { weekStartsOn: 1 }));

  useEffect(() => {
    console.log(events);
  }, [events]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchSlots();
        setEvents(res);
      } catch (err) {
        console.error('Error fetching bookings', err);
      }
    };

    fetchData();
  }, []);

  function goPrevWeek() {
    setCurrentWeek(subWeeks(currentWeek, 1));
  }

  function goNextWeek() {
    setCurrentWeek(addWeeks(currentWeek, 1));
  }

  function goToday() {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }

  function deleteEvent(id: number) {
    setEvents(events.filter((event) => event.id !== id));
    setSelectedEvent(null);
  }

  function editEvent(updatedEvent: IEvent) {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEvent(null);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
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
          onDelete={deleteEvent}
          onEdit={editEvent}
        />

        <NewEventModal open={showNewEventModal} onClose={() => setShowNewEventModal(false)} />
      </div>
    </>
  );
}
