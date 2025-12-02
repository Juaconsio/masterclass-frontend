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
import { useConfirmAction } from '@/hooks';

export default function CalendarTemplate() {
  const { user } = useSessionContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!['admin', 'teacher'].includes(user?.role || '')) {
      navigate('/app');
    }
  }, [user]);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
        setRequestError(
          'Error fetching bookings' + (err instanceof Error ? `: ${err.message}` : '')
        );
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

  function openCreateEventModal(date: Date) {
    setSelectedDate(date);
    setShowNewEventModal(true);
  }

  async function handleDelete(id: number) {
    showConfirmation({
      title: 'Eliminar slot',
      message: 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este slot?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        await deleteSlot(id);
        setEvents(events.filter((event) => event.id !== id));
        setShowEventDetailsModal(false);
      },
    });
  }

  function handleClickOnEventSlot(event: IEvent) {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  }

  return (
    <>
      <div className="mx-auto w-full space-y-6">
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
          openCreateEventModal={() => openCreateEventModal(new Date())}
        />
        <CalendarGrid
          currentWeek={currentWeek}
          events={events}
          loading={loading}
          onEventClick={handleClickOnEventSlot}
          openCreateEventModal={(initialDate) => openCreateEventModal(initialDate ?? new Date())}
        />
        <EventDetailsModal
          event={selectedEvent}
          open={showEventDetailsModal}
          onClose={() => setShowEventDetailsModal(false)}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        <NewEventModal
          open={showNewEventModal}
          handleCreate={handleCreate}
          onClose={() => setShowNewEventModal(false)}
          initialDate={selectedDate ?? null}
        />
      </div>

      <ConfirmationModal />
    </>
  );
}
