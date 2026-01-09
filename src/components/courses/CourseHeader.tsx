import { BookOpen, Loader2 } from 'lucide-react';
import type { ICourse } from '@/interfaces/models';

interface CourseHeaderProps {
  course: ICourse | null;
  loading?: boolean;
}

export function CourseHeader({ course, loading }: CourseHeaderProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-base-content ml-3">Cargando curso...</span>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-primary/10 text-primary rounded-xl p-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <h1 className="card-title text-primary text-3xl font-bold">{course.title}</h1>
            <span className="badge badge-secondary badge-soft">{course.acronym}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
