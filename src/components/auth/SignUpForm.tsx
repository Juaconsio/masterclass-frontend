import React, { useState } from 'react';
import { getToken } from '@client/auth';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

interface FormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [feedback, setFeedback] = useState('');

  const onSubmit = async (data: FormData) => {
    setFeedback('');
    try {
      const res = await getToken(data);
      if (res.ok) {
        window.location.href = '/home';
      } else {
        setFeedback('Credenciales incorrectas o error de servidor. ' + res.message);
      }
    } catch {
      setFeedback('Error de red o servidor.');
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
        <div className="text-error mt-2 min-h-[1.5em] text-sm">{feedback}</div>
      </form>
      <div className="mt-6 text-center">
        <span>¿Ya tienes cuenta?</span>
        <a href="/auth/signIn" className="link link-primary ml-2">
          Regístrate
        </a>
      </div>
    </>
  );
}
