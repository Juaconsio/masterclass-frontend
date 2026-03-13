import React, { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Paperclip, CloudUpload, XCircle } from 'lucide-react';
import clsx from 'clsx';

/** Backend expects a material "type" (filename) for validation; we derive it from the file when not replacing. */
function materialTypeFromFile(file: File): string {
  return file.type.startsWith('video/') ? 'videos' : 'contenido';
}

interface FileInputProps {
  acceptedFileTypes: string[];
  /** Receives file, type (derived or fixed), and display name. */
  onFileUpload: (file: File, type: string, displayName: string) => Promise<void>;
  maxSizeMB?: number;
  buttonText?: string;
  modalTitle?: string;
  /** Initial value for the "Nombre para mostrar" field (e.g. when replacing). */
  initialDisplayName?: string;
  /** When replacing, the existing material type is passed so the backend receives the same type. */
  fixedType?: string;
  customButton?: React.ReactNode;
}

/**
 * File upload component with drag and drop and modal. User must enter a display name for the material (Material.displayName).
 */
export default function FileInput({
  acceptedFileTypes,
  onFileUpload,
  maxSizeMB = 10,
  buttonText = 'Upload File',
  modalTitle = 'Upload File',
  initialDisplayName = '',
  customButton,
  fixedType,
}: FileInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(fixedType || null);
  const [displayName, setDisplayName] = useState('');
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
    setSelectedType(fixedType || null);
    setDisplayName(initialDisplayName);
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
    setSelectedFile(null);
    setSelectedType(null);
    setDisplayName('');
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
      if (!fixedType) setSelectedType(materialTypeFromFile(file));
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
      if (!fixedType) setSelectedType(materialTypeFromFile(file));
    }

    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return;
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('Escribe un nombre para mostrar del material.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Subiendo archivo...');
      setError(null);

      await onFileUpload(selectedFile, selectedType, trimmedName);
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
      {customButton ? (
        <div onClick={openModal}>{customButton}</div>
      ) : (
        <button type="button" onClick={openModal} className="btn btn-primary btn-xs">
          <Paperclip className="mr-1 h-4 w-4" />
          <span className="w-full">{buttonText}</span>
        </button>
      )}

      <dialog ref={modalRef} className="modal">
        <div className="modal-box relative max-w-2xl">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="bg-base-100/80 absolute inset-0 z-50 flex size-full flex-col items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
              </div>
            </div>
          )}

          <h3 className="mb-4 text-lg font-bold">{modalTitle}</h3>

          <div className="fieldset mb-4">
            <label className="label" htmlFor="material-display-name">
              <span className="label-text font-semibold">Nombre para mostrar</span>
            </label>
            <input
              id="material-display-name"
              type="text"
              placeholder="Ej: Guía de ejercicios, Apuntes tema 1..."
              className="input input-bordered w-full"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-base-content/60 label-text-alt mt-1">
              Este nombre se mostrará a los estudiantes en lugar del nombre del archivo.
            </p>
          </div>

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
              disabled={!selectedFile || !selectedType || !displayName.trim() || isLoading}
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
