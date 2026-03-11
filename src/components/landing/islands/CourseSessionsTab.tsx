import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSlotsByCourseAcronym } from '@/client/courses';

interface SlotFromApi {
  id: number;
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality: string;
  studentsGroup?: string;
  maxStudents: number;
  confirmedReservations?: number;
  pendingReservations?: number;
  professor?: { id: number; name: string };
}

interface ClassWithSlots {
  title: string;
  slots: SlotFromApi[];
}

interface CourseSessionsTabProps {
  courseAcronym: string;
  courseTitle: string;
}

function getAvailableSeats(slot: SlotFromApi): number {
  const taken = (slot.confirmedReservations ?? 0) + (slot.pendingReservations ?? 0);
  return Math.max(0, (slot.maxStudents ?? 0) - taken);
}

export default function CourseSessionsTab({ courseAcronym, courseTitle }: CourseSessionsTabProps) {
  const [classesData, setClassesData] = useState<ClassWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSlotsByCourseAcronym(courseAcronym)
      .then((data: { classes: ClassWithSlots[] }) => {
        if (!mounted) return;
        setClassesData(data.classes ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseAcronym]);

  const sortedClasses = useMemo(() => {
    return classesData
      .filter((c) => c.slots.length > 0)
      .map((c) => ({
        ...c,
        slots: [...c.slots].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.slots[0]?.startTime ?? 0).getTime();
        const dateB = new Date(b.slots[0]?.startTime ?? 0).getTime();
        return dateA - dateB;
      });
  }, [classesData]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (sortedClasses.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No hay sesiones disponibles para este curso en este momento.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedClasses.map((classData) => (
        <section key={classData.title}>
          <h4 className="text-base-content/80 mb-3 text-base font-semibold">{classData.title}</h4>
          <div className="space-y-3">
            {classData.slots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              const available = getAvailableSeats(slot);
              const modalityLabel = slot.modality === 'remote' ? 'Online' : 'Presencial';
              const groupLabel = slot.studentsGroup === 'private' ? 'Particular' : 'Grupal';
              return (
                <div
                  key={slot.id}
                  className="card border-base-300 bg-base-100 flex flex-row items-stretch gap-4 border p-4 shadow-sm"
                >
                  <div className="bg-base-200 flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-2 text-center">
                    <span className="text-base-content/70 text-xs font-medium uppercase">
                      {format(start, 'EEE', { locale: es })}
                    </span>
                    <span className="text-primary text-2xl leading-none font-bold">
                      {format(start, 'd')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{classData.title}</p>
                    <p className="text-base-content/70 text-sm">
                      {format(start, 'HH:mm', { locale: es })} –{' '}
                      {format(end, 'HH:mm', { locale: es })}
                      {' · '}
                      {modalityLabel}
                      {' · '}
                      {groupLabel}
                      {slot.professor?.name && ` · ${slot.professor.name}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    <p className="text-base-content/70 text-right text-sm">
                      <span className="font-medium">{available}</span> disponibles /{' '}
                      {slot.maxStudents} totales
                      {(slot.pendingReservations ?? 0) > 0 && (
                        <span className="block text-xs">
                          ({slot.pendingReservations} pendientes)
                        </span>
                      )}
                    </p>
                    <a
                      href={`/checkout?courseAcronym=${encodeURIComponent(courseAcronym)}&slotId=${slot.id}`}
                      className={`btn btn-primary btn-sm ${available <= 0 ? 'btn-disabled' : ''}`}
                    >
                      Inscribirse
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
