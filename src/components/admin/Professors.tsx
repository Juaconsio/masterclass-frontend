import { getProfessors } from '@/client/admin/students';
import type { Student, StudentFilters } from '@/client/admin/students';
import { Table, type TableColumn } from '@components/UI';
import { useTableData } from '@/hooks/useTableData';

export default function AdminProfessors() {
  const {
    data: professors,
    loading,
    total,
    filters,
    totalPages,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useTableData<Student, StudentFilters>({
    fetchFn: getProfessors,
    initialFilters: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

  const columns: TableColumn<Student>[] = [
    {
      key: 'name',
      label: 'Profesor',
      sortable: true,
      formatter: (_, professor) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content w-10 rounded-full">
              <span>{professor.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <div className="font-bold">{professor.name}</div>
            <div className="text-sm opacity-50">{professor.email}</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Profesores</h1>
          <p className="text-base-content/60 mt-2">
            Administra todos los profesores del sistema ({total} total)
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={professors}
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
        emptyMessage="No se encontraron profesores"
      />
    </div>
  );
}
