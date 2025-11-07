import { useState } from 'react';
import { getAdminToken } from '@client/auth';
import { useForm } from 'react-hook-form';
import { useSessionContext } from '../../context/SessionContext';
import clsx from 'clsx';
import { useNavigate } from 'react-router';

interface FormData {
  email: string;
  password: string;
}

export default function AdminSignInForm() {
  const { handleToken } = useSessionContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [feedback, setFeedback] = useState('');

  const onSubmit = async (data: FormData) => {
    setFeedback('');
    try {
      const res = await getAdminToken(data);
      if (res.ok && res.token) {
        handleToken(res.token);
        navigate('/admin');
      } else {
        const errorMessage = res.message || 'Error desconocido';
        setFeedback(errorMessage);
      }
    } catch (error: any) {
      setFeedback('Error de red o servidor. ' + error.message);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content w-16 rounded-lg">
            <span className="text-3xl">🔐</span>
          </div>
        </div>
        <div>
          <h2 className="text-primary text-3xl font-bold">Panel Admin</h2>
          <p className="text-base-content/60 text-sm">Acceso exclusivo para administradores</p>
        </div>
      </div>

      <div className="alert alert-warning mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-sm">Solo usuarios con permisos de administrador pueden acceder.</span>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Correo electrónico</span>
          </label>
          <input
            type="email"
            {...register('email', { required: 'El correo es obligatorio.' })}
            placeholder="admin@example.com"
            className={clsx('input input-bordered w-full', { 'input-error': errors.email })}
            autoComplete="email"
          />
          {errors.email && <span className="text-error mt-1 text-xs">{errors.email.message}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Contraseña</span>
          </label>
          <input
            type="password"
            {...register('password', { required: 'La contraseña es obligatoria.' })}
            placeholder="••••••••"
            className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="text-error mt-1 text-xs">{errors.password.message}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Verificando credenciales...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Acceder al panel
            </>
          )}
        </button>

        {feedback && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">{feedback}</span>
          </div>
        )}
      </form>

      <div className="divider">O</div>

      <div className="space-y-2 text-center">
        <a href="/ingresar" className="link link-primary text-sm">
          ← Volver al inicio de sesión normal
        </a>
        <p className="text-base-content/60 text-xs">
          ¿Problemas para acceder? Contacta al administrador del sistema.
        </p>
      </div>
    </>
  );
}
