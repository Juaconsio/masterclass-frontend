import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { fetchCoursePreview, type CoursePreviewClass } from '@/client/courses';
import { MATERIAL_LABELS } from '@/components/content/MaterialLabels';

interface ClassesPreviewListProps {
  courseId: number;
}

export function ClassesPreviewList({ courseId }: ClassesPreviewListProps) {
  const [classes, setClasses] = useState<CoursePreviewClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchCoursePreview(courseId)
      .then((data) => {
        if (!mounted) return;
        setClasses(data.classes ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Error al cargar vista previa');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-base-content/80 rounded-lg border border-base-300 bg-base-200 p-4 text-sm">
        {error}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-base-content/80 rounded-lg border border-base-300 bg-base-200 p-4 text-sm">
        Este curso aún no tiene clases publicadas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((cls) => (
        <div
          key={cls.id}
          className="border-base-300 flex flex-col gap-2 rounded-lg border bg-base-200 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{cls.title}</h4>
            <span className="badge badge-ghost badge-sm gap-1">
              <Lock className="h-3 w-3" />
              Vista previa
            </span>
          </div>
          {cls.description && (
            <p className="text-base-content/80 line-clamp-3 text-sm">{cls.description}</p>
          )}
          {cls.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cls.materials.map((m) => (
                <span
                  key={m.filename}
                  className="badge badge-outline badge-sm"
                >
                  {MATERIAL_LABELS[m.filename] ?? m.filename}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
