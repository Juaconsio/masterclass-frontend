import { useForm, Controller } from 'react-hook-form';
import type { IEvent, EventFormValues, FormValues } from '@interfaces/events/IEvent';
import EventForm from './EventForm';
import { createSlot } from '@client/slots';

// Actualizamos el tipo para que incluya los campos de IEvent

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewEventModal({ open, onClose }: NewEventModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      classId: '0',
      professorId: '0',
      start: new Date(),
      end: new Date(),
      modality: 'ONLINE',
      status: 'CANDIDATE',
      minStudents: undefined,
      maxStudents: 1,
    },
  });

  if (!open) return null;

  async function handleCreate(data: EventFormValues) {
    try {
      const startTime = data.start ? new Date(data.start).toISOString() : '';
      const endTime = data.end ? new Date(data.end).toISOString() : '';
      const payload = {
        classId: parseInt(data.classId),
        professorId: parseInt(data.professorId),
        startTime,
        endTime,
        modality: data.modality,
        status: data.status,
        minStudents: data.minStudents || 1,
        maxStudents: data.maxStudents,
      };
      const res = await createSlot(payload);
      console.log(res);
      onClose();
    } catch (error: any) {
      console.log(error.messages);
    }
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
