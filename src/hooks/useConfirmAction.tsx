import { useState, useCallback } from 'react';

interface ConfirmActionOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDangerous?: boolean;
}

interface UseConfirmActionReturn {
  showConfirmation: (options: ConfirmActionOptions) => void;
  ConfirmationModal: React.FC;
  isOpen: boolean;
  closeModal: () => void;
}

export function useConfirmAction(): UseConfirmActionReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmActionOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showConfirmation = useCallback((options: ConfirmActionOptions) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setTimeout(() => setConfig(null), 200);
  }, []);

  const handleConfirm = async () => {
    if (!config) return;

    setIsLoading(true);
    try {
      await config.onConfirm();
      closeModal();
    } catch (error) {
      console.error('Error during confirmation action:', error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (config?.onCancel) {
      config.onCancel();
    }
    closeModal();
  };

  const ConfirmationModal: React.FC = () => {
    if (!config || !isOpen) return null;

    return (
      <dialog open className="modal modal-bottom sm:modal-middle z-40">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">{config.title || '¿Estás seguro?'}</h3>
          <p className="py-4">{config.message}</p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {config.cancelText || 'Cancelar'}
            </button>
            <button
              type="button"
              className={`btn ${config.isDangerous ? 'btn-error' : 'btn-primary'}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading && <span className="loading loading-spinner loading-sm" />}
              {config.confirmText || 'Continuar'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={handleCancel}>
          <button type="button">close</button>
        </form>
      </dialog>
    );
  };

  return {
    showConfirmation,
    ConfirmationModal,
    isOpen,
    closeModal,
  };
}
