import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DateTimeInput from '@components/UI/DateTimeInput';
import type { EventFormValues, IProfessor, IClass } from '@interfaces/events/IEvent';
import { fetchProfessors } from '@client/professors';
import { fetchCourses } from '@client/courses';
import { CircleX } from 'lucide-react';
import type { ICourse } from '@/interfaces/models';

interface EventFormProps {
  formId?: string;
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
  showActions?: boolean;
  mode?: 'create' | 'edit';
  onDataStateChange?: (state: { loading: boolean; error: string | null; ready: boolean }) => void;
}

/**
 * Normaliza los valores iniciales para asegurar que todos los campos requeridos
 * tengan valores válidos (nunca undefined)
 */
function normalizeInitialValues(values?: Partial<EventFormValues>): EventFormValues {
  const now = new Date();

  return {
    courseId: values?.courseId ?? null,
    classId: values?.classId ?? null,
    professorId: values?.professorId ?? null,
    start: values?.start instanceof Date ? values.start : now,
    end: values?.end instanceof Date ? values.end : now,
    modality: values?.modality || 'remote',
    studentsGroup: values?.studentsGroup || 'private',
    status: values?.status || 'candidate',
    location: values?.location,
    minStudents: values?.minStudents,
    maxStudents: values?.maxStudents ?? 1,
  };
}

