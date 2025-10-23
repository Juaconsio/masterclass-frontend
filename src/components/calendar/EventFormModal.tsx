import type { IEvent, EventFormValues, FormValues } from '@interfaces/events/IEvent';
import EventForm from './EventForm';
import { createSlot } from '@client/slots';

interface NewEventModalProps {
  open: boolean;
  onClose: (res?: IEvent) => void;
}

export default function NewEventModal({ open, onClose }: NewEventModalProps) {
  if (!open) return null;

  async function handleCreate(data: EventFormValues) {
    try {
      const startTime = data.start ? new Date(data.start).toISOString() : '';
      const endTime = data.end ? new Date(data.end).toISOString() : '';
      const payload = {
        classId: data.classId,
        professorId: data.professorId,
        startTime,
        endTime,
        modality: data.modality,
        studentsGroup: data.studentsGroup,
        status: data.status,
        minStudents: Number(data.minStudents) || 1,
        maxStudents: Number(data.maxStudents) || 1,
      };
      const res = await createSlot(payload);
      onClose(res);
    } catch (error: any) {
      console.log(error.messages);
    }
  }

  if (!open) return null;

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="mb-4 text-lg font-bold">Crear Nuevo Evento</h3>
        <EventForm submitLabel="Crear" onSubmit={handleCreate} onCancel={onClose} />
      </div>
    </dialog>
  );
}
