import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Table,
  type TableColumn,
  type TableAction,
  PageHeader,
  Drawer,
  type DrawerRef,
} from '@components/UI';
import { adminProfessorsClient, type AdminProfessor } from '@/client/admin/professors';
import { useTableData } from '@/hooks/useTableData';
import { useLocalFilter } from '@/hooks/useLocalFilter';
import { useNavigate } from 'react-router';
import { Eye, UserPlus } from 'lucide-react';
import { formatRutInput, validateRut, cleanRut } from '@/lib/rut';

export default function AdminProfessors() {
  const navigate = useNavigate();
  const drawerRef = useRef<DrawerRef>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rut: '',
    phone: '',
    bio: '',
  });
  const [rutError, setRutError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: professors,
    loading,
    reload,
  } = useTableData<AdminProfessor>({
    fetchFn: adminProfessorsClient.getAll,
  });

  const {
    filteredData: filteredProfessors,
    searchTerm,
    setSearchTerm,
  } = useLocalFilter({
    data: professors,
    searchKeys: ['name', 'email'] as (keyof AdminProfessor)[],
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      rut: '',
      phone: '',
      bio: '',
    });
    setRutError(null);
    drawerRef.current?.open();
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRutInput(value);
    setFormData({ ...formData, rut: formatted });

    if (formatted && !validateRut(formatted)) {
      setRutError('RUT inválido');
    } else {
      setRutError(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await adminProfessorsClient.create({
        ...formData,
        rut: cleanRut(formData.rut),
      });
      drawerRef.current?.close();
      setFormData({
        name: '',
        email: '',
        rut: '',
        phone: '',
        bio: '',
      });
      setRutError(null);
      reload();
    } catch (error) {
      console.error('Error creating professor:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<AdminProfessor>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        formatter: (value) => <div className="font-bold">{value}</div>,
      },
      {
        key: 'email',
        label: 'Email',
      },
      {
        key: '_count.courses',
        label: 'Cursos',
        sortable: true,
        formatter: (value, row) => (
          <span className="badge badge-primary">{row._count.courses}</span>
        ),
      },
      {
        key: '_count.futureSlots',
        label: 'Slots Próximos',
        sortable: true,
        formatter: (value, row) => (
          <span className="badge badge-info">{row._count.futureSlots}</span>
        ),
      },
      {
        key: '_count.pastSlots',
        label: 'Slots Completados',
        sortable: true,
        formatter: (value, row) => (
          <span className="badge badge-success">{row._count.pastSlots}</span>
        ),
      },
    ],
    []
  );

  const actions: TableAction<AdminProfessor>[] = useMemo(
    () => [
      {
        label: 'Ver Detalles',
        variant: 'primary',
        onClick: (professor) => {
          navigate(`/admin/profesores/${professor.id}`);
        },
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Profesores"
        description="Administra los profesores de la plataforma."
        actions={[
          {
            label: 'Añadir Profesor',
            icon: <UserPlus className="h-4 w-4" />,
            variant: 'primary',
            onClick: handleOpenCreate,
          },
        ]}
      />

      <div className="card bg-base-200">
        <div className="card-body">
          <input
            type="text"
            placeholder="Buscar profesor..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <Table
            columns={columns}
            data={filteredProfessors}
            actions={actions}
            loading={loading}
            rowKey="id"
            emptyMessage="No se encontraron profesores"
          />
        </div>
      </div>

      <Drawer
        ref={drawerRef}
        title="Crear Nuevo Profesor"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => drawerRef.current?.close(),
          },
          {
            label: 'Crear Profesor',
            variant: 'primary',
            onClick: handleSubmit,
            loading: submitting,
            disabled: !formData.name || !formData.email || !formData.rut || !!rutError,
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
              <span className="label-text font-semibold">RUT *</span>
            </label>
            <input
              type="text"
              placeholder="12.345.678-9"
              className={`input input-bordered w-full ${rutError ? 'input-error' : ''}`}
              value={formData.rut}
              onChange={(e) => handleRutChange(e.target.value)}
              required
            />
            {rutError && (
              <label className="label">
                <span className="label-text-alt text-error">{rutError}</span>
              </label>
            )}
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
    </div>
  );
}
