import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import type { IEvent } from "@interfaces/IEvent";
import EventForm from "./EventForm";
import type { EventFormValues } from "./EventForm";


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
      participants: event.participants.join(", "),
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
          participants: data.participants
            ? data.participants.split(",").map((p) => p.trim())
            : [],
          description: data.description,
          color: data.color,
        });
      }
      setIsEditing(false);
    }
    return (
      <dialog open className="modal modal-open in-line">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4">Editar Evento</h3>
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
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${event.color}`} />
          {event.title}
        </h3>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>{event.start.toLocaleDateString("es-ES")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 opacity-70" />
            <span>
              {event.start.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {event.end.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 opacity-70" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Users className="h-4 w-4 opacity-70 mt-0.5" />
            <div>
              <div className="font-medium mb-1">Participantes:</div>
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
            <div className="font-medium mb-2">Descripción:</div>
            <p className="opacity-80 leading-relaxed">{event.description}</p>
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
            <button
              className="btn btn-error"
              onClick={() => onDelete(event.id)}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
