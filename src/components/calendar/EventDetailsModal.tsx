import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import type { IEvent } from '@interfaces/events/IEvent';
import EventForm from './EventForm';

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

  if (!event) return null;
  if (isEditing) {
    // Al modal se le agrega un padding, no se de donde pero es molesto para la UI
    return (
      <dialog open className="modal modal-open in-line p-0!">
        <div className="modal-box max-w-md">
          <h3 className="mb-4 text-lg font-bold">Editar Evento</h3>
          <div className="space-y-2">
            <div>ID: {event.id}</div>
            <div>Clase: {event.classId}</div>
            <div>Profesor: {event.professorId}</div>
            <div>Inicio: {event.startTime}</div>
            <div>Fin: {event.endTime}</div>
            <div>Modalidad: {event.modality}</div>
            <div>Estado: {event.status}</div>
            <div>Min. estudiantes: {event.minStudents ?? '-'}</div>
            <div>Max. estudiantes: {event.maxStudents}</div>
          </div>
          <div className="modal-action flex gap-2">
            <button className="btn" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={() => setIsEditing(false)}>
              Guardar (no implementado)
            </button>
          </div>
        </div>
      </dialog>
    );
  }

  // Al modal se le agrega un padding, no se de donde pero es molesto para la UI
  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
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
          {/* <div>Reservas: {event.reservations.}</div> */}
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
      </div>
    </dialog>
  );
}
