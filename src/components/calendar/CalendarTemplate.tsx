import { useEffect, useState } from 'react';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fetchSlots, createSlot, updateSlot, deleteSlot } from '@client/slots';
import Toolbar from './Toolbar';
import CalendarGrid from './CalendarGrid';
import EventDetailsModal from './EventDetailsModal';
import NewEventModal from './NewEventModal';
import type { EventCreatePayload, IEvent } from '@interfaces/events/IEvent';
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

  async function handleEdit(id: number, payload: Partial<IEvent>) {
    const updatedEvent = await updateSlot(id, payload);
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEvent(updatedEvent);
  }

  async function handleCreate(newEventPayload?: EventCreatePayload) {
    const createdEvent = await createSlot(newEventPayload);
    setShowNewEventModal(false);
    if (createdEvent) {
      setEvents([...events, createdEvent]);
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
          handleEdit={handleEdit}
        />

        <NewEventModal
          open={showNewEventModal}
          handleCreate={handleCreate}
          onClose={() => setShowNewEventModal(false)}
        />
      </div>
    </>
  );
}
