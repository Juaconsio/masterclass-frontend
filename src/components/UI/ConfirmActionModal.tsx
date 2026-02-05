import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface ConfirmActionModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export interface ConfirmActionModalRef {
  open: () => void;
  close: () => void;
}

export const ConfirmActionModal = forwardRef<ConfirmActionModalRef, ConfirmActionModalProps>(
  (
    {
      title = '¿Estás seguro?',
      message,
      confirmText = 'Continuar',
      cancelText = 'Cancelar',
      onConfirm,
      onCancel,
      isDangerous = false,
      isLoading = false,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.showModal(),
      close: () => modalRef.current?.close(),
    }));

    const handleOnCancel = () => {
      onCancel?.();
      modalRef.current?.close();
    };

    return (
      <>
        <dialog
          ref={modalRef}
          className="modal modal-bottom sm:modal-middle"
          id="confirm-action-modal"
        >
          <div className="modal-box">
            <h3 className="mb-4 text-lg font-bold">{title}</h3>
            <p className="text-base-content/80 py-4">{message}</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleOnCancel}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${isDangerous ? 'btn-error' : 'btn-primary'}`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading && <span className="loading loading-spinner loading-sm" />}
                {confirmText}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleOnCancel}>close</button>
          </form>
        </dialog>
      </>
    );
  }
);
