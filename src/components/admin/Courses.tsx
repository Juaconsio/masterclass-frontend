import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Table,
  type TableColumn,
  type TableAction,
  PageHeader,
  Drawer,
  type DrawerRef,
} from '@components/UI';
import { adminCoursesClient, type AdminCourse } from '../../client/admin/courses';
import { useTableData } from '@/hooks/useTableData';
import { useLocalFilter } from '@/hooks/useLocalFilter';
import { useNavigate } from 'react-router';
import { fetchProfessors } from '@/client/admin/professors';
import type { IProfessor } from '@/interfaces/models';
import { showToast } from '@/lib/toast';

export default function AdminCourses() {
  const navigate = useNavigate();
  const drawerRef = useRef<DrawerRef>(null);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acronym: '',
    professorIds: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);

  const {
    data: courses,
    loading,
    reload,
  } = useTableData<AdminCourse>({
    fetchFn: adminCoursesClient.getAll,
  });

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      setLoadingProfessors(true);
      const response = await fetchProfessors();
      setProfessors(response.data);
    } catch (error) {
      console.error('Error loading professors:', error);
      setProfessors([]);
    } finally {
      setLoadingProfessors(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await adminCoursesClient.create(formData);
      showToast.success('Curso creado exitosamente');
      drawerRef.current?.close();
      setFormData({
        title: '',
        description: '',
        acronym: '',
        professorIds: [],
      });
      reload();
    } catch (error) {
      console.error('Error creating course:', error);
      showToast.error('Error al crear el curso');
    } finally {
      setSubmitting(false);
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

  // Apply local filters - memoize filterFn to prevent re-renders
  const filterFn = useCallback((course: AdminCourse, filters: Record<string, any>) => {
    if (filters.status === 'active') return course.isActive;
    if (filters.status === 'inactive') return !course.isActive;
    return true;
  }, []);

  const {
    filteredData: filteredCourses,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
  } = useLocalFilter({
    data: courses,
    searchKeys: ['title', 'acronym'] as (keyof AdminCourse)[],
    filterFn,
  });

  // Table columns definition - memoize to prevent re-renders
  const columns: TableColumn<AdminCourse>[] = useMemo(
    () => [
      {
        key: 'title',
        label: 'Curso',
        sortable: true,
        formatter: (value) => <div className="font-bold">{value}</div>,
      },
      {
        key: 'acronym',
        label: 'Acrónimo',
        formatter: (value) => <div className="badge badge-ghost">{value}</div>,
      },
      {
        key: 'professorsCount',
        label: 'Profesores',
        sortable: true,
      },
      {
        key: 'classesCount',
        label: 'Clases',
        sortable: true,
      },
      {
        key: 'studentsCount',
        label: 'Estudiantes',
        sortable: true,
      },
      {
        key: 'isActive',
        label: 'Estado',
        formatter: (value) =>
          value ? (
            <div className="badge badge-success gap-2">Activo</div>
          ) : (
            <div className="badge badge-error gap-2">Inactivo</div>
          ),
      },
    ],
    []
  );

  // Table actions definition - memoize to prevent re-renders
  const actions: TableAction<AdminCourse>[] = useMemo(
    () => [
      {
        label: 'Ver',
        variant: 'primary',
        onClick: (course) => {
          navigate(`/admin/cursos/${course.id}`);
        },
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Cursos"
        description="Administra los cursos disponibles en la plataforma."
        actions={[
          {
            label: 'Añadir Curso',
            variant: 'primary',
            onClick: () => {
              drawerRef.current?.open();
            },
          },
        ]}
      />
      {/* Filtros y búsqueda */}
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Buscar curso..."
              className="input input-bordered flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select select-bordered w-full md:w-auto"
              value={filters.status || 'all'}
              onChange={(e) => setFilter('status', e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de cursos */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <Table
            columns={columns}
            data={filteredCourses}
            actions={actions}
            loading={loading}
            rowKey="id"
            emptyMessage="No se encontraron cursos"
          />
        </div>
      </div>

      {/* Drawer para crear curso */}
      <Drawer
        ref={drawerRef}
        title="Crear Nuevo Curso"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => drawerRef.current?.close(),
          },
          {
            label: 'Crear Curso',
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
                      className="hover:bg-base-200 flex cursor-pointer items-center justify-between gap-3 rounded p-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{professor.name}</p>
                        <p className="text-base-content/60 text-sm">{professor.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.professorIds.includes(professor.id)}
                        onChange={() => handleProfessorToggle(professor.id)}
                      />
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
    </div>
  );
}
