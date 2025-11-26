import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { formatPhone, formatPhoneInput } from '@/lib/formatPhone';
import { updatePassword } from '@/client/auth';

type FeedbackType = {
  message: string;
  type: 'success' | 'error';
} | null;

type ProfileField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  rows?: number;
  maxLength?: number;
  format?: 'phone';
  helpText?: string;
  readOnly?: boolean;
};

type ProfileConfig = {
  title: string;
  fields: ProfileField[];
  fetchProfile: () => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
};

function ProfileView({
  data,
  config,
  onEdit,
}: {
  data: Record<string, any>;
  config: ProfileConfig;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="card-title text-2xl">Información Personal</h2>
        <button className="btn btn-primary btn-sm" onClick={onEdit}>
          Editar
        </button>
      </div>

      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="label">
              <span className="label-text font-semibold">{field.label}</span>
            </label>
            <p className="text-lg whitespace-pre-wrap">
              {field.format === 'phone'
                ? formatPhone(data[field.name]) || 'No especificado'
                : data[field.name] || 'No especificado'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function ProfileEditForm({
  data,
  config,
  onCancel,
  onSuccess,
  setFeedback,
}: {
  data: Record<string, any>;
  config: ProfileConfig;
  onCancel: () => void;
  onSuccess: () => void;
  setFeedback: (feedback: FeedbackType) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<any>({
    defaultValues: config.fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: data[field.name] || '',
      }),
      {}
    ),
  });

  const watchedFields = watch();

  const onSubmit = async (formData: any) => {
    for (const field of config.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        setError(field.name, { message: `${field.label} es requerido` });
        return;
      }

      if (field.type === 'email' && formData[field.name]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
          setError(field.name, { message: 'Email inválido' });
          return;
        }
      }
    }

    try {
      const payload = config.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: formData[field.name] || null,
        }),
        {}
      );

      await config.updateProfile(payload);
      setFeedback({ message: 'Perfil actualizado correctamente', type: 'success' });
      onSuccess();
    } catch (error: any) {
      setFeedback({
        message: error.message || 'No se pudo actualizar el perfil',
        type: 'error',
      });
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="card-title text-2xl">Editar Información Personal</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {config.fields.map((field) => {
          if (field.readOnly) {
            return (
              <div key={field.name} className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>
                  {field.label} no puede ser modificado. Contacta al administrador del sistema.
                </span>
              </div>
            );
          }

          const isTextarea = field.type === 'textarea';
          const inputClass = isTextarea ? 'textarea' : 'input';
          const errorClass = errors[field.name]
            ? isTextarea
              ? 'textarea-error'
              : 'input-error'
            : '';

          return (
            <div key={field.name} className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">{field.label}</span>
                {field.optional && (
                  <span className="label-text-alt text-base-content/60">Opcional</span>
                )}
              </label>

              {isTextarea ? (
                <textarea
                  className={`${inputClass} ${inputClass}-bordered w-full ${errorClass}`}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  {...register(field.name)}
                />
              ) : field.format === 'phone' ? (
                <input
                  type={field.type}
                  className={`${inputClass} ${inputClass}-bordered w-full ${errorClass}`}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={watchedFields[field.name] || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneInput(e.target.value);
                    setValue(field.name, formatted);
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  className={`${inputClass} ${inputClass}-bordered w-full ${errorClass}`}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  {...register(field.name)}
                />
              )}

              {errors[field.name] ? (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors[field.name]?.message as string}
                  </span>
                </label>
              ) : field.helpText ? (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">{field.helpText}</span>
                </label>
              ) : null}
            </div>
          );
        })}

        <div className="divider"></div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn btn-ghost sm:btn-wide"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary sm:btn-wide" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
            Guardar Cambios
          </button>
        </div>
      </form>
    </>
  );
}

function PasswordChangeForm({
  onCancel,
  onSuccess,
  setFeedback,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  setFeedback: (feedback: FeedbackType) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const onSubmit = async (formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!formData.currentPassword) {
      setError('currentPassword', { message: 'La contraseña actual es requerida' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('newPassword', { message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('confirmPassword', { message: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFeedback({ message: 'Contraseña actualizada correctamente', type: 'success' });
      reset();
      onSuccess();
    } catch (error: any) {
      setFeedback({
        message: error.message || 'No se pudo actualizar la contraseña',
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Contraseña Actual</span>
        </label>
        <input
          type="password"
          className={`input input-bordered w-full ${errors.currentPassword ? 'input-error' : ''}`}
          placeholder="••••••••"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.currentPassword.message}</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Nueva Contraseña</span>
        </label>
        <input
          type="password"
          className={`input input-bordered w-full ${errors.newPassword ? 'input-error' : ''}`}
          placeholder="••••••••"
          {...register('newPassword')}
        />
        {errors.newPassword ? (
          <label className="label">
            <span className="label-text-alt text-error">{errors.newPassword.message}</span>
          </label>
        ) : (
          <label className="label">
            <span className="label-text-alt text-base-content/60">Mínimo 6 caracteres</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Confirmar Nueva Contraseña</span>
        </label>
        <input
          type="password"
          className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
          </label>
        )}
      </div>

      <div className="divider"></div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn btn-ghost sm:btn-wide"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-secondary sm:btn-wide" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
          Actualizar Contraseña
        </button>
      </div>
    </form>
  );
}

export default function BaseProfile({ config }: { config: ProfileConfig }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, any> | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  async function fetchProfile() {
    try {
      const userData = await config.fetchProfile();
      const data = config.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: userData[field.name] || '',
        }),
        {}
      );
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setFeedback({
        message: 'No se pudo cargar el perfil',
        type: 'error',
      });
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSuccess = () => {
    setIsEditingProfile(false);
    fetchProfile();
  };

  const handlePasswordSuccess = () => {
    setIsEditingPassword(false);
  };

  if (!profileData) {
    return (
      <div className="container mx-auto max-w-4xl p-4 lg:p-8">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 lg:p-8">
      <h1 className="mb-8 text-3xl font-bold">{config.title}</h1>

      {feedback && (
        <div
          className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            {feedback.type === 'success' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
          <span>{feedback.message}</span>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setFeedback(null)}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          {!isEditingProfile ? (
            <ProfileView
              data={profileData}
              config={config}
              onEdit={() => setIsEditingProfile(true)}
            />
          ) : (
            <ProfileEditForm
              data={profileData}
              config={config}
              onCancel={() => setIsEditingProfile(false)}
              onSuccess={handleProfileSuccess}
              setFeedback={setFeedback}
            />
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="card-title text-2xl">Cambiar Contraseña</h2>
            {!isEditingPassword && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditingPassword(true)}
              >
                Cambiar
              </button>
            )}
          </div>

          {!isEditingPassword ? (
            <p className="text-base-content/70">
              Haz clic en "Cambiar" para actualizar tu contraseña
            </p>
          ) : (
            <PasswordChangeForm
              onCancel={() => setIsEditingPassword(false)}
              onSuccess={handlePasswordSuccess}
              setFeedback={setFeedback}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type { ProfileConfig, ProfileField };
