import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { requestPasswordReset } from '@/client/auth';

const schema = z.object({
  email: z.email('Correo electrónico inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema as any), mode: 'onChange' });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const onSubmit = async ({ email }: FormData) => {
    setFeedback(null);
    try {
      await requestPasswordReset(email);
      setFeedback({
        type: 'success',
        message:
          'Hemos enviado un correo con un enlace para crear una nueva contraseña. El enlace es válido por 30 minutos.',
      });
      reset();
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error?.message || 'No se pudo enviar el correo de recuperación.',
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-primary text-3xl font-bold">Recuperar contraseña</h1>
        <p className="text-base-content mt-2">
          Ingresa tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.
          Por seguridad, el enlace tiene una validez de 30 minutos.
        </p>
      </div>

      {feedback && (
        <div
          className={clsx(
            'alert mt-4',
            feedback.type === 'success' ? 'alert-success' : 'alert-error'
          )}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-control w-full">
          <label className="label mb-2">
            <span className="label-text font-medium">Correo electrónico</span>
          </label>
          <input
            type="email"
            className={clsx('input input-bordered w-full', { 'input-error': !!errors.email })}
            placeholder="tu@correo.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Te enviaremos un enlace de recuperación.
              </span>
            </label>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando correo…' : 'Enviar correo de recuperación'}
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
