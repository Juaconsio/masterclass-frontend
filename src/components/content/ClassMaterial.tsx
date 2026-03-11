import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getMyClassMaterials } from '@client/student/materials';
import type React from 'react';
import { useBreadCrumbRoute } from '@/context/BreadCrumbRouteContext';
import { MATERIAL_LABELS, type MaterialByType, MATERIAL_ICONS } from './MaterialLabels';
import PDFViewer from './PDFViewer';

export default function ClassMaterial() {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();
  const setBreadCrumbRoute = useBreadCrumbRoute()?.setBreadCrumbRoute;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessErrorCode, setAccessErrorCode] = useState<string | undefined>();
  const [accessErrorCourseId, setAccessErrorCourseId] = useState<number | undefined>();
  const [materialsByType, setMaterialsByType] = useState<MaterialByType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('contenido');

  useEffect(() => {
    if (!courseId || !classId) {
      navigate('/app');
      return;
    }

    let cancelled = false;

    async function loadMaterial() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getMyClassMaterials(Number(classId));
        if (cancelled) return;

        const nextMaterials = data.materials.map((mat) => ({
          type: mat.filename,
          url: mat.downloadUrl,
          mimeType: mat.mimeType,
          filename: mat.filename,
        }));

        setMaterialsByType(nextMaterials);
        setSelectedType((prev) =>
          nextMaterials.some((m) => m.type === prev) ? prev : nextMaterials[0]?.type || prev
        );

        if (setBreadCrumbRoute && data.course && data.class) {
          setBreadCrumbRoute(
            {
              id: data.course.id,
              acronym: data.course.acronym ?? '',
              title: data.course.title ?? '',
            },
            { id: data.class.id, title: data.class.title ?? '' }
          );
        }
      } catch (error: any) {
        if (cancelled) return;
        console.error('Error loading material:', error);
        if (error.response?.status === 403) {
          const data = error.response?.data || {};
          setErrorMessage(data.message || 'No tienes acceso a estos materiales.');
          setAccessErrorCode(data.code);
          setAccessErrorCourseId(data.courseId);
        } else {
          setErrorMessage('Error al cargar el material');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMaterial();
    return () => {
      cancelled = true;
      setBreadCrumbRoute?.(null, null);
    };
  }, [classId, courseId, navigate, setBreadCrumbRoute]);

  if (isLoading) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (errorMessage) {
    const isPlanNotPaid = accessErrorCode === 'PLAN_NOT_PAID';
    const isNoAccess = accessErrorCode === 'NO_ACCESS';
    const checkoutUrl =
      accessErrorCourseId != null
        ? `/checkout?courseId=${accessErrorCourseId}`
        : courseId
          ? `/checkout?courseId=${courseId}`
          : '/checkout';

    return (
      <div className="bg-base-200 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div
            className={`alert mx-auto max-w-2xl shadow-lg ${
              isPlanNotPaid ? 'alert-warning' : isNoAccess ? 'alert-info' : 'alert-error'
            }`}
          >
            <div className="flex flex-1 flex-col gap-3">
              <h3 className="font-bold">
                {isPlanNotPaid ? 'Plan pendiente de pago' : isNoAccess ? 'Sin acceso' : 'Acceso denegado'}
              </h3>
              <p className="text-sm">{errorMessage}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={courseId ? `/app/cursos/${courseId}` : '/app'}
                  className="btn btn-sm btn-ghost"
                >
                  Volver al curso
                </Link>
                {isPlanNotPaid && (
                  <span className="text-sm text-base-content/70">
                    Completa el pago con los datos que recibiste por email para activar el acceso.
                  </span>
                )}
                {isNoAccess && (
                  <Link to={checkoutUrl} className="btn btn-primary btn-sm">
                    Comprar un plan del curso
                  </Link>
                )}
                {!isPlanNotPaid && !isNoAccess && (
                  <Link to="/app" className="btn btn-sm btn-ghost">
                    Volver al portal
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && materialsByType.length === 0) {
    return (
      <div className="bg-base-200 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="alert alert-info mx-auto max-w-2xl shadow-lg">
            <div>
              <h3 className="font-bold">Sin Materiales</h3>
              <div className="text-sm">
                Esta clase aún no tiene materiales disponibles. Los materiales serán publicados por
                el profesor próximamente.
              </div>
            </div>
            <div>
              <Link to={`/app/cursos/${courseId}`} className="btn btn-sm btn-ghost">
                Volver al Curso
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-primary text-2xl font-bold">Material de Clase</h1>
          {materialsByType.length > 0 && (
            <>
              <div role="tablist" className="tabs tabs-border px-4 pt-4">
                {materialsByType.map((material) => (
                  <label key={material.type} className="tab">
                    <input
                      type="radio"
                      name="material_tabs"
                      role="tab"
                      aria-label={MATERIAL_LABELS[material.type]}
                      checked={selectedType === material.type}
                      onChange={() => setSelectedType(material.type)}
                    />
                    {MATERIAL_ICONS[material.type]}
                    {MATERIAL_LABELS[material.type]}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {materialsByType.find((m) => m.type === selectedType) && (() => {
          const selected = materialsByType.find((m) => m.type === selectedType)!;

          if (selected.mimeType === 'video/mp4') {
            const videoAttrs: React.VideoHTMLAttributes<HTMLVideoElement> = {
              controls: true,
              playsInline: true,
              preload: 'metadata',
              disablePictureInPicture: true,
              disableRemotePlayback: true,
              onContextMenu: (e) => e.preventDefault(),
            };

            return (
              <div className="flex h-screen w-full flex-col">
                <video
                  className="h-full w-full flex-1"
                  {...videoAttrs}
                  {...({
                    controlsList: 'nodownload noplaybackrate noremoteplayback',
                  } as any)}
                >
                  <source src={selected.url} type={selected.mimeType} />
                </video>
              </div>
            );
          }

          return <PDFViewer pdfUrl={selected.url} title={MATERIAL_LABELS[selectedType]} />;
        })()}
      </div>
    </div>
  );
}
