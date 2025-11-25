import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getMe, updateMe } from '@/client/students';
import { updatePassword } from '@/client/auth';
import type { IStudent } from '@/interfaces/models';
import { formatPhone, formatPhoneInput } from '@/lib/formatPhone';

type ProfileFormData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FeedbackType = {
  message: string;
  type: 'success' | 'error';
} | null;

function ProfileView({ data, onEdit }: { data: Partial<IStudent>; onEdit: () => void }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="card-title text-2xl">Información Personal</h2>
        <button className="btn btn-primary btn-sm" onClick={onEdit}>
          Editar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text font-semibold">Nombre</span>
          </label>
          <p className="text-lg">{data.name}</p>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Email</span>
          </label>
          <p className="text-lg">{data.email}</p>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Teléfono</span>
          </label>
          <p className="text-lg">{formatPhone(data.phone) || 'No especificado'}</p>
        </div>
      </div>
    </>
  );
}

function ProfileEditForm({
  data,
  onCancel,
  onSuccess,
  setFeedback,
}: {
  data: Partial<IStudent>;
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
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: (data as any).address || '',
    },
  });

  const phoneValue = watch('phone');

  const onSubmit = async (formData: ProfileFormData) => {
    if (!formData.name.trim()) {
      setError('name', { message: 'El nombre es requerido' });
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('email', { message: 'Email inválido' });
      return;
    }

    try {
      await updateMe({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
      });

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
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Nombre</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
            placeholder="Ingresa tu nombre completo"
            {...register('name')}
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.name.message}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            placeholder="ejemplo@correo.com"
            {...register('email')}
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email.message}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Teléfono</span>
            <span className="label-text-alt text-base-content/60">Opcional</span>
          </label>
          <input
            type="tel"
            className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
            value={phoneValue || ''}
            onChange={(e) => {
              const formatted = formatPhoneInput(e.target.value);
              setValue('phone', formatted);
            }}
            placeholder="+56 9 1234 5678"
            maxLength={17}
          />
          {errors.phone ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.phone.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60">Formato chileno</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Dirección</span>
            <span className="label-text-alt text-base-content/60">Opcional</span>
          </label>
          <textarea
            className={`textarea textarea-bordered w-full ${errors.address ? 'textarea-error' : ''}`}
            placeholder="Ingresa tu dirección"
            {...register('address')}
            rows={3}
          />
          {errors.address && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.address.message}</span>
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
  } = useForm<PasswordFormData>();

  const onSubmit = async (formData: PasswordFormData) => {
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

export default function StudentProfile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileData, setProfileData] = useState<Partial<IStudent> | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  async function fetchProfile() {
    try {
      const userData = await getMe();
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: (userData as any).address || '',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      <h1 className="mb-8 text-3xl font-bold">Mi Perfil</h1>

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
            <ProfileView data={profileData} onEdit={() => setIsEditingProfile(true)} />
          ) : (
            <ProfileEditForm
              data={profileData}
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
