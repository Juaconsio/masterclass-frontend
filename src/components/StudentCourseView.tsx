import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { XCircle } from 'lucide-react';
import { fetchStudentCourseById, getCourseEnroll } from '@client/courses';
import { fetchReservations } from '@client/reservations';
import { getMyPurchases, type StudentPlanPurchase } from '@client/purchases';
import {
  CourseHeader,
  CourseInfo,
  CourseClasses,
  CoursePreviewNotEnrolled,
  CoursePreviewContent,
} from '@/components/courses';
import { useBreadCrumbRoute } from '@/context/BreadCrumbRouteContext';
import type { ICourse, IReservation } from '@/interfaces';

type TabType = 'info' | 'classes' | 'preview' | 'reservations';

const StudentCourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const setBreadCrumbRoute = useBreadCrumbRoute()?.setBreadCrumbRoute;
  const id = courseId ? Number(courseId) : NaN;

  const tabFromUrl = searchParams.get('tab');
  const validTab: TabType =
    tabFromUrl === 'classes' || tabFromUrl === 'info' || tabFromUrl === 'preview'
      ? tabFromUrl
      : 'info';

  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(validTab);
  const [myReservations, setMyReservations] = useState<IReservation[]>([]);
  const [myPurchases, setMyPurchases] = useState<StudentPlanPurchase[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchData = async () => {
    if (!id || Number.isNaN(id)) return;
    setLoading(true);
    setError('');
    try {
      const [courseData, reservationsData, purchasesData] = await Promise.all([
        fetchStudentCourseById(id),
        fetchReservations(),
        getMyPurchases(),
      ]);
      setCourse(courseData);
      setMyReservations(reservationsData ?? []);
      const coursePurchases = (purchasesData ?? []).filter(
        (p) => p.pricingPlan?.course?.id === id
      );
      setMyPurchases(coursePurchases);
      setIsEnrolled(true);
    } catch (_) {
      try {
        const enroll = await getCourseEnroll({ courseId: id });
        setCourse(enroll.course as ICourse);
        setMyReservations([]);
        setMyPurchases([]);
        setIsEnrolled(false);
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar el curso.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  useEffect(() => {
    setActiveTab(validTab);
  }, [validTab]);

  useEffect(() => {
    if (!setBreadCrumbRoute) return;
    if (course) {
      setBreadCrumbRoute(
        { id: course.id, acronym: course.acronym ?? '', title: course.title ?? '' },
        null
      );
    }
    return () => setBreadCrumbRoute(null, null);
  }, [course, setBreadCrumbRoute]);

  return (
    <div className="bg-base-100 min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {error && (
          <div className="alert alert-error shadow-lg">
            <XCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        <CourseHeader course={course} loading={loading} />

        {!loading && course && !isEnrolled && <CoursePreviewNotEnrolled course={course} />}

        {!loading && course && isEnrolled && (
          <>
            <div className="tabs tabs-boxed bg-base-200">
              <button
                className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Información General
              </button>
              <button
                className={`tab ${activeTab === 'classes' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('classes')}
              >
                Clases ({course.classes?.length || 0})
              </button>
              <button
                className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Resumen del curso
              </button>
            </div>

            <div className="card">
              <div className="card-body">
                {activeTab === 'info' && (
                  <CourseInfo
                    description={course.description}
                    professors={course.professors}
                    classCount={course.classes?.length || 0}
                  />
                )}

                {activeTab === 'classes' && (
                  <CourseClasses
                    classes={course.classes}
                    loading={loading}
                    reservations={myReservations}
                    coursePurchases={myPurchases}
                  />
                )}

                {activeTab === 'preview' && <CoursePreviewContent course={course} />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCourseView;
