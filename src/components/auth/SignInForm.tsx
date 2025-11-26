import { useEffect, useMemo, useState } from 'react';
import { getToken } from '@client/auth';
import { useForm } from 'react-hook-form';
import { useSessionContext } from '../../context/SessionContext';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router';
import type { UserRole } from '@/interfaces/enums';
import { ShieldCheck, UserStar } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
}

const ERROR_RESPONSE: Record<string, string> = {
  'Incorrect email.': 'El correo no está registrado.',
  'Incorrect password.': 'La contraseña es incorrecta.',
  'Please confirm your email address. A confirmation link was (re)sent to your email.':
    'Por favor confirma tu correo electrónico. Se ha enviado un enlace de confirmación a tu email.',
};

interface SignInFormProps {
  initialUserRole?: UserRole;
}

export default function SignInForm({ initialUserRole }: SignInFormProps) {
  const { handleToken } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [feedback, setFeedback] = useState('');
  const inferredRoleFromPath: UserRole = useMemo(() => {
    const path = location?.pathname || '';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/profesor') || path.includes('/professor')) return 'professor';
    return 'user';
  }, [location]);
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole || inferredRoleFromPath);

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
      const res = await getToken({
        email: data.email,
        password: data.password,
        accountType: userRole,
      });
      if (res.ok && res.token) {
        handleToken(res.token);

        // Decodificar el token para verificar el rol
        const decoded: any = await import('jwt-decode').then((m) => m.jwtDecode(res.token!));
        const isAdmin = decoded?.role === 'admin' || decoded?.isAdmin === true;

        // Redirigir según el rol
        navigate(isAdmin ? '/admin' : '/app');
      } else {
        // Usar el mensaje mapeado si existe, sino usar el mensaje del servidor directamente
        setFeedback(ERROR_RESPONSE[res.message || ''] || res.message || 'Error desconocido');
      }
    } catch (error: any) {
      setFeedback('Error de red o servidor.' + error.message);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-primary mb-1 text-3xl font-bold">
            {userRole === 'admin'
              ? 'Panel Admin'
              : userRole === 'professor'
                ? 'Panel Profesor'
                : 'Iniciar sesión'}
          </h2>
          <p className="text-base-content">
            {userRole === 'admin'
              ? 'Acceso exclusivo para administradores'
              : userRole === 'professor'
                ? 'Acceso para profesores'
                : 'Bienvenido de vuelta. Ingresa tus credenciales para continuar.'}
          </p>
        </div>
        <div className="join">
          <button
            type="button"
            className={clsx('btn join-item', userRole === 'user' ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setUserRole('user')}
          >
            Usuario
          </button>
          <button
            type="button"
            className={clsx(
              'btn join-item',
              userRole === 'professor' ? 'btn-secondary' : 'btn-ghost'
            )}
            onClick={() => setUserRole('professor')}
          >
            Profesor
          </button>
          <button
            type="button"
            className={clsx('btn join-item', userRole === 'admin' ? 'btn-accent' : 'btn-ghost')}
            onClick={() => setUserRole('admin')}
          >
            Admin
          </button>
        </div>
      </div>

      {userRole === 'admin' && (
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
          <span className="text-sm">
            Solo usuarios con permisos de administrador pueden acceder.
          </span>
        </div>
      )}
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
          {isSubmitting ? 'Verificando credenciales...' : 'Ingresar'}
        </button>
        <div className="text-error mt-2 h-fit min-h-[1.5em] text-sm"> {feedback}</div>
      </form>
      <div className="mt-6 space-y-2 text-center">
        <div>
          {userRole === 'admin' ? (
            <a href="/ingresar" className="link link-primary text-sm">
              ← Volver al inicio de sesión normal
            </a>
          ) : (
            <>
              <span>¿No tienes cuenta?</span>
              <a href="/registrar" className="link link-primary ml-2">
                Regístrate
              </a>
            </>
          )}
        </div>
        <div className="text-xs opacity-60">
          {userRole === 'user' && 'Selecciona rol si deseas acceder como profesor o admin.'}
          {userRole === 'professor' && 'Ingresa tus credenciales de profesor.'}
          {userRole === 'admin' && 'Solo cuentas autorizadas pueden acceder.'}
        </div>
      </div>
    </>
  );
}
