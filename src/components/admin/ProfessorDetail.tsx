import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  adminProfessorsClient,
  type AdminProfessorDetail,
  type ProfessorCourse,
  type ProfessorSlot,
} from '@/client/admin/professors';
import {
  Table,
  type TableColumn,
  type TableAction,
  PageHeader,
  Drawer,
  type DrawerRef,
} from '@components/UI';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { showToast } from '@/lib/toast';

export default function ProfessorDetail() {
  const [professor, setProfessor] = useState<AdminProfessorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'slots'>('overview');
  const professorId = Number(useParams<{ professorId: string }>().professorId);
  const navigate = useNavigate();
  const drawerRef = useRef<DrawerRef>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  useEffect(() => {
    loadProfessor();
  }, [professorId]);

  const loadProfessor = async () => {
    try {
      setLoading(true);
      const data = await adminProfessorsClient.getById(professorId);
      setProfessor(data);
    } catch (error) {
      console.error('Error loading professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (professor) {
      setFormData({
        name: professor.name,
        email: professor.email,
        phone: professor.phone || '',
        bio: professor.bio || '',
      });
      drawerRef.current?.open();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await adminProfessorsClient.update(professorId, formData);
      drawerRef.current?.close();
      await loadProfessor();
      showToast.success('Profesor actualizado correctamente');
    } catch (err) {
      console.error('Error updating professor:', err);
      showToast.error('No se pudo actualizar el profesor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    showConfirmation({
      title: '¿Eliminar profesor?',
      message:
        'Esta acción cancelará todos los slots futuros y reservaciones del profesor. ¿Deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await adminProfessorsClient.delete(professorId);
          showToast.success('Profesor eliminado correctamente');
          setTimeout(() => {
            navigate('/admin/profesores');
          }, 1500);
        } catch (err) {
          console.error('Error deleting professor:', err);
          showToast.error('No se pudo eliminar el profesor');
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

  if (!professor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-error mb-4 text-lg">No se pudo cargar el profesor</p>
      </div>
    );
  }

  const courseColumns: TableColumn<ProfessorCourse>[] = [
    {
      key: 'title',
      label: 'Curso',
      sortable: true,
      formatter: (value) => <div className="font-semibold">{value}</div>,
    },
    {
      key: 'acronym',
      label: 'Acrónimo',
      formatter: (value) => <div className="badge badge-ghost">{value}</div>,
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

  const courseActions: TableAction<ProfessorCourse>[] = [
    {
      label: 'Ver Detalle',
      variant: 'primary',
      onClick: (course) => {
        navigate(`/admin/cursos/${course.id}`);
      },
    },
  ];

  const slotColumns: TableColumn<ProfessorSlot>[] = [
    {
      key: 'startTime',
      label: 'Fecha y Hora',
      sortable: true,
      formatter: (value, row) => (
        <div>
          <div className="font-semibold">
            {format(new Date(value), "d 'de' MMMM, yyyy", { locale: es })}
          </div>
          <div className="text-base-content/60 text-sm">
            {format(new Date(value), 'HH:mm')} - {format(new Date(row.endTime), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Clase',
      formatter: (value) => (
        <div>
          <div className="font-medium">{value.title}</div>
          <div className="text-base-content/60 text-sm">
            {value.course.acronym} - {value.course.title}
          </div>
        </div>
      ),
    },
    {
      key: 'maxStudents',
      label: 'Capacidad',
      formatter: (value, row) => (
        <span className="badge badge-info">
          {row.reservations.length}/{value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      formatter: (value) => {
        const statusMap: Record<string, { label: string; variant: string }> = {
          candidate: { label: 'Candidato', variant: 'warning' },
          confirmed: { label: 'Confirmado', variant: 'success' },
          cancelled: { label: 'Cancelado', variant: 'error' },
        };
        const status = statusMap[value] || { label: value, variant: 'ghost' };
        return <div className={`badge badge-${status.variant}`}>{status.label}</div>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={professor.name}
        secondaryBadges={[
          {
            text: professor.email,
            variant: 'ghost',
          },
        ]}
        actions={[
          {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            onClick: handleOpenEdit,
          },
          {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'secondary',
            onClick: handleDelete,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Cursos Asignados</div>
          <div className="stat-value text-primary">{professor._count.courses}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Total de Slots</div>
          <div className="stat-value text-info">{professor._count.slots}</div>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vista General
        </button>
        <button
          className={`tab ${activeTab === 'courses' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Cursos ({professor.courses.length})
        </button>
        <button
          className={`tab ${activeTab === 'slots' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          Slots ({professor.slots.length})
        </button>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Información del Profesor</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-base-content/60 text-sm">Email</p>
                    <p className="font-medium">{professor.email}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60 text-sm">Teléfono</p>
                    <p className="font-medium">{professor.phone || 'No registrado'}</p>
                  </div>
                  {professor.rut && (
                    <div>
                      <p className="text-base-content/60 text-sm">RUT</p>
                      <p className="font-medium">{professor.rut}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-base-content/60 text-sm">Estado de Cuenta</p>
                    <p className="font-medium">
                      {professor.confirmed ? (
                        <span className="badge badge-success">Confirmado</span>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {professor.bio && (
                <>
                  <div className="divider"></div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Biografía</h3>
                    <p className="text-base-content/80">{professor.bio}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Cursos Asignados</h3>
              </div>
              <Table
                columns={courseColumns}
                data={professor.courses}
                actions={courseActions}
                rowKey="id"
                emptyMessage="No hay cursos asignados a este profesor"
              />
            </div>
          )}

          {activeTab === 'slots' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Slots del Profesor</h3>
              </div>
              <Table
                columns={slotColumns}
                data={professor.slots}
                rowKey="id"
                emptyMessage="No hay slots asignados"
              />
            </div>
          )}
        </div>
      </div>

      <Drawer
        ref={drawerRef}
        title="Editar Profesor"
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
            disabled: !formData.name || !formData.email,
          },
        ]}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Nombre *</span>
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email *</span>
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Teléfono</span>
            </label>
            <input
              type="tel"
              placeholder="+56912345678"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Biografía</span>
            </label>
            <textarea
              placeholder="Breve biografía del profesor..."
              className="textarea textarea-bordered h-24 w-full"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </form>
      </Drawer>

      <ConfirmationModal />
    </div>
  );
}
