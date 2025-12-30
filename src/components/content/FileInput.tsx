import React, { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { Paperclip, CloudUpload, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileInputProps {
  acceptedFileTypes: string[];
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  buttonText?: string;
  modalTitle?: string;
}

/**
 * File upload component with drag and drop functionality and modal interface
 * @param acceptedFileTypes - Array of accepted MIME types (e.g., ['image/*', 'application/pdf'])
 * @param onFileSelect - Callback function when a file is selected
 * @param maxSizeMB - Maximum file size in megabytes (default: 10MB)
 * @param buttonText - Text for the trigger button (default: "Upload File")
 * @param modalTitle - Title for the modal (default: "Upload File")
 */
export default function FileInput({
  acceptedFileTypes,
  onFileSelect,
  maxSizeMB = 10,
  buttonText = 'Upload File',
  modalTitle = 'Upload File',
}: FileInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      return file.type === type;
    });

    if (!isValidType) {
      setError(`File type not accepted. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      closeModal();
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
        <div className="modal-box max-w-2xl">
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
            <button type="button" onClick={closeModal} className="btn btn-ghost">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile}
              className="btn btn-primary"
            >
              Subir
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
