import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { adminCoursesClient, type AdminCourseDetail } from '../../client/admin/courses';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { FileInput, MATERIAL_ICONS, MATERIAL_LABELS } from '@components/content';
import { makeUploadUrl, uploadFileToBucket, confirmUpload } from '@/client/admin/material';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export default function CourseDetail() {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'professors' | 'students'>(
    'overview'
  );
  const courseId = Number(useParams<{ courseId: string }>().courseId);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await adminCoursesClient.getById(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, classId: number, filename: string) => {
    try {
      const { uploadUrl, key, contentType } = await makeUploadUrl({
        classId: classId,
        filename: filename,
        contentType: file.type || 'application/x-text',
        ext: file.name.split('.').pop() || '',
      });
      await uploadFileToBucket(uploadUrl, file);
      await confirmUpload(classId.toString(), filename, key, contentType);
    } catch (error) {
      console.error('Error uploading file to bucket:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-error mb-4 text-lg">No se pudo cargar el curso</p>
      </div>
    );
  }

  // Columns for Classes table
  const classColumns: TableColumn<(typeof course.classes)[0]>[] = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      formatter: (value) => <div className="font-semibold">{value}</div>,
    },
    {
      key: 'slots',
      label: 'Slots',
      formatter: (value) => <span className="badge badge-info">{value?.length || 0}</span>,
    },
    {
      key: 'materials',
      label: 'Materiales',
      formatter: (value) => {
        const materials = value || [];
        const materialFilenames = materials.map((m: any) => m.filename);
        const allTypes = Object.keys(MATERIAL_LABELS);

        return (
          <div className="flex flex-col gap-1">
            {allTypes.map((type) => {
              const exists = materialFilenames.includes(type);
              return (
                <span
                  key={type}
                  className={clsx(
                    'flex items-center gap-1',
                    exists ? 'text-green-700/80' : 'text-base-content/40'
                  )}
                >
                  {MATERIAL_ICONS[type]}
                  {MATERIAL_LABELS[type]}
                  {exists && <Check className="inline-block h-4 w-4" />}
                </span>
              );
            })}
          </div>
        );
      },
    },
  ];

  const classActions: TableAction<(typeof course.classes)[0]>[] = [
    {
      label: 'Ver',
      variant: 'primary',
      onClick: (classItem) => {
        console.log('Ver clase:', classItem);
      },
    },
    {
      render: (classItem) => (
        <FileInput
          acceptedFileTypes={['image/*', 'application/pdf']}
          onFileUpload={async (file, filename) => {
            await handleFileUpload(file, classItem.id, filename);
          }}
          maxSizeMB={5}
          buttonText="Subir Material"
          modalTitle={`Subir material para ${classItem.title}`}
        />
      ),
    },
  ];

  // Columns for Professors table
  const professorColumns: TableColumn<(typeof course.professors)[0]>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      formatter: (value) => <div className="font-semibold">{value}</div>,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'isActive',
      label: 'Estado',
      formatter: (value) =>
        value ? (
          <div className="badge badge-success">Activo</div>
        ) : (
          <div className="badge badge-error">Inactivo</div>
        ),
    },
  ];

  const professorActions: TableAction<(typeof course.professors)[0]>[] = [
    {
      label: 'Ver perfil',
      variant: 'primary',
      onClick: (professor) => {
        // TODO: Implement view professor profile
      },
    },
    {
      label: 'Remover',
      variant: 'danger',
      onClick: (professor) => {
        // TODO: Implement remove professor
      },
    },
  ];

  // Columns for Students table
  const studentColumns: TableColumn<(typeof course.students)[0]>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      formatter: (value) => <div className="font-semibold">{value}</div>,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'isActive',
      label: 'Estado',
      formatter: (value) =>
        value ? (
          <div className="badge badge-success">Activo</div>
        ) : (
          <div className="badge badge-error">Inactivo</div>
        ),
    },
  ];

  const studentActions: TableAction<(typeof course.students)[0]>[] = [
    {
      label: 'Ver perfil',
      variant: 'primary',
      onClick: (student) => {
        // TODO: Implement view student profile
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              {course.isActive ? (
                <div className="badge badge-success gap-2">Activo</div>
              ) : (
                <div className="badge badge-error gap-2">Inactivo</div>
              )}
            </div>
            <p className="text-base-content/60 mt-2">
              <span className="badge badge-ghost mr-2">{course.acronym}</span>
            </p>
          </div>
        </div>
        <button className="btn btn-primary gap-2">
          <span>✏️</span>
          Editar Curso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-8 w-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="stat-title">Clases</div>
          <div className="stat-value text-primary">{course._count.classes}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-8 w-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="stat-title">Profesores</div>
          <div className="stat-value text-secondary">{course._count.professors}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-8 w-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="stat-title">Estudiantes</div>
          <div className="stat-value text-primary">{course._count.students}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vista General
        </button>
        <button
          className={`tab ${activeTab === 'classes' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Clases ({course.classes.length})
        </button>
        <button
          className={`tab ${activeTab === 'professors' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('professors')}
        >
          Profesores ({course.professors.length})
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Estudiantes ({course.students.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Descripción</h3>
                <p className="text-base-content/80">
                  {course.description || 'Este curso no tiene descripción disponible.'}
                </p>
              </div>
              <div className="divider"></div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Información del Curso</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-base-content/60 text-sm">Acrónimo</p>
                    <p className="font-medium">{course.acronym}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60 text-sm">Estado</p>
                    <p className="font-medium">{course.isActive ? 'Activo' : 'Inactivo'}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60 text-sm">Total de Clases</p>
                    <p className="font-medium">{course._count.classes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Clases del Curso</h3>
                <button
                  className="btn btn-primary btn-sm gap-2"
                  onClick={() => {
                    alert('Agregar clase');
                  }}
                >
                  <span>+</span>
                  Nueva Clase
                </button>
              </div>
              <Table
                columns={classColumns}
                data={course.classes}
                actions={classActions}
                rowKey="id"
                emptyMessage="No hay clases registradas en este curso"
              />
            </div>
          )}

          {activeTab === 'professors' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Profesores del Curso</h3>
                <button className="btn btn-primary btn-sm gap-2">
                  <span>➕</span>
                  Agregar Profesor
                </button>
              </div>
              <Table
                columns={professorColumns}
                data={course.professors}
                actions={professorActions}
                rowKey="id"
                emptyMessage="No hay profesores asignados a este curso"
              />
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Estudiantes Inscritos</h3>
                <button className="btn btn-primary btn-sm gap-2">
                  <span>➕</span>
                  Inscribir Estudiante
                </button>
              </div>
              <Table
                columns={studentColumns}
                data={course.students}
                actions={studentActions}
                rowKey="id"
                emptyMessage="No hay estudiantes inscritos en este curso"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
