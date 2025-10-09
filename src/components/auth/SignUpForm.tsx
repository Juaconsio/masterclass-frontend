import React, { useState } from 'react';
import { registerUser } from '@client/auth';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import phoneSchema from './lib/numberhelper';
import { useSessionContext } from '../../context/SessionContext';
import { useAuth } from '../../hooks/useAuth';

const signUpSchema = z
  .object({
    email: z.email('Ingresa un correo válido.').min(1, 'El correo es obligatorio.'),
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
    confirmed_password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmed_password, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmed_password'],
  });

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { setUser } = useSessionContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema as any),
  });

  const [feedback, setFeedback] = useState('');

  const onSubmit = async (data: FormData) => {
    setFeedback('');
    try {
      const { ok } = await registerUser(data);
      if (ok) {
        window.location.href = '/ingresar';
      } else {
        setFeedback('  incorrectas o error de servidor.');
      }
    } catch {
      setFeedback('Error de red o servidor.');
    }
  };

  return (
    <>
      <h2 className="text-primary mb-2 text-3xl font-bold">Crea tu cuenta</h2>
      <p className="text-base-content mb-6">
        Registrate y sé parte de la comunidad. La oportunidad de aprobar esta luego de este
        formulario
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          type="email"
          {...register('email')}
          placeholder="Correo electrónico"
          className={clsx('input input-bordered w-full', { 'input-error': errors.email })}
          autoComplete="email"
        />
        {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
        <input
          type="password"
          {...register('password')}
          placeholder="Contraseña"
          className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
          autoComplete="current-password"
        />
        {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
        <input
          type="password"
          {...register('confirmed_password')}
          placeholder="Confirma tu contraseña"
          className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
        />
        {errors.confirmed_password && (
          <span className="text-error text-xs">{errors.confirmed_password.message}</span>
        )}
        <input
          type="string"
          {...register('phone')}
          placeholder="Ingresa tu número telefonico"
          className={clsx('input input-bordered w-full', { 'input-error': errors.password })}
          autoComplete="tel"
        />
        {errors.phone && <span className="text-error text-xs">{errors.phone.message}</span>}
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Registrandote...' : 'Regístrate'}
        </button>
        <div className="text-error mt-2 min-h-[1.5em] text-sm">{feedback}</div>
      </form>
      <div className="mt-6 text-center">
        <span>¿No tienes cuenta?</span>
        <a href="/auth/signUp" className="link link-primary ml-2">
          Ingresa
        </a>
      </div>
    </>
  );
}
