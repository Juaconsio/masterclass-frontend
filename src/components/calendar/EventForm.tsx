import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DateTimeInput from '@components/UI/DateTimeInput';
import type { IEvent, EventFormValues, IProfessor, IClass } from '@interfaces/events/IEvent';
import { fetchProfessors } from '@client/professors';
import { fetchCourses } from '@client/courses';
import { CircleX } from 'lucide-react';

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
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues: {
      classId: initialValues.classId ?? null,
      professorId: initialValues.professorId ?? null,
      start: initialValues.start || new Date(),
      end: initialValues.end || new Date(),
      modality: initialValues.modality || '',
      studentsGroup: initialValues.studentsGroup || '',
      status: initialValues.status || '',
      minStudents: initialValues.minStudents || undefined,
      maxStudents: initialValues.maxStudents || 1,
    },
  });

  const didInitRef = useRef(false);

  const watchProfessorId = watch('professorId');
  const watchClassId = watch('classId');

  const submitHandler = async (data: EventFormValues) => {
    setRequestError(null);
    try {
      await onSubmit(data);
      reset();
    } catch (error: unknown) {
      let message = 'Ocurrió un error al guardar el evento';
      if (error && typeof error === 'object') {
        const e = error as { response?: { data?: { error?: string } }; message?: string };
        message = e.response?.data?.error ?? e.message ?? message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      setRequestError(message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [p, c] = await Promise.all([fetchProfessors(), fetchCourses()]);
        setProfessors(p);
        setClasses(c);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    if (!initialValues) return;
    // Solo aplicamos reset si hay al menos profesores y clases cargados o si no hacen falta
    if (professors.length === 0 && classes.length === 0) return;
    // Aplicamos valores iniciales campo a campo para no resetear estado interno innecesariamente
    if (initialValues.classId !== undefined) setValue('classId', initialValues.classId ?? null);
    if (initialValues.professorId !== undefined)
      setValue('professorId', initialValues.professorId ?? null);
    if (initialValues.start) setValue('start', initialValues.start as Date);
    if (initialValues.end) setValue('end', initialValues.end as Date);
    if (initialValues.modality) setValue('modality', initialValues.modality);
    if (initialValues.studentsGroup) setValue('studentsGroup', initialValues.studentsGroup);
    if (initialValues.status) setValue('status', initialValues.status);
    if (initialValues.minStudents !== undefined) setValue('minStudents', initialValues.minStudents);
    if (initialValues.maxStudents !== undefined) setValue('maxStudents', initialValues.maxStudents);
    didInitRef.current = true;
  }, [initialValues, professors, classes]);

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      aria-busy={isSubmitting}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {loadingData ? (
        <>
          <div className="md:col-span-1">
            <label className="label">Profesor</label>
            <div className="skeleton h-10 w-full" />
          </div>
          <div className="md:col-span-1">
            <label className="label">Clases</label>
            <div className="skeleton h-10 w-full" />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="label">Profesor</label>
            <select
              id="professor"
              className="select select-bordered w-full"
              value={watchProfessorId ?? ''}
              disabled={loadingData || isSubmitting}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === '' ? null : Number(v);
                setValue('professorId', num, { shouldDirty: true });
                // Limpiamos classId si cambia profesor
                setValue('classId', null, { shouldDirty: true });
              }}
            >
              <option value="">Seleccione un profesor</option>
              {professors.map((prof: IProfessor) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
            {errors.professorId && (
              <p className="text-error text-sm">{errors.professorId.message}</p>
            )}
          </div>

          <div>
            <label className="label">Clases</label>
            <select
              id="class"
              className="select select-bordered w-full"
              value={watchClassId ?? ''}
              disabled={loadingData || isSubmitting}
              onChange={(e) => {
                const v = e.target.value;
                setValue('classId', v === '' ? null : Number(v), { shouldDirty: true });
              }}
            >
              <option value="">Seleccione una clase</option>
              {classes
                .filter((cls) =>
                  watchProfessorId == null
                    ? true
                    : cls.professors.some((prof) => prof.id === watchProfessorId)
                )
                .map((cls: IClass) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                  </option>
                ))}
            </select>
            {errors.classId && <p className="text-error text-sm">{errors.classId.message}</p>}
          </div>
        </>
      )}

      <div>
        <label className="label">Fecha de inicio</label>
        <Controller
          control={control}
          name="start"
          rules={{
            required: 'La fecha de inicio es obligatoria',
            validate: (value) => {
              if (!(value instanceof Date) || isNaN(value.getTime())) return 'Fecha inválida';
              const hour = value.getHours();
              if (hour < 8 || hour > 23 || (hour === 23 && value.getMinutes() > 30)) {
                return 'La hora de inicio debe ser entre 08:00 y 23:30';
              }
              return true;
            },
          }}
          render={({ field }) => (
            <div className={isSubmitting ? 'pointer-events-none opacity-60' : ''}>
              <DateTimeInput value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        {errors.start && <p className="text-error text-sm">{errors.start.message}</p>}
      </div>

      <div>
        <label className="label">Fecha de fin</label>
        <Controller
          control={control}
          name="end"
          rules={{
            required: 'La fecha de fin es obligatoria',
            validate: (end) => {
              const start = watch('start');
              if (!(end instanceof Date) || isNaN(end.getTime())) return 'Fecha inválida';
              if (!(start instanceof Date) || isNaN(start.getTime())) return true;
              if (
                end.getFullYear() !== start.getFullYear() ||
                end.getMonth() !== start.getMonth() ||
                end.getDate() !== start.getDate()
              ) {
                return 'La fecha de fin debe ser el mismo día que la fecha de inicio';
              }
              if (end <= start) return 'La fecha de fin debe ser posterior a la fecha de inicio';
              const diff = end.getTime() - start.getTime();
              if (diff < 30 * 60 * 1000) {
                return 'La hora de fin debe ser al menos 30 minutos después de la hora de inicio';
              }
              return true;
            },
          }}
          render={({ field }) => (
            <div className={isSubmitting ? 'pointer-events-none opacity-60' : ''}>
              <DateTimeInput value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        {errors.end && <p className="text-error text-sm">{errors.end.message}</p>}
      </div>

      <div>
        <label className="label">Modalidad</label>
        <select
          {...register('modality', { required: 'Modalidad es obligatoria' })}
          className="select select-bordered w-full"
          disabled={isSubmitting}
        >
          <option value="">Seleciona una modalidad</option>
          <option value="remote">Online</option>
          <option value="onsite">Presencial</option>
        </select>
        {errors.modality && <p className="text-error text-sm">{errors.modality.message}</p>}
      </div>

      <div>
        <label className="label">Clase grupal o individual</label>
        <select
          {...register('studentsGroup', { required: 'Clase grupal o individual es obligatoria' })}
          className="select select-bordered w-full"
          disabled={isSubmitting}
        >
          <option value="">Seleciona una clase</option>
          <option value="group">Grupal</option>
          <option value="private">Individual</option>
        </select>
        {errors.studentsGroup && (
          <p className="text-error text-sm">{errors.studentsGroup.message}</p>
        )}
      </div>

      <div>
        <label className="label">Estado</label>
        <select
          {...register('status', { required: 'Estado es obligatorio' })}
          className="select select-bordered w-full"
          disabled={isSubmitting}
        >
          <option value="">Seleciona un estado</option>
          <option value="candidate">Candidato</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {errors.status && <p className="text-error text-sm">{errors.status.message}</p>}
      </div>

      <div>
        <label className="label">Mínimo de estudiantes</label>
        <input
          type="number"
          {...register('minStudents')}
          placeholder="Mínimo de estudiantes"
          className="input input-bordered w-full"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="label">Máximo de estudiantes</label>
        <input
          type="number"
          {...register('maxStudents', { required: 'Máximo de estudiantes es obligatorio' })}
          placeholder="Máximo de estudiantes"
          className={`input input-bordered w-full ${errors.maxStudents ? 'input-error' : ''}`}
          disabled={isSubmitting}
        />
        {errors.maxStudents && <p className="text-error text-sm">{errors.maxStudents.message}</p>}
      </div>

      {requestError && (
        <div role="alert" className="alert alert-error alert-soft md:col-span-2">
          <CircleX className="h-4 w-4" />
          <span>{requestError}</span>
        </div>
      )}

      <div className="modal-action grid w-full grid-cols-2 gap-2 md:col-span-2">
        <button type="button" className="btn w-full" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner loading-sm" />}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
