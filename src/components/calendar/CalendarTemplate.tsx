import { useEffect, useState } from 'react';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fetchSlots } from '@client/slots';
import Toolbar from './Toolbar';
import CalendarGrid from './CalendarGrid';
import EventDetailsModal from './EventDetailsModal';
import NewEventModal from './EventFormModal';
import type { IEvent } from '@interfaces/events/IEvent';
import { useSessionContext } from '../../context/SessionContext';
import { useNavigate } from 'react-router';

export default function CalendarTemplate() {
  const { user } = useSessionContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!['admin', 'teacher'].includes(user?.role || '')) {
      // navigate('/app');
    }
  }, [user]);

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const today = new Date();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(today, { weekStartsOn: 1 }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetchSlots();
        setEvents(res);
      } catch (err) {
        console.error('Error fetching bookings', err);
        setRequestError('Error fetching bookings');
      } finally {
        setLoading(false);
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

  function handleUpdateEvents(newEvent?: IEvent) {
    setShowNewEventModal(false);
    // Actualiza bien pero no actualiza el slots
    if (newEvent) {
      setEvents([...events, newEvent]);
    }
  }

  function handleClickOnEventSlot(event: IEvent) {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        {requestError && (
          <div className="w-full rounded-md bg-red-200 p-4 text-xl text-red-500">
            {requestError}
          </div>
        )}

        <Toolbar
          currentWeek={currentWeek}
          onPrev={goPrevWeek}
          onNext={goNextWeek}
          onToday={goToday}
          openCreateEventModal={() => setShowNewEventModal(true)}
        />
        <CalendarGrid
          currentWeek={currentWeek}
          events={events}
          loading={loading}
          onEventClick={handleClickOnEventSlot}
        />
        <EventDetailsModal
          event={selectedEvent}
          open={showEventDetailsModal}
          onClose={() => setShowEventDetailsModal(false)}
          onDelete={deleteEvent}
          onEdit={editEvent}
        />

        <NewEventModal open={showNewEventModal} onClose={handleUpdateEvents} />
      </div>
    </>
  );
}
