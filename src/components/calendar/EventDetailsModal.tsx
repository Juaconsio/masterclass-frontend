import { useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
  Users,
  User,
  Monitor,
  MapPin,
  CircleDashed,
  CircleCheck,
  Ban,
  CheckCheck,
} from 'lucide-react';
import clsx from 'clsx';
import type { IEvent } from '@interfaces/events/IEvent';
import EventForm from './EventForm';
import type { EventFormValues } from '@interfaces/events/IEvent';
import { updateSlot, deleteSlot } from '@client/slots';

type EventUpdatePayload = Partial<
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

interface EventDetailsModalProps {
  event: IEvent | null;
  open: boolean;
  onClose: (event?: IEvent) => void;
  handleDelete?: (id: number) => void;
  handleEdit?: (id: number, payload: EventUpdatePayload) => void;
}

export default function EventDetailsModal({
  event,
  open,
  onClose,
  handleDelete,
  handleEdit,
}: EventDetailsModalProps) {
  if (!open) return null;

  const [isEditing, setIsEditing] = useState(false);

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

    const formMin = form.minStudents === undefined ? null : form.minStudents;
    const originalMin = original.minStudents === undefined ? null : original.minStudents;
    if (formMin !== originalMin) payload.minStudents = formMin === null ? undefined : formMin;

    if (form.maxStudents !== original.maxStudents) payload.maxStudents = form.maxStudents;

    return payload;
  }

  async function handleUpdate(data: EventFormValues) {
    if (!event || !handleEdit) return;
    const payload = buildSlotUpdatePayload(event, data);
    if (Object.keys(payload).length === 0) {
      console.log('Sin cambios, no se envía update.');
      throw new Error('No hay cambios para actualizar.');
    }
    await handleEdit(event.id, payload);
    setIsEditing(false);
  }

  if (!event) return null;

  const STATUS_CLASS: Record<string, { bg: string; icon: typeof CircleDashed; label: string }> = {
    CANDIDATE: { bg: 'bg-yellow-500', icon: CircleDashed, label: 'Candidato' },
    CONFIRMED: { bg: 'bg-green-500', icon: CircleCheck, label: 'Confirmado' },
    CANCELLED: { bg: 'bg-red-500', icon: Ban, label: 'Cancelado' },
    COMPLETED: { bg: 'bg-gray-500', icon: CheckCheck, label: 'Completado' },
  };

  const MODALITY_CONFIG: Record<string, { icon: typeof Monitor; label: string }> = {
    ONLINE: { icon: Monitor, label: 'Online' },
    REMOTE: { icon: Monitor, label: 'Online' },
    ONSITE: { icon: MapPin, label: 'Presencial' },
    PRESENTIAL: { icon: MapPin, label: 'Presencial' },
    HYBRID: { icon: MapPin, label: 'Híbrido' },
  };

  const STUDENTS_GROUP_CONFIG: Record<string, { icon: typeof Users; label: string }> = {
    GROUP: { icon: Users, label: 'Grupal' },
    PRIVATE: { icon: User, label: 'Individual' },
  };

  const statusData = STATUS_CLASS[String(event.status).toUpperCase()] || STATUS_CLASS['CANDIDATE'];
  const statusLabel = statusData.label;
  const statusBg = statusData.bg;
  const StatusIcon = statusData.icon;

  const modalityData =
    MODALITY_CONFIG[String(event.modality).toUpperCase()] || MODALITY_CONFIG['ONLINE'];
  const ModalityIcon = modalityData.icon;
  const modalityLabel = modalityData.label;

  const groupData =
    STUDENTS_GROUP_CONFIG[String(event.studentsGroup).toUpperCase()] ||
    STUDENTS_GROUP_CONFIG['PRIVATE'];
  const GroupIcon = groupData.icon;
  const groupLabel = groupData.label;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box w-11/12 max-w-3xl">
        {isEditing ? (
          <>
            <h2 className="text-primary mb-3 text-xl font-semibold">Editar Evento</h2>
            <EventForm
              submitLabel="Actualizar"
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              initialValues={{
                ...event,
                start: event.startTime ? new Date(event.startTime) : undefined,
                end: event.endTime ? new Date(event.endTime) : undefined,
              }}
            />
          </>
        ) : (
          <div className="flex gap-4">
            <div className={clsx('w-2 flex-shrink-0 rounded', statusBg)} />
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {event.class?.title || `Clase ${event.classId}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {event.professor?.name || `Profesor ${event.professorId}`}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <strong className="mr-1">Inicio:</strong>
                        <span>{format(start, 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <strong className="mr-1">Fin:</strong>
                        <span>{format(end, 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="badge badge-accent gap-1">
                        <GroupIcon className="h-4 w-4" />
                        <span>{groupLabel}</span>
                      </div>
                      <div className="badge badge-accent gap-1">
                        <ModalityIcon className="h-4 w-4" />
                        <span>{modalityLabel}</span>
                      </div>
                    </div>
                    <div className={clsx('badge text-sm text-white', statusBg)}>
                      <StatusIcon className="h-4 w-4" />
                      {statusLabel}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Min. estudiantes</div>
                    <div className="text-base font-medium">{event.minStudents ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Max. estudiantes</div>
                    <div className="text-base font-medium">{event.maxStudents}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Reservas</div>
                  <div className="text-base font-medium">{event.reservations?.length ?? 0}</div>
                </div>
              </div>

              <div className="bg-base-100/60 sticky bottom-0 left-0 mt-2 w-full py-2 backdrop-blur-sm">
                <div className="modal-action mt-0 flex justify-end gap-2">
                  <button className="btn" onClick={() => onClose()}>
                    Cerrar
                  </button>
                  {handleEdit && (
                    <button className="btn btn-info" onClick={() => setIsEditing(true)}>
                      Editar
                    </button>
                  )}
                  {handleDelete && (
                    <button className="btn btn-error" onClick={() => handleDelete(event.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
