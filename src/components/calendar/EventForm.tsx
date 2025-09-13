import { useForm, Controller } from 'react-hook-form';
import DateTimeInput from '@components/UI/DateTimeInput';
import type { IEvent, EventFormValues } from '@interfaces/events/IEvent';

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  submitLabel: string;
  onCancel: () => void;
}

export default function EventForm({
  initialValues = {},
  onSubmit,
  submitLabel,
  onCancel,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      classId: initialValues.classId?.toString() || '',
      professorId: initialValues.professorId?.toString() || '',
      start: initialValues.start || new Date(),
      end: initialValues.end || new Date(),
      modality: initialValues.modality || 'ONLINE',
      status: initialValues.status || 'CANDIDATE',
      minStudents: initialValues.minStudents || undefined,
      maxStudents: initialValues.maxStudents || 1,
    },
  });

  const submitHandler = (data: EventFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
      <label className="label">ID de clase</label>
      <input
        type="number"
        {...register('classId', { required: 'ID de clase es obligatorio' })}
        placeholder="ID de clase"
        className={`input input-bordered w-full ${errors.classId ? 'input-error' : ''}`}
      />
      {errors.classId && <p className="text-error text-sm">{errors.classId.message}</p>}

      <label className="label">ID de profesor</label>
      <input
        type="number"
        {...register('professorId', { required: 'ID de profesor es obligatorio' })}
        placeholder="ID de profesor"
        className={`input input-bordered w-full ${errors.professorId ? 'input-error' : ''}`}
      />
      {errors.professorId && <p className="text-error text-sm">{errors.professorId.message}</p>}

      <div className="flex gap-2">
        <div className="w-1/2">
          <label className="label">Fecha de inicio</label>
          <Controller
            control={control}
            name="start"
            rules={{ required: 'La fecha de inicio es obligatoria' }}
            render={({ field }) => (
              <DateTimeInput label="Inicio" value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.start && <p className="text-error text-sm">{errors.start.message}</p>}
        </div>
        <div className="w-1/2">
          <label className="label">Fecha de fin</label>
          <Controller
            control={control}
            name="end"
            rules={{ required: 'La fecha de fin es obligatoria' }}
            render={({ field }) => (
              <DateTimeInput label="Fin" value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.end && <p className="text-error text-sm">{errors.end.message}</p>}
        </div>
      </div>

      <label className="label">Modalidad</label>
      <select
        {...register('modality', { required: 'Modalidad es obligatoria' })}
        className="select select-bordered w-full"
      >
        <option value="group">Online</option>
        <option value="private">Presencial</option>
      </select>
      {errors.modality && <p className="text-error text-sm">{errors.modality.message}</p>}

      <label className="label">Estado</label>
      <select
        {...register('status', { required: 'Estado es obligatorio' })}
        className="select select-bordered w-full"
      >
        <option value="candidate">Candidato</option>
        <option value="confirmed">Confirmado</option>
        <option value="completed">Confirmado</option>
        <option value="cancelled">Cancelado</option>
      </select>
      {errors.status && <p className="text-error text-sm">{errors.status.message}</p>}

      <label className="label">Mínimo de estudiantes</label>
      <input
        type="number"
        {...register('minStudents')}
        placeholder="Mínimo de estudiantes"
        className="input input-bordered w-full"
      />

      <label className="label">Máximo de estudiantes</label>
      <input
        type="number"
        {...register('maxStudents', { required: 'Máximo de estudiantes es obligatorio' })}
        placeholder="Máximo de estudiantes"
        className={`input input-bordered w-full ${errors.maxStudents ? 'input-error' : ''}`}
      />
      {errors.maxStudents && <p className="text-error text-sm">{errors.maxStudents.message}</p>}

      <div className="modal-action">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
