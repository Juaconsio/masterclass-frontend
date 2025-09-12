import { useForm, Controller } from 'react-hook-form';
import type { IEvent, EventFormValues, FormValues } from '@interfaces/events/IEvent';
import EventForm from './EventForm';
// Actualizamos el tipo para que incluya los campos de IEvent

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: IEvent) => void;
}

export default function NewEventModal({ open, onClose, onCreate }: NewEventModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      classId: 0,
      professorId: 0,
      start: new Date(),
      end: new Date(),
      modality: 'ONLINE',
      status: 'CANDIDATE',
      minStudents: undefined,
      maxStudents: 1,
    },
  });

  if (!open) return null;

  function handleCreate(data: EventFormValues) {
    const startTime = data.start ? new Date(data.start).toISOString() : '';
    const endTime = data.end ? new Date(data.end).toISOString() : '';
    onCreate({
      id: Date.now(),
      classId: data.classId,
      professorId: data.professorId,
      startTime,
      endTime,
      modality: data.modality,
      status: data.status,
      minStudents: data.minStudents,
      maxStudents: data.maxStudents,
      reservations: [],
    });
    onClose();
  }

  if (!open) return null;

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 text-lg font-bold">Crear Nuevo Evento</h3>
        <EventForm submitLabel="Crear" onSubmit={handleCreate} onCancel={onClose} />
      </div>
    </dialog>
  );
}
