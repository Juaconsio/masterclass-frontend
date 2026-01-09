import { Calendar } from 'lucide-react';
import type { IClass } from '@/interfaces/events/IEvent';
import { Link } from 'react-router';

interface CourseClassesProps {
  classes?: IClass[];
  loading?: boolean;
}

/**
 * Course classes component showing student's classes for the course
 * @param classes - List of classes
 * @param loading - Loading state
 */
export function CourseClasses({ classes = [], loading = false }: CourseClassesProps) {
  // TODO: Fetch classes for this course
  // This will need to be implemented when the API endpoint is ready
  if (!classes || classes.length === 0) {
    return (
      <div className="bg-base-200 card">
        <div className="card-body items-center text-center">
          <Calendar className="text-base-content/40 h-8 w-8" />
          <p className="text-base-content/70">No se encontraron clases disponibles.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {classes.map((cls) => {
        return (
          <div key={cls.id} className="border-base-300 border">
            <div className="text-lg font-medium">
              <div className="card transition-all hover:shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-secondary flex items-start justify-between">
                    <span className="line-clamp-2">{cls.title}</span>
                  </h3>
                  <p className="text-base-content/70 line-clamp-3 text-sm">
                    {cls.description || 'Sin descripción disponible'}
                  </p>
                  <div className="card-actions justify-end">
                    <Link to={`clases/${cls.id}`} className="btn btn-primary">
                      Ver más
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
