import { getStudents, deleteStudent, toggleStudentStatus, promoteStudent } from '@/client/admin/students';
import type { Student, StudentFilters } from '@/client/admin/students';
import type { UserRole } from '@/interfaces/enums';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { useTableData } from '@/hooks/useTableData';

export default function AdminUsers() {
  const {
    data: users,
    loading,
    total,
    filters,
    totalPages,
    reload: loadUsers,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useTableData<Student, StudentFilters>({
    fetchFn: getStudents,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await deleteStudent(id);
      loadUsers();
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleStudentStatus(id, !currentStatus);
      loadUsers();
    } catch (error) {
      alert('Error al cambiar estado del usuario');
    }
  };

  const handlePromote = async (id: number) => {
    if (!confirm('¿Estás seguro de promover este estudiante a profesor?')) return;

    try {
      await promoteStudent(id);
      loadUsers();
    } catch (error) {
      alert('Error al promover estudiante');
    }
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'name',
      label: 'Estudiante',
      sortable: true,
      formatter: (_, student) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content w-10 rounded-full">
              <span>{student.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <div className="font-bold">{student.name}</div>
            <div className="text-sm opacity-50">{student.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rut',
      label: 'RUT',
      formatter: (rut) => <div className="badge badge-ghost badge-sm">{rut}</div>,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      formatter: (phone) => phone || '-',
    },
  ];

  // Definir acciones de la tabla
  const actions: TableAction<Student>[] = [
    {
      label: 'Promover a Profesor',
      variant: 'primary',
      onClick: (student) => handlePromote(student.id),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.615 1.738 4.346a1 1 0 01-.51 1.307 6.174 6.174 0 01-5.885 0 1 1 0 01-.51-1.307l1.738-4.346-1.785-.893V7a1 1 0 01-2 0V5.667l-1.785.893 1.738 4.346a1 1 0 01-.51 1.307 6.174 6.174 0 01-5.885 0 1 1 0 01-.51-1.307l1.738-4.346-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Estudiantes</h1>
          <p className="text-base-content/60 mt-2">
            Administra todos los estudiantes del sistema ({total} total)
          </p>
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={users}
        actions={actions}
        loading={loading}
        rowKey="id"
        onSort={handleSort}
        pagination={{
          currentPage: filters.page || 1,
          totalPages,
          pageSize: filters.limit || 10,
          totalItems: total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        emptyMessage="No se encontraron estudiantes"
      />
    </div>
  );
}
