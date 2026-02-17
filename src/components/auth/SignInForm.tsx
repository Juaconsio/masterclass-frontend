import { useEffect, useMemo, useState } from 'react';
import { getToken, validateToken } from '@client/auth';
import { createReservation } from '@client/reservations';
import { useForm } from 'react-hook-form';
import { useSessionContext } from '../../context/SessionContext';
import clsx from 'clsx';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import type { UserRole } from '@/interfaces/enums';
import { AUTH_ERROR_MESSAGES } from '@/lib/errorMessages';

interface FormData {
  email: string;
  password: string;
}

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
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [feedback, setFeedback] = useState('');
  const [hasPendingReservation, setHasPendingReservation] = useState(false);

  const inferredRoleFromPath: UserRole = useMemo(() => {
    // Check query params first
    const typeParam = searchParams.get('type');
    if (typeParam === 'professor') return 'professor';
    if (typeParam === 'admin') return 'admin';

    // Then check path
    const path = location?.pathname || '';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/profesor') || path.includes('/professor')) return 'professor';
    return 'user';
  }, [location, searchParams]);
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole || inferredRoleFromPath);

  // TODO: REFAcTOREAR ESTO A UN HOOK con el hook en client
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = (await validateToken()) || undefined;
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

  // Check for pending reservation on mount
  useEffect(() => {
    const pending = localStorage.getItem('pendingReservation');
    setHasPendingReservation(!!pending);
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

        // Verificar si hay reserva pendiente (solo para usuarios normales)
        if (!isAdmin && userRole === 'user') {
          const pendingStr = localStorage.getItem('pendingReservation');
          if (pendingStr) {
            let pending;
            try {
              pending = JSON.parse(pendingStr);

              // Crear la reserva automáticamente
              const result = await createReservation({
                courseId: pending.courseId,
                slotId: pending.slotId,
                pricingPlanId: pending.pricingPlanId,
              });

              // Limpiar pending reservation
              localStorage.removeItem('pendingReservation');

              // Guardar datos para la página de éxito
              localStorage.setItem(
                'reservation.success',
                JSON.stringify({
                  reservation: result.reservation,
                  payment: result.payment,
                })
              );

              // Redirigir a página de éxito
              navigate('/app/confirmacion-pago');
              return;
            } catch (resError: any) {
              console.error('Error creating reservation after login:', resError);
              // Limpiar pending reservation
              localStorage.removeItem('pendingReservation');

              // Guardar información del error para mostrar en la página de confirmación
              localStorage.setItem(
                'reservation.error',
                JSON.stringify({
                  message: resError?.response?.data?.message || 'Error al crear la reserva',
                  details: resError?.response?.data || {},
                  pending: pending,
                })
              );

              // Redirigir a página de error de confirmación
              navigate('/app/confirmacion-pago');
              return;
            }
          }
        }

        // Redirigir según el rol (flujo normal)
        navigate(isAdmin ? '/admin' : '/app');
      } else {
        setFeedback(AUTH_ERROR_MESSAGES[res.message || ''] || res.message || 'Error desconocido');
      }
    } catch (error: any) {
      setFeedback('Error de red o servidor.' + error.message);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-primary mb-1 text-3xl font-bold">{roleTexts[userRole].title}</h2>
        <p className="text-base-content">{roleTexts[userRole].subtitle}</p>
      </div>
      <div className="text-xs opacity-60">{roleTexts[userRole].helper}</div>

      {hasPendingReservation && userRole === 'user' && (
        <div className="alert alert-success my-4">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-semibold">¡Tienes una reserva esperando!</p>
            <p className="text-sm">Al iniciar sesión, tu reserva se confirmará automáticamente.</p>
          </div>
        </div>
      )}

      <div className="join my-2">
        <button
          type="button"
          className={clsx('btn join-item', userRole === 'user' ? 'btn-secondary' : 'btn-ghost')}
          onClick={() => setUserRole('user')}
        >
          Estudiante
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
          className={clsx('btn join-item', userRole === 'admin' ? 'btn-secondary' : 'btn-ghost')}
          onClick={() => setUserRole('admin')}
        >
          Admin
        </button>
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
        <div className="flex justify-end">
          <a href="/reiniciar-contraseña" className="link link-info link-hover text-sm">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <button type="submit" className="btn btn-secondary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verificando credenciales...' : 'Ingresar'}
        </button>
      </form>
      <div className="mt-6 space-y-2 text-center">
        <div className="min-w-[16rem] md:min-w-[22rem] lg:min-w-[26rem]">
          {userRole === 'user' && (
            <>
              <span>¿No tienes cuenta?</span>
              <a href="/registrar" className="link link-info link-hover ml-2">
                Regístrate
              </a>
            </>
          )}
        </div>
        <div className="text-error mt-2 h-fit min-h-[1.5em] text-sm">{feedback}</div>
      </div>
    </>
  );
}
