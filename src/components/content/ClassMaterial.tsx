import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getMyClassMaterials } from '@client/student/materials';
import axios from 'axios';
import { MATERIAL_LABELS, type MaterialByType, MATERIAL_ICONS } from './MaterialLabels';
import PDFViewer from './PDFViewer';

export default function ClassMaterial() {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [materialsByType, setMaterialsByType] = useState<MaterialByType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('contenido');

  useEffect(() => {
    async function loadMaterial() {
      if (!courseId || !classId) {
        navigate('/app');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getMyClassMaterials(Number(classId));

        setMaterialsByType(
          data.materials.map((mat) => ({
            type: mat.filename,
            pdfUrl: mat.downloadUrl,
            filename: mat.filename,
          }))
        );
      } catch (error: any) {
        console.error('Error loading material:', error);
        if (error.response?.status === 403) {
          setErrorMessage(
            error.response?.data?.message ||
              'No tienes acceso a estos materiales. Debes tener una reserva confirmada y pagada para esta clase.'
          );
        } else {
          setErrorMessage('Error al cargar el material');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMaterial();
  }, [classId, courseId, navigate]);

  if (isLoading) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-base-200 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="alert alert-error mx-auto max-w-2xl shadow-lg">
            <div>
              <h3 className="font-bold">Acceso Denegado</h3>
              <div className="text-sm">{errorMessage}</div>
            </div>
            <div>
              <Link to="/app" className="btn btn-sm btn-ghost">
                Volver al Portal
              </Link>
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
                  <label className="tab">
                    <input
                      key={material.type}
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
        {materialsByType.find((m) => m.type === selectedType) && (
          <PDFViewer
            pdfUrl={materialsByType.find((m) => m.type === selectedType)!.pdfUrl}
            title={MATERIAL_LABELS[selectedType]}
          />
        )}
      </div>
    </div>
  );
}
