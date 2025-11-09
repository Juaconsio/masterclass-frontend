import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleBack}
        className="hover:bg-base-200 btn btn-ghost btn-sm flex items-center gap-1 transition-colors"
        aria-label="Ir atrás"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Atrás</span>
      </button>
      <button
        onClick={handleForward}
        className="hover:bg-base-200 btn btn-ghost btn-sm flex items-center gap-1 transition-colors"
        aria-label="Ir adelante"
      >
        <span className="hidden sm:inline">Adelante</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
