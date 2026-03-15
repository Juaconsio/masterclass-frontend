import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getMyClassModules } from '@client/student/materials';
import type React from 'react';
import { useBreadCrumbRoute } from '@/context/BreadCrumbRouteContext';
import { MATERIAL_LABELS, MATERIAL_ICONS } from './MaterialLabels';
import PDFViewer from './PDFViewer';
import VideoPlayer from './VideoPlayer';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ClassModuleWithMaterials } from '@client/student/materials';
import type { MaterialWithUrl } from '@client/student/materials';

function getDisplayLabel(mat: MaterialWithUrl): string {
  return mat.displayName ?? MATERIAL_LABELS[mat.filename] ?? mat.filename ?? 'Material';
}

export default function ClassMaterial() {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();
  const setBreadCrumbRoute = useBreadCrumbRoute()?.setBreadCrumbRoute;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessErrorCode, setAccessErrorCode] = useState<string | undefined>();
  const [accessErrorCourseId, setAccessErrorCourseId] = useState<number | undefined>();
  const [modulesData, setModulesData] = useState<{
    modules: ClassModuleWithMaterials[];
    materialsWithoutModule: MaterialWithUrl[];
    class: { id: number; title: string };
    course: { id: number; acronym: string; title: string };
  } | null>(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<number>>(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithUrl | null>(null);

  useEffect(() => {
    if (!courseId || !classId) {
      navigate('/app');
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await getMyClassModules(Number(classId));
        if (cancelled) return;
        setModulesData({
          modules: data.modules,
          materialsWithoutModule: data.materialsWithoutModule ?? [],
          class: data.class,
          course: data.course,
        });
        const firstMod = data.modules?.[0];
        const firstMat = firstMod?.materials?.[0] ?? data.materialsWithoutModule?.[0];
        if (firstMat) setSelectedMaterial(firstMat);
        if (firstMod) setExpandedModuleIds(new Set([firstMod.id]));
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
        console.error('Error loading modules:', error);
        if (error.response?.status === 403) {
          const data = error.response?.data || {};
          setErrorMessage(data.message ?? 'No tienes acceso a estos materiales.');
          setAccessErrorCode(data.code);
          setAccessErrorCourseId(data.courseId);
        } else {
          setErrorMessage('Error al cargar el material');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      setBreadCrumbRoute?.(null, null);
    };
  }, [classId, courseId, navigate, setBreadCrumbRoute]);

  if (isLoading) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
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
                {isPlanNotPaid
                  ? 'Plan pendiente de pago'
                  : isNoAccess
                    ? 'Sin acceso'
                    : 'Acceso denegado'}
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
                  <span className="text-base-content/70 text-sm">
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

  const totalMaterials =
    (modulesData?.modules?.reduce((acc, m) => acc + (m.materials?.length ?? 0), 0) ?? 0) +
    (modulesData?.materialsWithoutModule?.length ?? 0);

  if (!modulesData || totalMaterials === 0) {
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

  const toggleModule = (id: number) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderMaterialItem = (mat: MaterialWithUrl) => {
    const label = getDisplayLabel(mat);
    const isSelected = selectedMaterial?.id === mat.id;

    return (
      <button
        key={mat.id}
        type="button"
        onClick={() => setSelectedMaterial(mat)}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
          isSelected ? 'bg-primary/15 text-primary' : 'hover:bg-base-300/70'
        }`}
      >
        <span className="bg-base-300 text-base-content/70 flex h-8 w-8 shrink-0 items-center justify-center rounded">
          {MATERIAL_ICONS[mat.filename] ?? MATERIAL_ICONS.extras}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      </button>
    );
  };

  const renderPreview = () => {
    if (!selectedMaterial?.downloadUrl) {
      return (
        <div className="bg-base-200/50 text-base-content/50 flex flex-1 flex-col items-center justify-center gap-2">
          <p className="text-sm">Selecciona un material para previsualizar</p>
        </div>
      );
    }

    const label = getDisplayLabel(selectedMaterial);
    const isVideo = selectedMaterial.mimeType === 'video/mp4';

    const content = isVideo ? (
      <div className="h-full min-h-0 flex-1">
        <VideoPlayer url={selectedMaterial.downloadUrl} title={label} />
      </div>
    ) : (
      <div className="h-full min-h-0 flex-1">
        <PDFViewer pdfUrl={selectedMaterial.downloadUrl} title={label} />
      </div>
    );

    return (
      <div className="flex flex-1 flex-col">
        <div className="border-base-300 bg-base-100 flex shrink-0 items-center justify-between border-b px-2 py-1">
          <span className="truncate text-sm font-medium">{label}</span>
        </div>
        <div className="min-h-0 flex-1">{content}</div>
      </div>
    );
  };

  return (
    <div className="bg-base-200 flex min-h-screen flex-col">
      <div className="border-base-300 bg-base-100 shrink-0 border-b px-4 py-3">
        <h1 className="text-primary text-xl font-bold">Material de Clase</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="border-base-300 bg-base-100 flex w-full flex-col border-b md:w-72 md:overflow-y-auto md:border-r md:border-b-0">
          <div className="p-2">
            {(modulesData.materialsWithoutModule?.length ?? 0) > 0 && (
              <div className="mb-2 space-y-0.5">
                {modulesData.materialsWithoutModule.map((mat) => renderMaterialItem(mat))}
              </div>
            )}
            {(modulesData.modules ?? []).map((mod) => {
              const isExpanded = expandedModuleIds.has(mod.id);
              const materials = mod.materials ?? [];
              return (
                <div key={mod.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="hover:bg-base-300/70 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{mod.title}</span>
                    <span className="badge badge-ghost badge-sm">{materials.length}</span>
                  </button>
                  {isExpanded && (
                    <div className="border-base-300 mt-0.5 ml-3 space-y-0.5 border-l pl-2">
                      {materials.map((mat) => renderMaterialItem(mat))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">{renderPreview()}</main>
      </div>
    </div>
  );
}
