import { useEffect, useState } from 'react';
import {
  getStudents,
  deleteStudent,
  toggleStudentStatus,
  promoteStudent,
  getStudentEnrollmentProgress,
} from '@/client/admin/students';
import type { Student, StudentFilters, StudentEnrollmentProgress } from '@/client/admin/students';
import { Table, type TableColumn, type TableAction } from '@components/UI';
import { useTableData } from '@/hooks/useTableData';
import { showToast } from '@/lib/toast';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { CheckCircle, Circle } from 'lucide-react';

function StudentEnrollmentProgressContent({ studentId }: { studentId: number }) {
  const [progress, setProgress] = useState<StudentEnrollmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStudentEnrollmentProgress(studentId)
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error al cargar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-error py-4 text-center text-sm">{error}</p>;
  }

  if (!progress?.courses?.length) {
    return <p className="text-base-content/60 py-4 text-center text-sm">Sin cursos inscritos</p>;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-base-content/70 text-sm font-semibold tracking-wide uppercase">
        Seguimiento del alumno
      </h4>
      {progress.courses.map((course) => (
        <div key={course.id} className="border-base-300 bg-base-100 rounded-lg border p-3">
          <p className="text-base-content mb-2 font-medium">
            {course.acronym} — {course.title}
          </p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {course.classes.map((cls) => (
              <li key={cls.id} className="flex items-center gap-2">
                {cls.hasReservation ? (
                  <CheckCircle className="text-success h-4 w-4 shrink-0" />
                ) : (
                  <Circle className="text-base-content/40 h-4 w-4 shrink-0" />
                )}
                <span className={cls.hasReservation ? 'font-medium' : 'text-base-content/70'}>
                  {cls.title}
                </span>
                <span className="text-base-content/50 text-xs">
                  — {cls.hasReservation ? 'Con reserva' : 'Sin reserva'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AdminUsers() {
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
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  const handleDelete = async (id: number) => {
    showConfirmation({
      title: '¿Eliminar estudiante?',
      message: 'Esta acción eliminará permanentemente al estudiante. ¿Deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteStudent(id);
          showToast.success('Estudiante eliminado correctamente');
          loadUsers();
        } catch (error) {
          console.error('Error deleting student:', error);
          showToast.error('Error al eliminar estudiante');
        }
      },
    });
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleStudentStatus(id, !currentStatus);
      showToast.success(`Estado del estudiante actualizado correctamente`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling student status:', error);
      showToast.error('Error al cambiar estado del estudiante');
    }
  };

  const handlePromote = async (id: number) => {
    showConfirmation({
      title: '¿Promover estudiante?',
      message: '¿Estás seguro de promover este estudiante a profesor?',
      confirmText: 'Promover',
      cancelText: 'Cancelar',
      isDangerous: false,
      onConfirm: async () => {
        try {
          await promoteStudent(id);
          showToast.success('Estudiante promovido a profesor correctamente');
          loadUsers();
        } catch (error) {
          console.error('Error promoting student:', error);
          showToast.error('Error al promover estudiante');
        }
      },
    });
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
      key: 'email',
      label: 'Email',
      formatter: (email) => <div className="badge badge-ghost badge-sm">{email}</div>,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      formatter: (phone) => phone || '-',
    },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* Tabla */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        rowKey="id"
        onSort={handleSort}
        expandableRow={{
          render: (student) => <StudentEnrollmentProgressContent studentId={student.id} />,
        }}
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

      <ConfirmationModal />
    </div>
  );
}

export default AdminUsers;
