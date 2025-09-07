import { useForm, Controller } from 'react-hook-form';
import type { IEvent } from '@interfaces/IEvent';
import EventForm from './EventForm';
import type { EventFormValues } from './EventForm';
interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: IEvent) => void;
}

type FormValues = {
  title: string;
  start: Date;
  end: Date;
  location: string;
  participants: string;
  description: string;
  color: string;
};

export default function NewEventModal({ open, onClose, onCreate }: NewEventModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      start: new Date(),
      end: new Date(),
      location: '',
      participants: '',
      description: '',
      color: 'bg-primary',
    },
  });

  if (!open) return null;

  function handleCreate(data: EventFormValues) {
    const startDate = data.start ? new Date(data.start) : null;
    const endDate = data.end ? new Date(data.end) : null;
    onCreate({
      id: Date.now().toString(),
      title: data.title,
      start: startDate!,
      end: endDate!,
      location: data.location,
      participants: data.participants ? data.participants.split(',').map((p) => p.trim()) : [],
      description: data.description,
      color: data.color,
      slotUsed: 1,
    });

    onClose();
  }

  if (!open) return null;

  return (
    <dialog open className="modal modal-open in-line">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 text-lg font-bold">Crear Nuevo Evento</h3>
        <EventForm submitLabel="Crear" onSubmit={handleCreate} onCancel={onClose} />
      </div>
    </dialog>
  );
}
