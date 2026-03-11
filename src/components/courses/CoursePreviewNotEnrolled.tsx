import { Link } from 'react-router';
import { ShoppingCart, Package } from 'lucide-react';
import type { ICourse } from '@/interfaces';
import { CoursePreviewContent } from './CoursePreviewContent';

interface CoursePreviewNotEnrolledProps {
  course: ICourse;
}

export function CoursePreviewNotEnrolled({ course }: CoursePreviewNotEnrolledProps) {
  const acronym = course.acronym ?? '';

  return (
    <div className="space-y-6">
      <div className="card border-2 border-primary/20 bg-primary/5">
        <div className="card-body">
          {course.description && (
            <p className="text-base-content/80 mb-4">{course.description}</p>
          )}
          <p className="text-base-content/80 mb-4 text-sm">
            Inscríbete o compra un plan para acceder a las clases y al material.
          </p>
          <div className="card-actions flex-wrap gap-2">
            <Link to={`/checkout?courseAcronym=${encodeURIComponent(acronym)}`} className="btn btn-primary gap-2">
              <ShoppingCart className="h-4 w-4" />
              Comprar plan
            </Link>
            <Link to="/app/planes" className="btn btn-outline gap-2">
              <Package className="h-4 w-4" />
              Ver planes y pagos
            </Link>
          </div>
        </div>
      </div>

      <CoursePreviewContent course={course} />
    </div>
  );
}
