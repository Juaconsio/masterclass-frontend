import { CircleCheck } from 'lucide-react';
import { Link } from 'react-router';

export default function PagoExitoso() {
  return (
    <div className="bg-base-100 flex min-h-screen items-center justify-center p-4">
      <div className="card mx-auto w-full max-w-lg bg-white shadow-2xl">
        <div className="card-body items-center text-center">
          <div className="bg-success/10 mb-4 rounded-full p-6">
            <CircleCheck className="text-success h-16 w-16" />
          </div>
          <h1 className="card-title text-2xl">Pago Exitoso</h1>
          <p className="text-base-content/70">
            Tu pago fue procesado correctamente. Tu reserva ha sido confirmada.
          </p>
          <div className="card-actions mt-6 flex-wrap justify-center gap-3">
            <Link to="/app/reservas" className="btn btn-primary">
              Ver mis reservas
            </Link>
            <Link to="/app" className="btn btn-outline">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
