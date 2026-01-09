import React from 'react';
import type { IProfessor } from '@/interfaces/events/IEvent';

interface CourseInfoProps {
  description?: string;
  professors?: IProfessor[];
  classCount?: number;
}

/**
 * Course general information component
 * @param description - Course description
 * @param professors - List of course professors
 * @param classCount - Number of classes in the course
 */
export function CourseInfo({ description, professors = [], classCount = 0 }: CourseInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xl font-semibold">Descripción</h3>
        <p className="text-base-content/80">
          {description || 'Este curso no tiene descripción disponible.'}
        </p>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="mb-3 text-xl font-semibold">Información del Curso</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-base-content/60 text-sm">Total de Clases</p>
            <p className="font-medium">{classCount}</p>
          </div>
          <div>
            <p className="text-base-content/60 text-sm">Profesores</p>
            <p className="font-medium">{professors.length}</p>
          </div>
        </div>
      </div>

      {professors.length > 0 && (
        <>
          <div className="divider"></div>
          <div>
            <h3 className="mb-3 text-xl font-semibold">Profesores del Curso</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {professors.map((professor) => (
                <div key={professor.id} className="bg-base-100 card shadow">
                  <div className="card-body p-4">
                    <p className="font-semibold">{professor.name}</p>
                    <p className="text-base-content/60 text-sm">{professor.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
