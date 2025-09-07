import { useForm, Controller } from 'react-hook-form';
import DateTimeInput from '@components/UI/DateTimeInput';
import type { IEvent } from '@interfaces/IEvent';

export type EventFormValues = {
  title: string;
  start: Date;
  end: Date;
  location: string;
  participants: string;
  description: string;
  color: string;
};

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
      title: initialValues.title || '',
      start: initialValues.start || new Date(),
      end: initialValues.end || new Date(),
      location: initialValues.location || '',
      participants: initialValues.participants || '',
      description: initialValues.description || '',
      color: initialValues.color || 'bg-primary',
    },
  });

  const submitHandler = (data: EventFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
      <input
        {...register('title', { required: 'El título es obligatorio' })}
        placeholder="Título"
        className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
      />
      {errors.title && <p className="text-error text-sm">{errors.title.message}</p>}

      <div className="flex gap-2">
        <div className="w-1/2">
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

      <input
        {...register('location', { required: 'La ubicación es obligatoria' })}
        placeholder="Ubicación"
        className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
      />
      {errors.location && <p className="text-error text-sm">{errors.location.message}</p>}

      <input
        {...register('participants')}
        placeholder="Participantes (separados por coma)"
        className="input input-bordered w-full"
      />

      <textarea
        {...register('description')}
        placeholder="Descripción"
        className="textarea textarea-bordered w-full"
      />

      <select {...register('color')} className="select select-bordered w-full">
        <option value="bg-primary">Azul</option>
        <option value="bg-accent">Verde</option>
        <option value="bg-secondary">Morado</option>
      </select>

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
