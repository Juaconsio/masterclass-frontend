import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getClassMaterials, type CourseMaterial } from '@client/materials';
import axios from 'axios';

export default function ClassMaterial() {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMaterial() {
      if (!courseId || !classId) {
        navigate('/app');
        return;
      }

      setIsLoading(true);

      try {
        const materialsData = await getClassMaterials(classId);
        if (materialsData.length === 0) {
          setErrorMessage('No hay material disponible para esta clase.');
          return;
        }
        setMaterials(materialsData);
        setSelectedMaterialId(materialsData[0].id);

        // Cargar todos los PDFs
        const urls: Record<string, string> = {};
        for (const material of materialsData) {
          const response = await axios.get(material.downloadUrl, {
            responseType: 'blob',
          });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          urls[material.id] = url;
        }
        setPdfUrls(urls);
      } catch (error) {
        console.error('Error loading material:', error);
        setErrorMessage('Error al cargar el material');
      } finally {
        setIsLoading(false);
      }
    }

    loadMaterial();
  }, [courseId, classId, navigate]);

  useEffect(() => {
    return () => {
      Object.values(pdfUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [pdfUrls]);

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
    <div className="bg-base-200 flex min-h-screen flex-col">
      <header className="bg-base-100 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-primary text-2xl font-bold">Material de Clase</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-4">
        <div className="bg-base-100 flex w-full flex-1 flex-col shadow-xl">
          {materials.length > 0 && Object.keys(pdfUrls).length > 0 && (
            <>
              {materials.length > 1 && (
                <div role="tablist" className="tabs tabs-bordered px-4 pt-4">
                  {materials.map((material) => (
                    <input
                      key={material.id}
                      type="radio"
                      name="material_tabs"
                      role="tab"
                      className="tab"
                      aria-label={material.filename}
                      checked={selectedMaterialId === material.id}
                      onChange={() => setSelectedMaterialId(material.id)}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                {selectedMaterialId !== null && (
                  <iframe
                    src={pdfUrls[selectedMaterialId!]}
                    className="h-full w-full flex-1"
                    title="Material de Clase"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
