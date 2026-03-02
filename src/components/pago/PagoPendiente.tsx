import { Clock } from 'lucide-react';
import { Link } from 'react-router';

export default function PagoPendiente() {
  return (
    <div className="bg-base-100 flex min-h-screen items-center justify-center p-4">
      <div className="card mx-auto w-full max-w-lg bg-white shadow-2xl">
        <div className="card-body items-center text-center">
          <div className="bg-warning/10 mb-4 rounded-full p-6">
            <Clock className="text-warning h-16 w-16" />
          </div>
          <h1 className="card-title text-2xl">Pago Pendiente</h1>
          <p className="text-base-content/70">
            Tu pago se encuentra en proceso. Te notificaremos cuando se confirme. Puedes revisar el
            estado en tus reservas.
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
