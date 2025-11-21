import React, { useState } from 'react';
import { registerUser } from '@client/auth';
import { useForm, Controller } from 'react-hook-form';
import clsx from 'clsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import phoneSchema from './lib/numberhelper';
import rutSchema from './lib/rutValidator';
import { formatPhoneInput, formatRutInput } from './lib/formatters';
import { useEffect } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { useNavigate } from 'react-router';

const signUpSchema = z
  .object({
    email: z.email('Ingresa un correo válido.').min(1, 'El correo es obligatorio.'),
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
    confirmed_password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
    phone: phoneSchema,
    rut: rutSchema,
    name: z.string(),
  })
  .refine((data) => data.password === data.confirmed_password, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmed_password'],
  });

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { handleToken } = useSessionContext();
  const navigate = useNavigate();
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

  const {
    register,
    control,
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
        // After successful registration, redirect to a page that tells the user
        // to check their email for a confirmation link.
        window.location.href = '/check-email';
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
          type="text"
          {...register('name')}
          placeholder="Nombre completo"
          className={clsx('input input-bordered w-full', { 'input-error': errors.name })}
        />
        {errors.name && <span className="text-error text-xs">{errors.name.message}</span>}
        <Controller
          control={control}
          name="rut"
          render={({ field }) => (
            <input
              type="text"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const formatted = formatRutInput(e.target.value);
                field.onChange(formatted);
              }}
              placeholder="RUT (ej: 12.345.678-9)"
              className={clsx('input input-bordered w-full', { 'input-error': errors.rut })}
            />
          )}
        />
        {errors.rut && <span className="text-error text-xs">{errors.rut.message}</span>}
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
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <input
              type="tel"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const formatted = formatPhoneInput(e.target.value);
                field.onChange(formatted);
              }}
              placeholder="Teléfono (+569XXXXXXXX)"
              className={clsx('input input-bordered w-full', { 'input-error': errors.phone })}
              autoComplete="tel"
            />
          )}
        />
        {errors.phone && <span className="text-error text-xs">{errors.phone.message}</span>}
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Registrandote...' : 'Regístrate'}
        </button>
        <div className="text-error mt-2 min-h-[1.5em] text-sm">{feedback}</div>
      </form>
      <div className="mt-6 text-center">
        <span>¿Ya tienes cuenta?</span>
        <a href="/ingresar" className="link link-primary ml-2">
          Ingresa
        </a>
      </div>
    </>
  );
}
