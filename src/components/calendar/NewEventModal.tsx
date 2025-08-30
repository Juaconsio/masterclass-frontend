import { useForm, Controller } from "react-hook-form"
import type { IEvent } from "@interfaces/IEvent"
import DateTimeInput from "@components/UI/DateTimeInput"

interface NewEventModalProps {
  open: boolean
  onClose: () => void
  onCreate: (event: IEvent) => void
}

type FormValues = {
  title: string
  start: Date
  end: Date
  location: string
  participants: string
  description: string
  color: string
}

export default function NewEventModal({
  open,
  onClose,
  onCreate,
}: NewEventModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      start: new Date(),
      end: new Date(),
      location: "",
      participants: "",
      description: "",
      color: "bg-primary",
    },
  })

  const onSubmit = (data: FormValues) => {
    const startDate = data.start ? new Date(data.start) : null
    const endDate = data.end ? new Date(data.end) : null

    onCreate({
      id: Date.now().toString(),
      title: data.title,
      start: startDate!,
      end: endDate!,
      location: data.location,
      participants: data.participants
        ? data.participants.split(",").map((p) => p.trim())
        : [],
      description: data.description,
      color: data.color,
      slotUsed: 1,
    })

    reset()
    onClose()
  }

  if (!open) return null

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">Crear Nuevo Evento</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Título */}
          <input
            {...register("title", { required: "El título es obligatorio" })}
            placeholder="Título"
            className={`input input-bordered w-full ${
              errors.title ? "input-error" : ""
            }`}
          />
          {errors.title && (
            <p className="text-error text-sm">{errors.title.message}</p>
          )}

          {/* Fecha + Horas */}
          <div className="flex gap-2">
            <div className="w-1/2">
                <Controller
                    control={control}
                    name="start"
                    rules={{ required: "La fecha de inicio es obligatoria" }}
                    render={({ field }) => (
                        <DateTimeInput label="Inicio" value={field.value} onChange={field.onChange} />
                    )}
                />

                {errors.start && (
                    <p className="text-error text-sm">{errors.start.message}</p>
                )}
            </div>
            <div className="w-1/2">
                <Controller
                    control={control}
                    name="end"
                    rules={{ required: "La fecha de fin es obligatoria" }}
                    render={({ field }) => (
                        <DateTimeInput label="Fin" value={field.value} onChange={field.onChange} />
                    )}
                />

                {errors.end && (
                <p className="text-error text-sm">{errors.end.message}</p>
                )}
            </div>
          </div>

          {/* Ubicación */}
          <input
            {...register("location", { required: "La ubicación es obligatoria" })}
            placeholder="Ubicación"
            className={`input input-bordered w-full ${
              errors.location ? "input-error" : ""
            }`}
          />
          {errors.location && (
            <p className="text-error text-sm">{errors.location.message}</p>
          )}

          {/* Participantes */}
          <input
            {...register("participants")}
            placeholder="Participantes (separados por coma)"
            className="input input-bordered w-full"
          />

          {/* Descripción */}
          <textarea
            {...register("description")}
            placeholder="Descripción"
            className="textarea textarea-bordered w-full"
          />

          {/* Color */}
          <select
            {...register("color")}
            className="select select-bordered w-full"
          >
            <option value="bg-primary">Azul</option>
            <option value="bg-accent">Verde</option>
            <option value="bg-secondary">Morado</option>
          </select>

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
  )
}
