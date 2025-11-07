import { Link } from 'react-router';

export default function AccessDenied() {
  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center">
      <div className="card bg-base-100 w-96 shadow-xl">
        <figure className="px-10 pt-10">
          <div className="text-9xl">🚫</div>
        </figure>
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Acceso Denegado</h2>
          <p className="text-base-content/60">
            No tienes permisos para acceder a esta sección.
            <br />
            Solo los administradores pueden ingresar aquí.
          </p>
          <div className="card-actions mt-4 w-full flex-col justify-center gap-2">
            <Link to="/app" className="btn btn-primary btn-block">
              Volver al inicio
            </Link>
            <Link to="/ingresar" className="btn btn-ghost btn-block">
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
