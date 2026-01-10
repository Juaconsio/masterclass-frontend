import React, { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Paperclip, CloudUpload, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileInputProps {
  acceptedFileTypes: string[];
  onFileUpload: (file: File) => Promise<void>;
  maxSizeMB?: number;
  buttonText?: string;
  modalTitle?: string;
}

/**
 * File upload component with drag and drop functionality and modal interface
 * @param acceptedFileTypes - Array of accepted MIME types (e.g., ['image/*', 'application/pdf'])
 * @param onFileUpload - Callback function when a file is selected
 * @param maxSizeMB - Maximum file size in megabytes (default: 10MB)
 * @param buttonText - Text for the trigger button (default: "Upload File")
 * @param modalTitle - Title for the modal (default: "Upload File")
 */
export default function FileInput({
  acceptedFileTypes,
  onFileUpload,
  maxSizeMB = 10,
  buttonText = 'Upload File',
  modalTitle = 'Upload File',
}: FileInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const dragCounterRef = useRef(0);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const openModal = () => {
    setIsOpen(true);
    setError(null);
    setSelectedFile(null);
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
    setSelectedFile(null);
    setIsLoading(false);
    setLoadingMessage('');
    dragCounterRef.current = 0;
    setIsDragging(false);
    modalRef.current?.close();
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    const isValidType = acceptedFileTypes.some((type) => {
      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(mainType + '/');
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      setError(
        `Este tipo de archivos no se permiten. Tipos aceptados: ${acceptedFileTypes.join(', ')}`
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Cargando archivo...');

    if (validateFile(file)) {
      setSelectedFile(file);
    }

    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Cargando archivo...');

    if (validateFile(file)) {
      setSelectedFile(file);
    }

    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Subiendo archivo...');
      setError(null);

      await onFileUpload(selectedFile);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button type="button" onClick={openModal} className="btn btn-primary btn-xs">
        <Paperclip className="mr-1 h-4 w-4" />
        <span className="w-full">{buttonText}</span>
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box relative max-w-2xl">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="bg-base-100/80 absolute inset-0 z-50 flex size-full flex-col items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="mt-4 border text-sm font-medium">{loadingMessage}</p>
              </div>
            </div>
          )}

          <h3 className="mb-4 text-lg font-bold">{modalTitle}</h3>

          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
              'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-base-300 hover:border-primary/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={acceptedFileTypes.join(',')}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <CloudUpload className="text-base-content h-16 w-16 opacity-40" />

              <div>
                <p className="text-lg font-medium">
                  {selectedFile ? selectedFile.name : 'Arrastra y suelta tu archivo aquí'}
                </p>
                <p className="text-base-content/60 mt-1 text-sm">
                  o haz clic en el botón de abajo para explorar
                </p>
              </div>

              <button type="button" onClick={handleBrowseClick} className="btn btn-outline">
                Explorar archivos
              </button>

              <div className="text-base-content/50 text-xs">
                <p>Formatos aceptados: {acceptedFileTypes.join(', ')}</p>
                <p>Tamaño máximo: {maxSizeMB}MB</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <XCircle className="h-6 w-6" />

              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Subiendo...
                </>
              ) : (
                'Subir'
              )}
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
}
