import { Calendar, Lock, CheckCircle } from 'lucide-react';
import type { IClass } from '@/interfaces/events/IEvent';
import type { IReservation } from '@/interfaces';
import { Link } from 'react-router';

interface CourseClassesProps {
  classes?: IClass[];
  loading?: boolean;
  reservations?: IReservation[];
}

export function CourseClasses({
  classes = [],
  loading = false,
  reservations = [],
}: CourseClassesProps) {
  const hasAccessToClass = (classId: number): boolean => {
    return reservations.some((reservation) => {
      const hasMatchingSlot = reservation.slot?.classId === classId;
      const isConfirmed = reservation.status === 'confirmed';
      const isPaid = reservation.payment?.status === 'paid';

      return hasMatchingSlot && isConfirmed && isPaid;
    });
  };

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
        const hasAccess = hasAccessToClass(cls.id);

        return (
          <div key={cls.id} className="border-base-300 border">
            <div className="text-lg font-medium">
              <div className="card transition-all hover:shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-secondary flex items-start justify-between">
                    <span className="line-clamp-2 flex-1">{cls.title}</span>
                    {hasAccess ? (
                      <div className="badge badge-success gap-2 whitespace-nowrap">
                        <CheckCircle className="h-3 w-3" />
                        Con acceso
                      </div>
                    ) : (
                      <div className="badge badge-ghost gap-2 whitespace-nowrap">
                        <Lock className="h-3 w-3" />
                        Sin acceso
                      </div>
                    )}
                  </h3>
                  <p className="text-base-content/70 line-clamp-3 text-sm">
                    {cls.description || 'Sin descripción disponible'}
                  </p>
                  <div className="card-actions justify-end">
                    {hasAccess ? (
                      (cls as any).hasMaterials ? (
                        <Link to={`clases/${cls.id}`} className="btn btn-primary">
                          Ver materiales
                        </Link>
                      ) : (
                        <div className="text-base-content/60 text-sm">
                          Esta clase aún no tiene materiales disponibles
                        </div>
                      )
                    ) : (
                      <div className="text-base-content/60 text-sm">
                        Reserva la clase para acceder a los materiales
                      </div>
                    )}
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