export default function EventForm({
  formId,
  initialValues,
  onSubmit,
  submitLabel = 'Guardar',
  onCancel,
  showActions = true,
  mode,
  onDataStateChange,
}: EventFormProps) {
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const isEditMode = mode === 'edit' || (mode === undefined && initialValues?.courseId != null);

  // Normalizar initialValues para asegurar que no haya undefined
  const normalizedValues = normalizeInitialValues(initialValues);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues: normalizedValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    // Sin validación custom de classId
  });

  const didInitRef = useRef(false);

  const watchProfessorId = watch('professorId');
  const watchCourseId = watch('courseId');

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

  const loadData = useCallback(async () => {
    try {
      setFetchError(null);
      setLoadingData(true);
      const [p, c] = await Promise.all([fetchProfessors(), fetchCourses()]);
      setProfessors(p.data);
      setCourses(c);
      setClasses(c.find((course: ICourse) => course.id === watchCourseId)?.classes || []);
    } catch (err) {
      setFetchError('No se pudieron cargar profesores y cursos. Intenta nuevamente.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const ready = !loadingData && !fetchError;
    if (onDataStateChange) {
      onDataStateChange({ loading: loadingData, error: fetchError, ready });
    }
  }, [loadingData, fetchError, onDataStateChange]);

  useEffect(() => {
    const selectedCourse = courses.find((c) => c.id === watchCourseId);
    const newClasses = selectedCourse?.classes || [];
    setClasses(newClasses);
  }, [watchCourseId, courses]);

  useEffect(() => {
    if (loadingData || didInitRef.current) return;
    if (!initialValues) return;

    reset(normalizeInitialValues(initialValues));

    didInitRef.current = true;
  }, [loadingData, initialValues, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(submitHandler)}
      aria-busy={isSubmitting}
      className="flex flex-col gap-4"
    >
      {fetchError && (
        <div role="alert" className="alert alert-error alert-soft">
          <CircleX className="h-4 w-4" />
          <div className="flex w-full items-start justify-between gap-2">
            <span className="text-sm">{fetchError}</span>
            <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={loadData}
              disabled={loadingData}
            >
              {loadingData && <span className="loading loading-spinner loading-xs" />}
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!fetchError && (
        <>
          <div className="space-y-3">
            <h3 className="text-base-content/60 text-sm font-semibold tracking-wide uppercase">
              Información del Evento
            </h3>

            {loadingData ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Cursos</label>
                  <div className="skeleton h-10 w-full" />
                </div>
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
              <div className="space-y-3">
                <div>
                  <label className="label">Cursos</label>
                  {isEditMode ? (
                    <p className="input input-bordered flex w-full items-center">
                      {courses.find((c) => c.id === watchCourseId)?.title || 'No seleccionado'}
                    </p>
                  ) : (
                    <select
                      id="course"
                      className="select select-bordered w-full"
                      value={watchCourseId ?? ''}
                      disabled={loadingData || isSubmitting}
                      onChange={(e) => {
                        const v = e.target.value;
                        setValue('courseId', v === '' ? null : Number(v), { shouldDirty: true });
                        setValue('professorId', null, { shouldDirty: true });
                        setValue('classId', null, { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <option value="">Seleccione un curso</option>
                      {courses
                        .filter((cls) =>
                          watchProfessorId == null
                            ? true
                            : cls.professors?.some((prof) => prof.id === watchProfessorId)
                        )
                        .map((cls: ICourse) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.title}
                          </option>
                        ))}
                    </select>
                  )}
                  {errors.courseId && (
                    <p className="text-error text-sm">{errors.courseId.message}</p>
                  )}
                </div>

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
                      setValue('classId', null, { shouldDirty: true });
                    }}
                  >
                    <option value="">Seleccione un profesor</option>
                    {professors?.length > 0 ? (
                      professors.map((prof: IProfessor) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay profesores disponibles</option>
                    )}
                  </select>
                  {errors.professorId && (
                    <p className="text-error text-sm">{errors.professorId.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Clases</label>
                  {isEditMode ? (
                    <p className="input input-bordered flex w-full items-center">
                      {classes.find((c) => c.id === watch('classId'))?.title || 'No seleccionado'}
                    </p>
                  ) : (
                    <Controller
                      name="classId"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="class"
                          className="select select-bordered w-full"
                          value={field.value ?? ''}
                          disabled={loadingData || isSubmitting}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === '' ? null : Number(v));
                          }}
                        >
                          <option value="">Seleccione una clase</option>
                          {classes.map((cls: IClass) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.title}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-base-content/60 text-sm font-semibold tracking-wide uppercase">
              Fecha y Horario
            </h3>

            <div className="space-y-3">
              <div>
                <label className="label">Fecha de inicio</label>
                <Controller
                  control={control}
                  name="start"
                  rules={{
                    required: 'La fecha de inicio es obligatoria',
                    validate: (value) => {
                      if (!(value instanceof Date) || isNaN(value.getTime()))
                        return 'Fecha inválida';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      disabled={isSubmitting}
                      value={
                        field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => {
                        const currentStart = field.value instanceof Date ? field.value : new Date();
                        const currentEnd = watch('end');

                        const [year, month, day] = e.target.value.split('-').map(Number);
                        const newStart = new Date(
                          year,
                          month - 1,
                          day,
                          currentStart.getHours(),
                          currentStart.getMinutes()
                        );

                        field.onChange(newStart);

                        // Actualizar fecha de fin al mismo día
                        if (currentEnd instanceof Date) {
                          const newEnd = new Date(
                            year,
                            month - 1,
                            day,
                            currentEnd.getHours(),
                            currentEnd.getMinutes()
                          );
                          setValue('end', newEnd);
                        }
                      }}
                    />
                  )}
                />
                {errors.start && <p className="text-error text-sm">{errors.start.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hora de inicio</label>
                  <Controller
                    control={control}
                    name="start"
                    rules={{
                      required: 'La hora de inicio es obligatoria',
                      validate: (value) => {
                        if (!(value instanceof Date) || isNaN(value.getTime()))
                          return 'Hora inválida';
                        const hour = value.getHours();
                        if (hour < 8 || hour > 23 || (hour === 23 && value.getMinutes() > 30)) {
                          return 'La hora de inicio debe ser entre 08:00 y 23:30';
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        disabled={isSubmitting}
                        value={
                          field.value instanceof Date
                            ? `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}`
                            : ''
                        }
                        onChange={(e) => {
                          const current = field.value instanceof Date ? field.value : new Date();
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(current);
                          newDate.setHours(hours, minutes);
                          field.onChange(newDate);
                        }}
                      />
                    )}
                  />
                  {errors.start && <p className="text-error text-sm">{errors.start.message}</p>}
                </div>

                <div>
                  <label className="label">Hora de fin</label>
                  <Controller
                    control={control}
                    name="end"
                    rules={{
                      required: 'La hora de fin es obligatoria',
                      validate: (end) => {
                        const start = watch('start');
                        if (!(end instanceof Date) || isNaN(end.getTime())) return 'Hora inválida';
                        if (!(start instanceof Date) || isNaN(start.getTime())) return true;
                        if (end <= start)
                          return 'La hora de fin debe ser posterior a la hora de inicio';
                        const diff = end.getTime() - start.getTime();
                        if (diff < 30 * 60 * 1000) {
                          return 'La hora de fin debe ser al menos 30 minutos después de la hora de inicio';
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        disabled={isSubmitting}
                        value={
                          field.value instanceof Date
                            ? `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}`
                            : ''
                        }
                        onChange={(e) => {
                          const start = watch('start');
                          const current = start instanceof Date ? new Date(start) : new Date();
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          current.setHours(hours, minutes);
                          field.onChange(current);
                        }}
                      />
                    )}
                  />
                  {errors.end && <p className="text-error text-sm">{errors.end.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la Clase */}
          <div className="space-y-3">
            <h3 className="text-base-content/60 text-sm font-semibold tracking-wide uppercase">
              Detalles de la Clase
            </h3>

            <div className="space-y-3">
              <div>
                <label className="label">Modalidad</label>
                <select
                  {...register('modality', { required: 'Modalidad es obligatoria' })}
                  className="select select-bordered w-full"
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona una modalidad</option>
                  <option value="remote">Online</option>
                  <option value="onsite">Presencial</option>
                </select>
                {errors.modality && <p className="text-error text-sm">{errors.modality.message}</p>}
              </div>

              <div>
                <label className="label">Clase grupal o individual</label>
                <select
                  {...register('studentsGroup', {
                    required: 'Clase grupal o individual es obligatoria',
                  })}
                  className="select select-bordered w-full"
                  disabled={isSubmitting}
                  onChange={async (e) => {
                    const handler = register('studentsGroup').onChange;
                    if (handler) handler(e);
                    await trigger('classId');
                  }}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="group">Grupal</option>
                  <option value="private">Particular</option>
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
                  <option value="">Selecciona un estado</option>
                  <option value="candidate">Candidato</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                {errors.status && <p className="text-error text-sm">{errors.status.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Mínimo</label>
                  <input
                    type="number"
                    {...register('minStudents', {
                      min: { value: 0, message: 'El mínimo no puede ser negativo' },
                      validate: (value) => {
                        if (value != null && value < 0) return 'El mínimo no puede ser negativo';
                        return true;
                      },
                    })}
                    placeholder="Mín."
                    className={`input input-bordered w-full ${errors.minStudents ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.minStudents && (
                    <p className="text-error mt-1 text-sm">{errors.minStudents.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Máximo</label>
                  <input
                    type="number"
                    {...register('maxStudents', {
                      required: 'Máximo es obligatorio',
                      min: { value: 0, message: 'El máximo no puede ser negativo' },
                      validate: (value) => {
                        if (value != null && value < 0) return 'El máximo no puede ser negativo';
                        const min = watch('minStudents');
                        if (min != null && value != null && value < min)
                          return 'El máximo no puede ser menor que el mínimo';
                        return true;
                      },
                    })}
                    placeholder="Máx."
                    className={`input input-bordered w-full ${errors.maxStudents ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.maxStudents && (
                    <p className="text-error mt-1 text-sm">{errors.maxStudents.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {requestError && (
        <div role="alert" className="alert alert-error alert-soft">
          <CircleX className="h-4 w-4" />
          <span>{requestError}</span>
        </div>
      )}

      {showActions && (
        <div className="modal-action grid w-full grid-cols-2 gap-2">
          <button type="button" className="btn w-full" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner loading-sm" />}
            <span>{submitLabel}</span>
          </button>
        </div>
      )}
    </form>
  );
}
