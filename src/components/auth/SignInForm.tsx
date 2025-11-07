import { useEffect, useState } from 'react';
import { getToken } from '@client/auth';
import { useForm } from 'react-hook-form';
import { useSessionContext } from '../../context/SessionContext';
import clsx from 'clsx';
import { useNavigate } from 'react-router';
interface FormData {
  email: string;
  password: string;
}

const ERROR_RESPONSE = {
  'Incorrect email.': 'El correo no está registrado.',
  'Incorrect password.': 'La contraseña es incorrecta.',
};

export default function SignInForm() {
  const { handleToken } = useSessionContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [feedback, setFeedback] = useState('');

  // TODO: REFAcTOREAR ESTO A UN HOOK con el hook en client
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || undefined;
        if (!token) return;

        const jwtModule: any = await import('jwt-decode');
        const decoded: any =
          typeof jwtModule === 'function'
            ? jwtModule(token)
            : jwtModule.jwtDecode
              ? jwtModule.jwtDecode(token)
              : jwtModule.default
                ? jwtModule.default(token)
                : undefined;

        if (!decoded) return;

        // verificar expiración si existe el claim exp
        if (decoded.exp && Date.now() / 1000 > decoded.exp) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          return;
        }

        // pasar token al contexto y redirigir según rol
        handleToken(token);
        const isAdmin = decoded?.role === 'admin' || decoded?.isAdmin === true;
        navigate(isAdmin ? '/admin' : '/app');
      } catch {
        // no hacer nada si falla la verificación
      }
    };

    checkToken();
  }, []);

  const onSubmit = async (data: FormData) => {
    setFeedback('');
    try {
      const res = await getToken(data);
      if (res.ok && res.token) {
        handleToken(res.token);

        // Decodificar el token para verificar el rol
        const decoded: any = await import('jwt-decode').then((m) => m.jwtDecode(res.token!));
        const isAdmin = decoded?.role === 'admin' || decoded?.isAdmin === true;

        // Redirigir según el rol
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      } else {
        const errorMessage =
          ERROR_RESPONSE[res.message as keyof typeof ERROR_RESPONSE] || 'Error desconocido';
        setFeedback(errorMessage);
      }
    } catch (error: any) {
      setFeedback('Error de red o servidor.' + error.message);
    }
  };

  return (
    <>
      <h2 className="text-primary mb-2 text-3xl font-bold">Iniciar sesión</h2>
      <p className="text-base-content mb-6">
        Bienvenido de vuelta. Ingresa tus credenciales para continuar.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          type="email"
          {...register('email', { required: 'El correo es obligatorio.' })}
          placeholder="Correo electrónico"
          className={clsx('input input-bordered w-full', { 'input-error': errors.email })}
          autoComplete="email"
        />
        {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
        <input
          type="password"
          {...register('password', { required: 'La contraseña es obligatoria.' })}
          placeholder="Contraseña"
          className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
          autoComplete="current-password"
        />
        {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="text-error mt-2 h-fit min-h-[1.5em] text-sm"> {feedback}</div>
      </form>
      <div className="mt-6 space-y-2 text-center">
        <div>
          <span>¿No tienes cuenta?</span>
          <a href="/registrar" className="link link-primary ml-2">
            Regístrate
          </a>
        </div>
        <div className="divider text-xs">O</div>
        <a
          href="/admin/ingresar"
          className="link link-secondary flex items-center justify-center gap-2 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
          Acceder como administrador
        </a>
      </div>
    </>
  );
}
