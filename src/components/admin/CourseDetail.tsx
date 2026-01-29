import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { adminCoursesClient, type AdminCourseDetail } from '../../client/admin/courses';
import { adminProfessorsClient } from '@/client/admin/professors';
import {
  Table,
  type TableColumn,
  type TableAction,
  PageHeader,
  Drawer,
  type DrawerRef,
} from '@components/UI';
import { FileInput, MATERIAL_ICONS, MATERIAL_LABELS } from '@components/content';
import { fetchProfessors } from '@/client/admin/professors';
import type { IProfessor } from '@/interfaces/models';
import { makeUploadUrl, uploadFileToBucket, confirmUpload } from '@/client/admin/material';
import clsx from 'clsx';
import { Check, Pencil, UserPlus, UserMinus } from 'lucide-react';
import { useConfirmAction } from '@/hooks/useConfirmAction';

export default function CourseDetail() {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'professors' | 'students'>(
    'overview'
  );
  const courseId = Number(useParams<{ courseId: string }>().courseId);
  const navigate = useNavigate();
  const drawerRef = useRef<DrawerRef>(null);
  const classDrawerRef = useRef<DrawerRef>(null);
  const professorDrawerRef = useRef<DrawerRef>(null);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acronym: '',
    professorIds: [] as number[],
  });
  const [classFormData, setClassFormData] = useState({
    title: '',
    description: '',
    objectives: '',
  });
  const [selectedProfessorId, setSelectedProfessorId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingClass, setSubmittingClass] = useState(false);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  useEffect(() => {
    loadCourse();
    loadProfessors();
  }, [courseId]);

  const loadProfessors = async () => {
    try {
      setLoadingProfessors(true);
      const response = await fetchProfessors();
      const data = Array.isArray(response) ? response : response.data || [];
      setProfessors(data);
    } catch (error) {
      console.error('Error loading professors:', error);
      setProfessors([]);
    } finally {
      setLoadingProfessors(false);
    }
  };

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

  const handleOpenEdit = () => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        acronym: course.acronym,
        professorIds: course.professors.map((p) => p.id),
      });
      drawerRef.current?.open();
    }
  };

  const handleProfessorToggle = (professorId: number) => {
    setFormData((prev) => ({
      ...prev,
      professorIds: prev.professorIds.includes(professorId)
        ? prev.professorIds.filter((id) => id !== professorId)
        : [...prev.professorIds, professorId],
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await adminCoursesClient.update(courseId, formData);
      drawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNewClass = () => {
    setClassFormData({
      title: '',
      description: '',
      objectives: '',
    });
    classDrawerRef.current?.open();
  };

  const handleSubmitClass = async () => {
    if (!course) return;

    try {
      setSubmittingClass(true);
      const orderIndex = course.classes.length + 1;
      await adminCoursesClient.createClass({
        ...classFormData,
        courseId,
        orderIndex,
      });
      classDrawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setSubmittingClass(false);
    }
  };
  const handleOpenAssociateProfessor = () => {
    setSelectedProfessorId(null);
    professorDrawerRef.current?.open();
  };

  const handleAssociateProfessor = async () => {
    if (!selectedProfessorId) return;

    try {
      setSubmitting(true);
      await adminProfessorsClient.associateCourse(selectedProfessorId, courseId);
      professorDrawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error associating professor:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDissociateProfessor = async (professorId: number) => {
    showConfirmation({
      title: '¿Desasociar profesor?',
      message:
        'Esta acción removerá al profesor del curso. Si tiene slots asignados, deberás eliminarlos manualmente.',
      confirmText: 'Desasociar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await adminProfessorsClient.dissociateCourse(professorId, courseId);
          await loadCourse();
        } catch (error) {
          console.error('Error dissociating professor:', error);
        }
      },
    });
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
  ];

  const professorActions: TableAction<(typeof course.professors)[0]>[] = [
    {
      label: 'Ver Perfil',
      variant: 'primary',
      onClick: (professor) => {
        navigate(`/admin/profesores/${professor.id}`);
      },
    },
    {
      label: 'Desasociar',
      variant: 'danger',
      onClick: (professor) => {
        handleDissociateProfessor(professor.id);
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
      <PageHeader
        title={course.title}
        primaryBadge={{
          text: course.isActive ? 'Activo' : 'Inactivo',
          variant: course.isActive ? 'success' : 'error',
        }}
        secondaryBadges={[
          {
            text: course.acronym,
            variant: 'ghost',
          },
        ]}
        actions={[
          {
            label: 'Editar Curso',
            icon: <Pencil className="inline-block h-4 w-4" />,
            onClick: handleOpenEdit,
          },
        ]}
      />

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
                <button className="btn btn-primary btn-sm gap-2" onClick={handleOpenNewClass}>
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
                <button
                  className="btn btn-primary btn-sm gap-2"
                  onClick={handleOpenAssociateProfessor}
                >
                  <UserPlus className="h-4 w-4" />
                  Asociar Profesor
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

      {/* Drawer para editar curso */}
      <Drawer
        ref={drawerRef}
        title="Editar Curso"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => drawerRef.current?.close(),
          },
          {
            label: 'Guardar Cambios',
            variant: 'primary',
            onClick: handleSubmit,
            loading: submitting,
            disabled: !formData.title || !formData.acronym,
          },
        ]}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Título */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Título *</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Cálculo Diferencial e Integral"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Acrónimo */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Acrónimo *</span>
            </label>
            <input
              type="text"
              placeholder="Ej: MAT101"
              className="input input-bordered w-full"
              value={formData.acronym}
              onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Descripción</span>
            </label>
            <textarea
              placeholder="Descripción del curso..."
              className="textarea textarea-bordered h-24 w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Asignación de Profesores */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Asignar Profesores</span>
            </label>
            {loadingProfessors ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : (
              <div className="border-base-300 max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
                {professors.length === 0 ? (
                  <p className="text-base-content/60 py-4 text-center text-sm">
                    No hay profesores disponibles
                  </p>
                ) : (
                  professors.map((professor) => (
                    <label
                      key={professor.id}
                      className="hover:bg-base-200 flex cursor-pointer items-center gap-3 rounded p-2"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.professorIds.includes(professor.id)}
                        onChange={() => handleProfessorToggle(professor.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{professor.name}</p>
                        <p className="text-base-content/60 text-sm">{professor.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
            {formData.professorIds.length > 0 && (
              <p className="text-base-content/60 mt-2 text-sm">
                {formData.professorIds.length} profesor(es) seleccionado(s)
              </p>
            )}
          </div>
        </form>
      </Drawer>

      {/* Drawer para crear nueva clase */}
      <Drawer
        ref={classDrawerRef}
        title="Crear Nueva Clase"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => classDrawerRef.current?.close(),
          },
          {
            label: 'Crear Clase',
            variant: 'primary',
            onClick: handleSubmitClass,
            loading: submittingClass,
            disabled: !classFormData.title,
          },
        ]}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Título */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Título *</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Introducción a Límites"
              className="input input-bordered w-full"
              value={classFormData.title}
              onChange={(e) => setClassFormData({ ...classFormData, title: e.target.value })}
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Descripción</span>
            </label>
            <textarea
              placeholder="Descripción de la clase..."
              className="textarea textarea-bordered h-24 w-full"
              value={classFormData.description}
              onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
            />
          </div>

          {/* Objetivos */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Objetivos</span>
            </label>
            <textarea
              placeholder="Objetivos de aprendizaje de la clase..."
              className="textarea textarea-bordered h-24 w-full"
              value={classFormData.objectives}
              onChange={(e) => setClassFormData({ ...classFormData, objectives: e.target.value })}
            />
          </div>

          {/* Info del índice */}
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Esta será la clase #{course?.classes.length ? course.classes.length + 1 : 1} del curso
            </span>
          </div>
        </form>
      </Drawer>

      <Drawer
        ref={professorDrawerRef}
        title="Asociar Profesor al Curso"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => professorDrawerRef.current?.close(),
          },
          {
            label: 'Asociar Profesor',
            variant: 'primary',
            onClick: handleAssociateProfessor,
            loading: submitting,
            disabled: !selectedProfessorId,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-base-content/80">
            Selecciona un profesor para asociarlo al curso <strong>{course?.title}</strong>
          </p>

          {loadingProfessors ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : (
            <div className="border-base-300 max-h-96 space-y-2 overflow-y-auto rounded-lg border p-3">
              {professors.length === 0 ? (
                <p className="text-base-content/60 py-4 text-center text-sm">
                  No hay profesores disponibles
                </p>
              ) : (
                professors
                  .filter((prof) => !course?.professors.some((cp) => cp.id === prof.id))
                  .map((professor) => (
                    <label
                      key={professor.id}
                      className="hover:bg-base-200 border-base-300 flex cursor-pointer items-center gap-3 rounded border p-3"
                    >
                      <input
                        type="radio"
                        name="professor"
                        className="radio radio-primary"
                        checked={selectedProfessorId === professor.id}
                        onChange={() => setSelectedProfessorId(professor.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{professor.name}</p>
                        <p className="text-base-content/60 text-sm">{professor.email}</p>
                      </div>
                    </label>
                  ))
              )}
            </div>
          )}
        </div>
      </Drawer>

      <ConfirmationModal />
    </div>
  );
}
