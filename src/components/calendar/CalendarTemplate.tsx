import { useEffect, useState } from 'react';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { professorSlotsClient } from '@/client/professor/slots';
import { adminSlotsClient } from '@/client/admin/slots';
import Toolbar from './Toolbar';
import CalendarGrid from './CalendarGrid';
import EventDetailsModal from './EventDetailsModal';
import NewEventModal from './NewEventModal';
import type { EventCreatePayload, IEvent } from '@interfaces/events/IEvent';
import { useSessionContext } from '../../context/SessionContext';
import { useNavigate } from 'react-router';
import { useConfirmAction } from '@/hooks';
import { showToast } from '@/lib/toast';

export default function CalendarTemplate() {
  const { user } = useSessionContext();
  const navigate = useNavigate();
  const isProfessor = user?.role === 'professor';

  const slotsClient = isProfessor ? professorSlotsClient : adminSlotsClient;

  useEffect(() => {
    if (!['admin', 'professor'].includes(user?.role || '')) {
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
        const res = await slotsClient.getAll();
        setEvents(res);
      } catch (err) {
        setRequestError('Error al cargar slots' + (err instanceof Error ? `: ${err.message}` : ''));
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
    try {
      const updatedEvent = await slotsClient.update(id, payload as any);
      setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
      setSelectedEvent(updatedEvent);
      showToast.success('Slot actualizado correctamente');
    } catch (error) {
      console.error('Error updating slot:', error);
      const message =
        (error as any)?.response?.data?.message ??
        (error as any)?.response?.data?.error ??
        (error as any)?.message ??
        'Error al actualizar el slot';
      showToast.error(String(message));
      throw error;
    }
  }

  async function handleCreate(newEventPayload?: EventCreatePayload) {
    try {
      const payload: any = {
        classId: newEventPayload?.classId!,
        professorId: isProfessor ? user?.id : newEventPayload?.professorId,
        startTime: newEventPayload?.startTime!,
        endTime: newEventPayload?.endTime!,
        modality: newEventPayload?.modality === 'remote' ? 'remote' : 'onsite',
        studentsGroup: newEventPayload?.studentsGroup || null,
        location: newEventPayload?.location || null,
        maxStudents: newEventPayload?.maxStudents,
        minStudents: newEventPayload?.minStudents,
        status: newEventPayload?.status,
        link: null,
      };

      const createdEvent = await slotsClient.create(payload);
      showToast.success('Slot creado exitosamente');
      setShowNewEventModal(false);
      if (createdEvent) {
        setEvents([...events, createdEvent]);
      }
    } catch (error) {
      console.error('Error creating slot:', error);
      showToast.error('Error al crear el slot');
      throw error;
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
        try {
          await slotsClient.delete(id);
          showToast.success('Slot eliminado correctamente');
          setEvents(events.filter((event) => event.id !== id));
          setShowEventDetailsModal(false);
        } catch (error) {
          console.error('Error deleting slot:', error);
          const message =
            (error as any)?.response?.data?.message ??
            (error as any)?.response?.data?.error ??
            (error as any)?.message ??
            'Error al eliminar el slot';
          showToast.error(String(message));
        }
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
        {isProfessor && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Mis Horarios</h1>
            <p className="text-base-content/70 mt-2">Gestiona tus slots y reservas</p>
          </div>
        )}

        {requestError && (
          <div className="alert alert-error">
            <span>{requestError}</span>
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
