import { useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import type { EventFormValues } from '@interfaces/events/IEvent';
import EventFormDrawer, { type EventFormDrawerRef } from './EventFormDrawer';

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
  const drawerRef = useRef<EventFormDrawerRef>(null);

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

    if (form.modality !== original.modality) payload.modality = form.modality;
    if (form.status !== original.status) payload.status = form.status;

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
      throw new Error('No hay cambios para actualizar.');
    }
    await handleEdit(event.id, payload);
  }

  if (!event) return null;

  const STATUS_CLASS: Record<string, { bg: string; icon: typeof CircleDashed; label: string }> = {
    candidate: { bg: 'bg-yellow-500', icon: CircleDashed, label: 'Candidato' },
    confirmed: { bg: 'bg-green-500', icon: CircleCheck, label: 'Confirmado' },
    cancelled: { bg: 'bg-red-500', icon: Ban, label: 'Cancelado' },
    completed: { bg: 'bg-gray-500', icon: CheckCheck, label: 'Completado' },
  };

  const MODALITY_CONFIG: Record<string, { icon: typeof Monitor; label: string }> = {
    remote: { icon: Monitor, label: 'Online' },
    onsite: { icon: MapPin, label: 'Presencial' },
  };

  const STUDENTS_GROUP_CONFIG: Record<string, { icon: typeof Users; label: string }> = {
    group: { icon: Users, label: 'Grupal' },
    private: { icon: User, label: 'Particular' },
  };

  const statusData = STATUS_CLASS[String(event.status).toLowerCase()] || STATUS_CLASS['candidate'];
  const statusLabel = statusData.label;
  const statusBg = statusData.bg;
  const StatusIcon = statusData.icon;

  const modalityData = MODALITY_CONFIG[String(event.modality).toLowerCase()] || {
    icon: Monitor,
    label: String(event.modality),
  };
  const ModalityIcon = modalityData.icon;
  const modalityLabel = modalityData.label;

  const groupData =
    STUDENTS_GROUP_CONFIG[String(event.studentsGroup).toLowerCase()] ||
    STUDENTS_GROUP_CONFIG['private'];
  const GroupIcon = groupData.icon;
  const groupLabel = groupData.label;
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const locationLabel = (() => {
    if (!event.location) return modalityLabel === 'Online' ? 'Online' : '-';
    return event.location.toLowerCase() === 'online' ? 'Online' : event.location;
  })();
  return (
    <>
      <dialog open className="modal modal-open in-line z-30">
        <div className="modal-box w-11/12 max-w-3xl">
          <div className="flex gap-4">
            <div className={clsx('w-2 flex-shrink-0 rounded', statusBg)} />
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-2">
                {/* Header row: title + status */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg leading-snug font-bold text-gray-900">
                    {event.class?.title || `Clase ${event.classId}`}
                  </h3>
                  <div className={clsx('badge badge-lg gap-1 text-sm text-white', statusBg)}>
                    <StatusIcon className="h-4 w-4" />
                    {statusLabel}
                  </div>
                </div>

                {/* Badge group */}
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-outline gap-1">
                    {event.professor?.name || `Profesor ${event.professorId}`}
                  </div>
                  {event.class?.course?.acronym && (
                    <div className="badge badge-outline gap-1">{event.class.course.acronym}</div>
                  )}
                  <div className="badge badge-accent gap-1">
                    <GroupIcon className="h-4 w-4" />
                    <span>{groupLabel}</span>
                  </div>
                  <div className="badge badge-accent gap-1">
                    <ModalityIcon className="h-4 w-4" />
                    <span>{modalityLabel}</span>
                  </div>
                </div>

                {/* Date / time / location grid */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 md:grid-cols-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">Día</span>
                    <span>{format(start, 'EEEE, dd/MM/yyyy', { locale: es })}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Inicio</span>
                    <span>{format(start, 'HH:mm')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Fin</span>
                    <span>{format(end, 'HH:mm')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Ubicación</span>
                    <span>{locationLabel}</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="bg-base-200/40 grid grid-cols-3 gap-4 rounded-md p-4 text-center text-sm md:text-base">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Min. estudiantes
                    </span>
                    <span className="font-semibold">{event.minStudents ?? '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Max. estudiantes
                    </span>
                    <span className="font-semibold">{event.maxStudents}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Reservas
                    </span>
                    <span className="font-semibold">{event.reservations?.length ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-base-100/60 sticky bottom-0 left-0 mt-1 w-full py-2 backdrop-blur-sm">
                <div className="modal-action mt-0 flex flex-wrap justify-end gap-2">
                  <button className="btn" onClick={() => onClose()}>
                    Cerrar
                  </button>
                  {handleEdit && (
                    <button className="btn btn-info" onClick={() => drawerRef.current?.open()}>
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
        </div>
      </dialog>
      <EventFormDrawer
        ref={drawerRef}
        title="Editar Evento"
        submitLabel="Actualizar"
        onSubmit={handleUpdate}
        initialValues={{
          courseId: event.class?.course?.id ?? null,
          classId: event.classId,
          professorId: event.professorId,
          start: event.startTime ? new Date(event.startTime) : new Date(),
          end: event.endTime ? new Date(event.endTime) : new Date(),
          modality: event.modality,
          studentsGroup: event.studentsGroup,
          status: event.status,
          location: event.location,
          minStudents: event.minStudents === null ? undefined : event.minStudents,
          maxStudents: event.maxStudents,
        }}
      />
    </>
  );
}
