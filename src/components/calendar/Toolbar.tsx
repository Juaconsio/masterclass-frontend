import { Calendar, ChevronRight, ChevronLeft, PlusIcon } from 'lucide-react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ToolbarProps {
  currentWeek: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  openCreateEventModal: () => void;
}

export default function Toolbar({
  currentWeek,
  onPrev,
  onNext,
  onToday,
  openCreateEventModal,
}: ToolbarProps) {
  const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekRange = `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM', { locale: es })}`;
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-primary h-6 w-6" />
            <h2 className="card-title text-2xl font-bold">{weekRange}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={openCreateEventModal}>
              <PlusIcon size={20} /> Agregar
            </button>
            <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={onPrev}>
              <ChevronLeft size={16} /> Anterior
            </button>
            <button className="btn btn-outline btn-sm" onClick={onToday}>
              Hoy
            </button>
            <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={onNext}>
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
