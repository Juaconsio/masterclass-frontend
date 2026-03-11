import { useState, useEffect } from 'react';
import { fetchPublicCoursePlans } from '@/client/publicCourses';
import type { ICourse } from '@/interfaces';
import { CoursePlanCard } from './CoursePlanCard';
import { ClassesPreviewList } from './ClassesPreviewList';
import CourseProfessorsSection from '@/components/landing/islands/CourseProfessorsSection';
import CourseSessionsTab from '@/components/landing/islands/CourseSessionsTab';
import type { PublicCoursePlan } from '@/client/publicCourses';

interface CoursePreviewContentProps {
  course: ICourse;
}

type TabType = 'preview' | 'sessions';

export function CoursePreviewContent({ course }: CoursePreviewContentProps) {
  const [plans, setPlans] = useState<PublicCoursePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  const acronym = course.acronym ?? '';
  const courseId = course.id;

  useEffect(() => {
    let mounted = true;
    if (!acronym) {
      setPlansLoading(false);
      return;
    }
    fetchPublicCoursePlans(acronym)
      .then((res) => {
        if (!mounted) return;
        setPlans(res?.plans ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans([]);
      })
      .finally(() => {
        if (!mounted) return;
        setPlansLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [acronym]);

  const sortedPlans = [...plans].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return (b.reservationCount ?? 0) - (a.reservationCount ?? 0);
  });

  return (
    <div className="space-y-6">
      {plansLoading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : sortedPlans.length > 0 ? (
        <section>
          <h3 className="text-base-content/80 mb-3 text-sm font-semibold uppercase tracking-wider">
            Planes disponibles
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {sortedPlans.map((plan) => (
              <CoursePlanCard
                key={plan.id}
                plan={{
                  id: plan.id,
                  name: plan.name,
                  description: plan.description,
                  price: plan.price,
                  reservationCount: plan.reservationCount,
                  accessMode: plan.accessMode,
                }}
                courseAcronym={acronym}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
        <div className="space-y-4 md:col-span-5">
          <div className="tabs tabs-boxed bg-base-200">
            <button
              type="button"
              className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Vista previa de clases
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'sessions' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Próximas sesiones
            </button>
          </div>
          <div className="card border">
            <div className="card-body">
              {activeTab === 'preview' && <ClassesPreviewList courseId={courseId} />}
              {activeTab === 'sessions' && (
                <CourseSessionsTab courseAcronym={acronym} courseTitle={course.title ?? ''} />
              )}
            </div>
          </div>
        </div>
        <aside className="md:col-span-2 md:sticky md:top-24 md:self-start">
          <CourseProfessorsSection courseAcronym={acronym} />
        </aside>
      </div>
    </div>
  );
}
