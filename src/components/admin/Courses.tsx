import { useState, useCallback, useMemo } from 'react';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { adminCoursesClient, type AdminCourse } from '../../client/admin/courses';
import CourseDetail from './CourseDetail';
import { useTableData } from '@/hooks/useTableData';
import { useLocalFilter } from '@/hooks/useLocalFilter';

export default function AdminCourses() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const { data: courses, loading } = useTableData<AdminCourse>({
    fetchFn: adminCoursesClient.getAll,
  });

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
          setSelectedCourseId(course.id);
        },
      },
    ],
    [setSelectedCourseId]
  );

  // If a course is selected, show detail view
  if (selectedCourseId) {
    return <CourseDetail courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-base-content/60 mt-2">Administra todos los cursos del sistema</p>
        </div>
      </div>

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
    </div>
  );
}
