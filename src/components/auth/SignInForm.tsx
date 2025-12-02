import { useEffect, useMemo, useState } from 'react';
import { getToken } from '@client/auth';
import { useForm } from 'react-hook-form';
import { useSessionContext } from '../../context/SessionContext';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router';
import type { UserRole } from '@/interfaces/enums';

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

const roleTexts: Record<UserRole, { title: string; subtitle: string; helper?: string }> = {
  user: {
    title: 'Iniciar sesión',
    subtitle: 'Bienvenido de vuelta. Ingresa tus credenciales para continuar.',
    helper: 'Selecciona rol si deseas acceder como profesor o admin.',
  },
  professor: {
    title: 'Panel Profesor',
    subtitle: 'Acceso para profesores',
    helper: 'Ingresa tus credenciales de profesor.',
  },
  admin: {
    title: 'Panel Admin',
    subtitle: 'Acceso exclusivo para administradores',
    helper: 'Solo cuentas autorizadas pueden acceder.',
  },
};

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
        <div className="min-w-[16rem] md:min-w-[22rem] lg:min-w-[26rem]">
          <h2 className="text-primary mb-1 text-3xl font-bold">{roleTexts[userRole].title}</h2>
          <p className="text-base-content">{roleTexts[userRole].subtitle}</p>
        </div>
      </div>

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
        <div className="min-w-[16rem] md:min-w-[22rem] lg:min-w-[26rem]">
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
        <div className="min-w-[16rem] text-xs opacity-60 md:min-w-[22rem] lg:min-w-[26rem]">
          {roleTexts[userRole].helper}
        </div>
        <div className="join my-2">
          <button
            type="button"
            className={clsx(
              'btn join-item',
              userRole === 'user' ? 'btn-primary btn-soft' : 'btn-ghost'
            )}
            onClick={() => setUserRole('user')}
          >
            Estudiante
          </button>
          <button
            type="button"
            className={clsx(
              'btn join-item',
              userRole === 'professor' ? 'btn-secondary btn-soft' : 'btn-ghost'
            )}
            onClick={() => setUserRole('professor')}
          >
            Profesor
          </button>
          <button
            type="button"
            className={clsx(
              'btn join-item',
              userRole === 'admin' ? 'btn-accent btn-soft' : 'btn-ghost'
            )}
            onClick={() => setUserRole('admin')}
          >
            Admin
          </button>
        </div>
      </div>
    </>
  );
}
