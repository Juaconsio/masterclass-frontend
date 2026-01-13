import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getClassMaterials, type CourseMaterial } from '@client/materials';
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

      try {
        const materialsData = await getClassMaterials(classId);

        setMaterialsByType(
          materialsData.map((mat: CourseMaterial) => ({
            type: mat.filename,
            pdfUrl: mat.downloadUrl,
            filename: mat.filename,
          }))
        );
      } catch (error) {
        console.error('Error loading material:', error);
        setErrorMessage('Error al cargar el material');
      } finally {
        setIsLoading(false);
      }
    }

    loadMaterial();
  }, []);

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
