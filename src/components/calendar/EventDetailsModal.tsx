import { useState } from 'react';
import type { IEvent } from '@interfaces/events/IEvent';
import EventForm from './EventForm';
import type { EventFormValues } from '@interfaces/events/IEvent';
import { updateSlot } from '@client/slots';
interface EventDetailsModalProps {
  event: IEvent | null;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onEdit?: (event: IEvent) => void;
}

export default function EventDetailsModal({
  event,
  onClose,
  onDelete,
  onEdit,
}: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Helper: construye solo los campos que realmente cambiaron
  function buildSlotUpdatePayload(original: IEvent, form: EventFormValues) {
    type UpdateSlotPayload = Partial<
      Pick<
        IEvent,
        | 'classId'
        | 'professorId'
        | 'startTime'
        | 'endTime'
        | 'modality'
        | 'status'
        | 'minStudents'
        | 'maxStudents'
      >
    >;

    const payload: UpdateSlotPayload = {};

    // Normaliza fechas (ignorando diferencias de formato pero no de instante real)
    const iso = (d: Date) => d.toISOString();
    const sameInstant = (a: string, b: string) => new Date(a).getTime() === new Date(b).getTime();

    const newStartISO = iso(form.start instanceof Date ? form.start : new Date(form.start));
    if (!sameInstant(newStartISO, original.startTime)) payload.startTime = newStartISO;

    const newEndISO = iso(form.end instanceof Date ? form.end : new Date(form.end));
    if (!sameInstant(newEndISO, original.endTime)) payload.endTime = newEndISO;

    const newClassId = Number(form.classId);
    if (newClassId !== original.classId) payload.classId = newClassId;

    const newProfessorId = Number(form.professorId);
    if (newProfessorId !== original.professorId) payload.professorId = newProfessorId;

    if (form.modality !== original.modality) payload.modality = form.modality as any;
    if (form.status !== original.status) payload.status = form.status as any;

    // minStudents: permitir limpiar el valor. Si el usuario lo deja vacío, interpretamos que quiere quitarlo.
    // Asunción: para "quitar" enviamos null (ajusta si tu API espera undefined o no permitir clearing).
    const formMin = form.minStudents === undefined ? null : form.minStudents; // estandarizamos null para "sin valor"
    const originalMin = original.minStudents === undefined ? null : original.minStudents;
    if (formMin !== originalMin) payload.minStudents = formMin === null ? undefined : formMin; // decide aquí qué enviar

    if (form.maxStudents !== original.maxStudents) payload.maxStudents = form.maxStudents;

    return payload;
  }

  async function handleUpdate(data: EventFormValues) {
    try {
      if (!event) return;
      const payload = buildSlotUpdatePayload(event, data);
      if (Object.keys(payload).length === 0) {
        console.log('Sin cambios, no se envía update.');
        onClose();
        return;
      }
      console.log('Payload to update:', payload);
      const res = await updateSlot(event.id, payload);
      console.log(res);
      onClose();
    } catch (error: any) {
      console.log(error.messages);
    }
  }

  if (!event) return null;

  let content: React.ReactNode;

  if (isEditing) {
    content = (
      <EventForm
        submitLabel="Actualizar"
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        initialValues={event}
      />
    );
  } else {
    content = (
      <>
        <h3 className="mb-2 text-lg font-bold">Detalle del Evento</h3>
        <div className="space-y-2 py-2">
          <div>ID: {event.id}</div>
          <div>Clase: {event.classId}</div>
          <div>Profesor: {event.professorId}</div>
          <div>
            Inicio: {new Date(event.startTime).toLocaleDateString()}{' '}
            {new Date(event.startTime).toLocaleTimeString()}
          </div>
          <div>
            Fin: {new Date(event.endTime).toLocaleDateString()}{' '}
            {new Date(event.endTime).toLocaleTimeString()}
          </div>
          <div>Modalidad: {event.modality}</div>
          <div>Estado: {event.status}</div>
          <div>Min. estudiantes: {event.minStudents ?? '-'}</div>
          <div>Max. estudiantes: {event.maxStudents}</div>
        </div>
        <div className="modal-action mt-4 flex gap-2">
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
          {onEdit && (
            <button className="btn btn-info" onClick={() => setIsEditing(true)}>
              Editar
            </button>
          )}
          {onDelete && (
            <button className="btn btn-error" onClick={() => onDelete(event.id)}>
              Eliminar
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">{content}</div>
    </dialog>
  );
}
