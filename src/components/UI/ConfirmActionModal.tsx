import React, { useRef } from 'react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export function ConfirmActionModal({
  title = '¿Estás seguro?',
  message,
  confirmText = 'Continuar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
}: ConfirmActionModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const handleOnCancel = () => {
    onCancel();
    modalRef.current?.close();
  };
  return (
    <>
      <input
        type="checkbox"
        id="confirm-action-modal"
        className="modal-toggle"
        checked={modalRef.current?.open ?? false}
        onClick={() => modalRef.current?.showModal()}
        readOnly
      />
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
        <label className="modal-backdrop" htmlFor="confirm-action-modal" onClick={handleOnCancel}>
          Close
        </label>
      </dialog>
    </>
  );
}
