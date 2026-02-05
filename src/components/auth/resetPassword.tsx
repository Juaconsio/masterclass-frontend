import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useSearchParams, useNavigate } from 'react-router';
import { resetPassword } from '@/client/auth';
import type { UserRole } from '@/interfaces/enums';
import { getErrorMessage } from '@/lib/errorMessages';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const accountType = searchParams.get('type');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema as any),
    mode: 'onChange',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const onSubmit = async ({ password }: FormData) => {
    setFeedback(null);

    if (!token || !accountType) {
      setFeedback({
        type: 'error',
        message: 'Enlace de recuperación inválido o expirado.',
      });
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: password,
        accountType: accountType as UserRole,
      });
      setFeedback({
        type: 'success',
        message: 'Contraseña actualizada correctamente. Redirigiendo...',
      });

      // Redirect based on account type
      const redirectPath =
        accountType === 'admin'
          ? '/admin/ingresar'
          : accountType === 'professor'
            ? '/ingresar?type=professor'
            : '/ingresar';

      setTimeout(() => navigate(redirectPath), 2000);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error?.message || error),
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-primary mb-2 text-3xl font-bold">Crear nueva contraseña</h2>
        <p className="text-base-content">
          Ingresa una nueva contraseña para tu cuenta. Por seguridad, este enlace tiene una validez
          de 30 minutos.
        </p>
      </div>

      {feedback && (
        <div
          className={clsx(
            'alert mb-4',
            feedback.type === 'success' ? 'alert-success' : 'alert-error'
          )}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Nueva contraseña</span>
          </label>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
            autoComplete="new-password"
          />
          {errors.password ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.password.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60">Mínimo 6 caracteres</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Confirmar contraseña</span>
          </label>
          <input
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••••"
            className={clsx('input input-bordered w-full', {
              'input-error': errors.confirmPassword,
            })}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
            </label>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a href="/ingresar" className="link link-primary text-sm">
          ← Volver a iniciar sesión
        </a>
      </div>
    </>
  );
}
