import { getStudents, deleteStudent, toggleStudentStatus } from '@/client/admin/students';
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
    // {
    //   label: 'Ver',
    //   variant: 'secondary',
    //   onClick: (student) => {
    //     // TODO: Implementar vista de detalles
    //   },
    // },
    // {
    //   label: 'Editar',
    //   variant: 'primary',
    //   onClick: (student) => {
    //     // TODO: Implementar edición
    //   },
    // },
    // {
    //   label: 'Estado',
    //   variant: 'secondary',
    //   onClick: (student) => handleToggleStatus(student.id, student.isActive),
    //   icon: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="h-4 w-4"
    //       viewBox="0 0 20 20"
    //       fill="currentColor"
    //     >
    //       <path
    //         fillRule="evenodd"
    //         d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
    //         clipRule="evenodd"
    //       />
    //     </svg>
    //   ),
    // },
    // {
    //   label: 'Eliminar',
    //   variant: 'danger',
    //   onClick: (student) => handleDelete(student.id),
    // },
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
