import { useState, useEffect } from 'react';
import { getSlotsByCourseAcronym } from '@/client/courses';

interface ProfessorFromSlot {
  id: number;
  name: string;
}

interface CourseProfessorsSectionProps {
  courseAcronym: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CourseProfessorsSection({ courseAcronym }: CourseProfessorsSectionProps) {
  const [professors, setProfessors] = useState<ProfessorFromSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSlotsByCourseAcronym(courseAcronym)
      .then((data: { classes: { slots: { professor?: { id: number; name: string } }[] }[] }) => {
        if (!mounted) return;
        const seen = new Map<number, ProfessorFromSlot>();
        (data.classes ?? []).forEach((cls) => {
          (cls.slots ?? []).forEach((slot) => {
            if (slot.professor?.id && !seen.has(slot.professor.id)) {
              seen.set(slot.professor.id, { id: slot.professor.id, name: slot.professor.name });
            }
          });
        });
        setProfessors(Array.from(seen.values()));
      })
      .catch(() => {
        if (mounted) setError('Error al cargar');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseAcronym]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">Profesores</h3>
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      </div>
    );
  }

  if (error || professors.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">Profesores</h3>
        <p className="text-base-content/60 text-sm">No hay profesores asignados aún para este curso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">Profesores</h3>
      <div className="grid gap-3">
        {professors.map((p) => (
          <div
            key={p.id}
            className="card flex flex-row items-center gap-3 border border-base-300 bg-base-100 p-3 shadow-sm"
          >
            <div className="avatar shrink-0">
              <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                {getInitials(p.name)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-base-content/70 text-sm">Tutor del curso</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
