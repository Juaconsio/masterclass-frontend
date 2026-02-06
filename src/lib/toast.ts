import toast from 'react-hot-toast';

/**
 * Toast notification helper with DaisyUI color scheme
 *
 * Usage:
 * ```ts
 * import { showToast } from '@/lib/toast';
 *
 * // Simple notifications
 * showToast.success('Cambios guardados');
 * showToast.error('Error al guardar');
 * showToast.loading('Cargando...');
 *
 * // Promise-based (shows loading, then success/error)
 * showToast.promise(
 *   myAsyncFunction(),
 *   {
 *     loading: 'Guardando...',
 *     success: 'Guardado correctamente',
 *     error: 'Error al guardar'
 *   }
 * );
 * ```
 */

const toastConfig = {
  success: {
    duration: 4000,
    style: {
      background: 'oklch(0.78 0.15 150)',
      color: 'white',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'oklch(0.78 0.15 150)',
    },
  },
  error: {
    duration: 6000,
    style: {
      background: 'oklch(0.65 0.19 25)',
      color: 'white',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'oklch(0.65 0.19 25)',
    },
  },
  loading: {
    style: {
      background: 'oklch(0.78 0.09 250)',
      color: 'white',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'oklch(0.78 0.09 250)',
    },
  },
};

export const showToast = {
  success: (message: string) => toast.success(message, toastConfig.success),
  error: (message: string) => toast.error(message, toastConfig.error),
  loading: (message: string) => toast.loading(message, toastConfig.loading),
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) =>
    toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
      }
    ),
};
