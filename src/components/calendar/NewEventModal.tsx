import { useState, useEffect } from 'react';
import type { IEvent, EventFormValues, EventCreatePayload } from '@interfaces/events/IEvent';
import EventForm from './EventForm';

interface NewEventModalProps {
  open: boolean;
  onClose: (res?: IEvent) => void;
  handleCreate: (data: EventCreatePayload) => Promise<void>;
  initialDate?: Date | null;
}

export default function NewEventModal({
  open,
  onClose,
  handleCreate,
  initialDate,
}: NewEventModalProps) {
  if (!open) return null;

  async function submit(data: EventFormValues) {
    const startTime = data.start ? new Date(data.start).toISOString() : '';
    const endTime = data.end ? new Date(data.end).toISOString() : '';
    const payload: EventCreatePayload = {
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
    await handleCreate(payload);
  }

  const initialValues: Partial<EventFormValues> = {
    start: initialDate || undefined,
  };

  if (!open) return null;

  return (
    <dialog open className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-3xl sm:w-11/12 max-h-[90dvh] overflow-hidden">
        <h3 className="mb-4 text-lg font-bold">Crear nuevo horario de clases</h3>
        <div className="max-h-[75dvh] overflow-y-auto pr-1">
          <EventForm
            submitLabel="Crear"
            onSubmit={submit}
            onCancel={onClose}
            initialValues={initialValues}
            mode="create"
          />
        </div>
      </div>
    </dialog>
  );
}
