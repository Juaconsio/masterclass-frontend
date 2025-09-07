import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import type { IEvent } from '@interfaces/IEvent';
import EventForm from './EventForm';
import type { EventFormValues } from './EventForm';

interface EventDetailsModalProps {
  event: IEvent | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
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
    const initialValues: EventFormValues = {
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.location,
      participants: event.participants.join(', '),
      description: event.description,
      color: event.color,
    };
    function handleEdit(data: EventFormValues) {
      if (onEdit && event) {
        onEdit({
          id: event.id,
          slotUsed: event.slotUsed ?? 1,
          title: data.title,
          start: new Date(data.start),
          end: new Date(data.end),
          location: data.location,
          participants: data.participants ? data.participants.split(',').map((p) => p.trim()) : [],
          description: data.description,
          color: data.color,
        });
      }
      setIsEditing(false);
    }
    return (
      <dialog open className="modal modal-open in-line">
        <div className="modal-box max-w-md">
          <h3 className="mb-4 text-lg font-bold">Editar Evento</h3>
          <EventForm
            initialValues={initialValues}
            submitLabel="Guardar"
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </dialog>
    );
  }
  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <div className={`h-4 w-4 rounded ${event.color}`} />
          {event.title}
        </h3>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>{event.start.toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 opacity-70" />
            <span>
              {event.start.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' - '}
              {event.end.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 opacity-70" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Users className="mt-0.5 h-4 w-4 opacity-70" />
            <div>
              <div className="mb-1 font-medium">Participantes:</div>
              <ul className="space-y-1">
                {event.participants.map((p, idx) => (
                  <li key={idx} className="opacity-80">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-sm">
            <div className="mb-2 font-medium">Descripción:</div>
            <p className="leading-relaxed opacity-80">{event.description}</p>
          </div>
        </div>
        <div className="modal-action flex gap-2">
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
