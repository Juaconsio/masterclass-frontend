import { useForm } from 'react-hook-form';
import { createSlot } from '@client/slots';
import type { IEvent } from '@interfaces/events/IEvent';

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: Partial<IEvent> = {
  classId: 0,
  professorId: 0,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  modality: 'ONLINE',
  status: 'CANDIDATE',
  minStudents: undefined,
  maxStudents: 1,
  reservations: [],
};

export default function NewEventModal({ open, onClose }: NewEventModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IEvent>({
    defaultValues: defaultValues as IEvent,
  });

  if (!open) return null;

  async function handleCreate(data: IEvent) {
    try {
      // Llamada al backend para crear el evento
      const res = await createSlot(data);
      reset();
      onClose();
    } catch (err) {
      console.error('Error creando evento', err);
      // Puedes mostrar un mensaje de error aquí
    }
  }

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 text-lg font-bold">Crear Nuevo Evento</h3>
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-2">
          <input
            type="number"
            {...register('classId', { required: true })}
            placeholder="ID Clase"
            className="input input-bordered w-full"
          />
          <input
            type="number"
            {...register('professorId', { required: true })}
            placeholder="ID Profesor"
            className="input input-bordered w-full"
          />
          <input
            type="datetime-local"
            {...register('startTime', { required: true })}
            className="input input-bordered w-full"
          />
          <input
            type="datetime-local"
            {...register('endTime', { required: true })}
            className="input input-bordered w-full"
          />
          <select
            {...register('modality', { required: true })}
            className="select select-bordered w-full"
          >
            <option value="ONLINE">Online</option>
            <option value="PRESENTIAL">Presencial</option>
            <option value="HYBRID">Híbrido</option>
          </select>
          <select
            {...register('status', { required: true })}
            className="select select-bordered w-full"
          >
            <option value="CANDIDATE">Candidato</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <input
            type="number"
            {...register('minStudents')}
            placeholder="Mínimo de estudiantes"
            className="input input-bordered w-full"
          />
          <input
            type="number"
            {...register('maxStudents', { required: true })}
            placeholder="Máximo de estudiantes"
            className="input input-bordered w-full"
          />
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Crear
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
