import { Calendar, Clock, MapPin, Users } from "lucide-react";
import type { IEvent } from "@interfaces/IEvent";

interface EventDetailsModalProps {
  event: IEvent | null;
  onClose: () => void;
}

export default function EventDetailsModal({
  event,
  onClose,
}: EventDetailsModalProps) {
  if (!event) return null;
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
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}
