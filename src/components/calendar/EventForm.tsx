import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DateTimeInput from '@components/UI/DateTimeInput';
import type { IEvent, EventFormValues, IProfessor, IClass } from '@interfaces/events/IEvent';
import { fetchProfessors } from '@client/professors';
import { fetchCourses } from '@client/courses';
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
    formState: { errors },
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

  // Ref para evitar múltiples resets mientras cargan datos asíncronos
  const didInitRef = useRef(false);

  const watchProfessorId = watch('professorId');

  const submitHandler = async (data: EventFormValues) => {
    setRequestError(null);
    try {
      await onSubmit(data);
      reset();
    } catch (error: any) {
      setRequestError(error.message || 'Ocurrió un error al guardar el evento');
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

  // Cuando ya tenemos datos y todavía no se aplicarón los valores iniciales (modo edición)
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
  }, [initialValues, professors.length, classes.length, setValue]);

  console.log({ professors, classes });

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
      {loadingData ? (
        <div className="space-y-3">
          <div>
            <label className="label">Profesor</label>
            <div className="skeleton h-10 w-full" />
          </div>
          <div>
            <label className="label">Clases</label>
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      ) : (
        <>
          <label className="label">Profesor</label>
          <select
            id="professor"
            className="select select-bordered w-full"
            value={watchProfessorId ?? ''}
            disabled={loadingData}
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
          {errors.professorId && <p className="text-error text-sm">{errors.professorId.message}</p>}

          <label className="label">Clases</label>
          <select
            id="class"
            className="select select-bordered w-full"
            value={watch('classId') ?? ''}
            disabled={loadingData}
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
        </>
      )}

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
        <option value="">Seleciona una modalidad</option>
        <option value="remote">Online</option>
        <option value="onsite">Presencial</option>
      </select>
      {errors.modality && <p className="text-error text-sm">{errors.modality.message}</p>}

      <label className="label">Clase grupal o individual</label>
      <select
        {...register('studentsGroup', { required: 'Clase grupal o individual es obligatoria' })}
        className="select select-bordered w-full"
      >
        <option value="">Seleciona una clase</option>
        <option value="group">Grupal</option>
        <option value="private">Individual</option>
      </select>
      {errors.studentsGroup && <p className="text-error text-sm">{errors.studentsGroup.message}</p>}

      <label className="label">Estado</label>
      <select
        {...register('status', { required: 'Estado es obligatorio' })}
        className="select select-bordered w-full"
      >
        <option value="">Seleciona un estado</option>
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

      {requestError && <p className="alert alert-warning text-sm">{requestError}</p>}
      <div className="modal-action w-full">
        <button type="button" className="btn w-1/2" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary w-1/2">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
