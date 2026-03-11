import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  adminCoursesClient,
  type AdminCourseDetail,
  type Class,
  type Material,
} from '../../client/admin/courses';
import { adminProfessorsClient } from '@/client/admin/professors';
import {
  Table,
  type TableColumn,
  type TableAction,
  PageHeader,
  Drawer,
  type DrawerRef,
  DescriptionModal,
} from '@components/UI';
import { FileInput, MATERIAL_ICONS, MATERIAL_LABELS } from '@components/content';
import { fetchProfessors } from '@/client/admin/professors';
import type { IProfessor } from '@/interfaces/models';
import { makeUploadUrl, uploadFileToBucket, confirmUpload } from '@/client/admin/material';
import { deleteMaterial, requestReplaceUrl, confirmReplaceMaterial } from '@/client/materials';
import clsx from 'clsx';
import { FileText, FolderOpen, Pencil, Plus, Trash2, UserPlus, RotateCw } from 'lucide-react';
import { useConfirmAction } from '@/hooks/useConfirmAction';
import { showToast } from '@/lib/toast';
import {
  adminPricingPlansClient,
  type AdminPricingPlanListItem,
  type CreatePricingPlanPayload,
} from '@/client/admin/pricingPlans';

export default function CourseDetail() {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'classes' | 'professors' | 'students' | 'plans'
  >('overview');
  const courseId = Number(useParams<{ courseId: string }>().courseId);
  const navigate = useNavigate();
  const drawerRef = useRef<DrawerRef>(null);
  const classDrawerRef = useRef<DrawerRef>(null);
  const editClassDrawerRef = useRef<DrawerRef>(null);
  const materialsDrawerRef = useRef<DrawerRef>(null);
  const materialsDrawerClassIdRef = useRef<number | null>(null);
  const professorDrawerRef = useRef<DrawerRef>(null);
  const planDrawerRef = useRef<DrawerRef>(null);
  const [pricingPlans, setPricingPlans] = useState<AdminPricingPlanListItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPricingPlanListItem | null>(null);
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [planFormData, setPlanFormData] = useState<
    CreatePricingPlanPayload & { classIds?: number[] }
  >({
    name: '',
    description: '',
    price: 0,
    isActive: true,
    reservationCount: 1,
    courseId: null,
    allowReschedule: true,
    accessMode: 'sessions_and_materials',
    allowedModalities: [],
    allowedStudentsGroups: [],
    classIds: [],
  });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [descriptionModalClass, setDescriptionModalClass] = useState<Class | null>(null);
  const [materialsDrawerClass, setMaterialsDrawerClass] = useState<Class | null>(null);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acronym: '',
    professorIds: [] as number[],
    isActive: true,
  });
  const [classFormData, setClassFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    orderIndex: undefined as number | undefined,
  });
  const [selectedProfessorId, setSelectedProfessorId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingClass, setSubmittingClass] = useState(false);
  const { showConfirmation, ConfirmationModal } = useConfirmAction();

  const isVideoMaterialType = (type: string) => type === 'videos' || type === 'grabacion_clase';

  useEffect(() => {
    loadCourse();
    loadProfessors();
  }, [courseId]);

  useEffect(() => {
    if (!course || !materialsDrawerClass) return;
    const updated = course.classes.find((c) => c.id === materialsDrawerClass.id);
    if (updated) setMaterialsDrawerClass(updated);
  }, [course, materialsDrawerClass?.id]);

  useEffect(() => {
    if (activeTab === 'plans' && courseId) loadPlans();
  }, [activeTab, courseId]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await adminPricingPlansClient.list({ courseId, pageSize: 100 });
      setPricingPlans(res.data || []);
    } catch (e) {
      console.error('Error loading pricing plans:', e);
      setPricingPlans([]);
      showToast.error('Error al cargar planes');
    } finally {
      setLoadingPlans(false);
    }
  };

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

  const loadCourse = async (): Promise<AdminCourseDetail | null> => {
    try {
      setLoading(true);
      const data = await adminCoursesClient.getById(courseId);
      setCourse(data);
      return data;
    } catch (error) {
      console.error('Error loading course:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, classId: number, filename: string) => {
    const id = Number(classId);
    if (!id || Number.isNaN(id)) {
      showToast.error('Clase no válida. Cierra el panel de materiales y vuelve a abrirlo.');
      return;
    }
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const requestedContentType = isVideoMaterialType(filename)
        ? file.type || 'video/mp4'
        : file.type || 'application/octet-stream';

      const { uploadUrl, key, contentType } = await makeUploadUrl({
        classId: id,
        filename,
        contentType: requestedContentType,
        ext,
      });
      await uploadFileToBucket(uploadUrl, file, requestedContentType);
      await confirmUpload(String(id), filename, key, contentType);
      showToast.success('Material subido exitosamente');
      const data = await loadCourse();
      if (data && materialsDrawerClassIdRef.current != null) {
        const updated = data.classes.find((c) => c.id === materialsDrawerClassIdRef.current);
        if (updated) setMaterialsDrawerClass(updated);
        // TODO [tech-debt]: Drawer se cierra al actualizar estado; reabrir con setTimeout es un workaround. Preferible: Drawer controlado por estado (open prop) o evitar que el re-render cierre el drawer.
        setTimeout(() => materialsDrawerRef.current?.open(), 0);
      }
    } catch (error) {
      console.error('Error uploading file to bucket:', error);
      showToast.error('Error al subir el material');
      throw error;
    }
  };

  const handleDeleteMaterial = async (materialId: number, filename: string) => {
    showConfirmation({
      title: '¿Eliminar material?',
      message: `Se eliminará permanentemente el material "${MATERIAL_LABELS[filename] || filename}". Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteMaterial(materialId);
          showToast.success('Material eliminado correctamente');
          const data = await loadCourse();
          if (data && materialsDrawerClassIdRef.current != null) {
            const updated = data.classes.find((c) => c.id === materialsDrawerClassIdRef.current);
            if (updated) setMaterialsDrawerClass(updated);
            // TODO [tech-debt]: idem workaround drawer materiales (reabrir tras actualizar).
            setTimeout(() => materialsDrawerRef.current?.open(), 0);
          }
        } catch (error) {
          console.error('Error deleting material:', error);
          showToast.error('Error al eliminar el material');
        }
      },
    });
  };

  const handleReplaceMaterial = async (materialId: number, file: File, filename: string) => {
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const requestedContentType = isVideoMaterialType(filename)
        ? file.type || 'video/mp4'
        : file.type || 'application/octet-stream';

      const { uploadUrl, newKey, contentType } = await requestReplaceUrl(materialId, {
        filename,
        contentType: requestedContentType,
        ext,
      });

      await uploadFileToBucket(uploadUrl, file, requestedContentType);

      await confirmReplaceMaterial(materialId, {
        filename,
        newKey,
        contentType,
      });

      showToast.success('Material reemplazado exitosamente');
      const data = await loadCourse();
      if (data && materialsDrawerClassIdRef.current != null) {
        const updated = data.classes.find((c) => c.id === materialsDrawerClassIdRef.current);
        if (updated) setMaterialsDrawerClass(updated);
        // TODO [tech-debt]: idem workaround drawer materiales (reabrir tras actualizar).
        setTimeout(() => materialsDrawerRef.current?.open(), 0);
      }
    } catch (error) {
      console.error('Error replacing material:', error);
      showToast.error('Error al reemplazar el material');
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
        isActive: course.isActive,
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
      showToast.success('Curso actualizado correctamente');
      drawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error updating course:', error);
      showToast.error('Error al actualizar el curso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNewClass = () => {
    setClassFormData({
      title: '',
      description: '',
      objectives: '',
      orderIndex: undefined,
    });
    setEditingClass(null);
    classDrawerRef.current?.open();
  };

  const handleOpenEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setClassFormData({
      title: classItem.title,
      description: classItem.description ?? '',
      objectives: classItem.objectives ?? '',
      orderIndex: classItem.orderIndex,
    });
    editClassDrawerRef.current?.open();
  };

  const handleOpenMaterialsDrawer = (classItem: Class) => {
    materialsDrawerClassIdRef.current = classItem.id;
    setMaterialsDrawerClass(classItem);
    materialsDrawerRef.current?.open();
  };

  const handleSubmitEditClass = async () => {
    if (!editingClass) return;
    try {
      setSubmittingClass(true);
      await adminCoursesClient.updateClass(editingClass.id, {
        title: classFormData.title,
        description: classFormData.description,
        objectives: classFormData.objectives,
        orderIndex: classFormData.orderIndex,
      });
      showToast.success('Clase actualizada correctamente');
      editClassDrawerRef.current?.close();
      setEditingClass(null);
      await loadCourse();
    } catch (error) {
      console.error('Error updating class:', error);
      showToast.error('Error al actualizar la clase');
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleSubmitClass = async () => {
    if (!course) return;

    try {
      setSubmittingClass(true);
      const orderIndex = course.classes.length + 1;
      await adminCoursesClient.createClass({
        title: classFormData.title,
        description: classFormData.description,
        objectives: classFormData.objectives,
        courseId,
        orderIndex,
      });
      showToast.success('Clase creada exitosamente');
      classDrawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error creating class:', error);
      showToast.error('Error al crear la clase');
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
      showToast.success('Profesor asociado correctamente');
      professorDrawerRef.current?.close();
      await loadCourse();
    } catch (error) {
      console.error('Error associating professor:', error);
      showToast.error('Error al asociar el profesor');
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
          showToast.success('Profesor desasociado correctamente');
          await loadCourse();
        } catch (error) {
          console.error('Error dissociating professor:', error);
          showToast.error('Error al desasociar el profesor');
        }
      },
    });
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      price: 0,
      isActive: true,
      reservationCount: 1,
      courseId: courseId,
      allowReschedule: true,
      accessMode: 'sessions_and_materials',
      allowedModalities: [],
      allowedStudentsGroups: [],
      classIds: [],
    });
    setEditingPlan(null);
  };

  const handleOpenNewPlan = () => {
    resetPlanForm();
    setPlanFormData((prev) => ({ ...prev, courseId: courseId }));
    planDrawerRef.current?.open();
  };

  const handleOpenEditPlan = (plan: AdminPricingPlanListItem) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description ?? '',
      price: plan.price,
      isActive: plan.isActive,
      reservationCount: plan.reservationCount,
      courseId: plan.courseId ?? courseId,
      allowReschedule: plan.allowReschedule,
      accessMode:
        plan.accessMode === 'materials_only' ? 'materials_only' : 'sessions_and_materials',
      allowedModalities: plan.allowedModalities ?? [],
      allowedStudentsGroups: plan.allowedStudentsGroups ?? [],
      classIds: (plan.allowedClasses ?? []).map((c) => c.id),
    });
    planDrawerRef.current?.open();
  };

  const handleSubmitPlan = async () => {
    const isMaterialsOnly = planFormData.accessMode === 'materials_only';
    const needsCredits =
      !isMaterialsOnly &&
      (planFormData.reservationCount === undefined || planFormData.reservationCount === null);
    if (!planFormData.name || planFormData.price === undefined || needsCredits) {
      showToast.error(
        isMaterialsOnly
          ? 'Nombre y precio son obligatorios'
          : 'Nombre, precio y créditos son obligatorios'
      );
      return;
    }
    try {
      setSubmittingPlan(true);
      const payload = {
        name: planFormData.name,
        description: planFormData.description ?? '',
        price: Number(planFormData.price),
        isActive: planFormData.isActive,
        reservationCount: isMaterialsOnly ? 0 : Number(planFormData.reservationCount),
        courseId: courseId,
        allowReschedule: isMaterialsOnly ? false : planFormData.allowReschedule,
        accessMode: planFormData.accessMode,
        allowedModalities: isMaterialsOnly ? [] : (planFormData.allowedModalities ?? []),
        allowedStudentsGroups: isMaterialsOnly ? [] : (planFormData.allowedStudentsGroups ?? []),
        classIds: planFormData.classIds ?? [],
      };
      if (editingPlan) {
        await adminPricingPlansClient.update(editingPlan.id, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          isActive: payload.isActive,
          reservationCount: payload.reservationCount,
          allowReschedule: payload.allowReschedule,
          accessMode: payload.accessMode,
          allowedModalities: payload.allowedModalities,
          allowedStudentsGroups: payload.allowedStudentsGroups,
          classIds: payload.classIds,
        });
        showToast.success('Plan actualizado correctamente');
      } else {
        await adminPricingPlansClient.create(payload);
        showToast.success('Plan creado correctamente');
      }
      planDrawerRef.current?.close();
      resetPlanForm();
      await loadPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      showToast.error(error?.response?.data?.message ?? 'Error al guardar el plan');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeletePlan = (plan: AdminPricingPlanListItem) => {
    showConfirmation({
      title: '¿Eliminar plan?',
      message: `Se eliminará el plan "${plan.name}". Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await adminPricingPlansClient.delete(plan.id);
          showToast.success('Plan eliminado');
          await loadPlans();
        } catch (e: any) {
          showToast.error(e?.response?.data?.message ?? 'Error al eliminar');
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

  const allMaterialTypes = Object.keys(MATERIAL_LABELS);

  const classColumns: TableColumn<(typeof course.classes)[0]>[] = [
    {
      key: 'orderIndex',
      label: 'Orden',
      sortable: true,
      formatter: (value) => <span className="text-base-content/80 font-mono">{value}</span>,
    },
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
      formatter: (value, row) => {
        const materials = value || [];
        const count = materials.length;
        const total = allMaterialTypes.length;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('badge', count >= total ? 'badge-success' : 'badge-ghost')}>
              {count}/{total}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1"
              onClick={() => handleOpenMaterialsDrawer(row)}
              title="Gestionar materiales"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Gestionar
            </button>
          </div>
        );
      },
    },
  ];

  const classActions: TableAction<(typeof course.classes)[0]>[] = [
    {
      label: 'Ver descripción',
      icon: <FileText className="h-4 w-4" />,
      variant: 'secondary',
      onClick: (classItem) => setDescriptionModalClass(classItem),
    },
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'primary',
      onClick: (classItem) => handleOpenEditClass(classItem),
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

  const planColumns: TableColumn<AdminPricingPlanListItem>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      formatter: (v) => <span className="font-semibold">{v}</span>,
    },
    {
      key: 'price',
      label: 'Precio',
      formatter: (v) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(v)),
    },
    {
      key: 'reservationCount',
      label: 'Créditos',
      formatter: (v, row) => (row.accessMode === 'materials_only' ? '—' : String(v ?? '—')),
    },
    {
      key: 'allowReschedule',
      label: 'Reagenda',
      formatter: (v) => (v ? 'Sí' : 'No'),
    },
    {
      key: 'accessMode',
      label: 'Acceso',
      formatter: (v) => (v === 'materials_only' ? 'Solo materiales' : 'Sesiones y materiales'),
    },
    {
      key: 'allowedClasses',
      label: 'Clases',
      formatter: (_, row) => {
        const classes = row.allowedClasses ?? [];
        if (classes.length === 0) return <span className="text-base-content/60">Todas</span>;
        return <span>{classes.map((c) => c.title ?? c.id).join(', ')}</span>;
      },
    },
  ];

  const planActions: TableAction<AdminPricingPlanListItem>[] = [
    {
      label: 'Editar',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'primary',
      onClick: (row) => handleOpenEditPlan(row),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: (row) => handleDeletePlan(row),
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
        <button
          className={`tab ${activeTab === 'plans' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Planes ({pricingPlans.length})
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

          {activeTab === 'plans' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Planes de precios</h3>
                <button className="btn btn-primary btn-sm gap-2" onClick={handleOpenNewPlan}>
                  <Plus className="h-4 w-4" />
                  Crear plan
                </button>
              </div>
              {loadingPlans ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : (
                <Table
                  columns={planColumns}
                  data={pricingPlans}
                  actions={planActions}
                  rowKey="id"
                  emptyMessage="No hay planes de precios. Crea uno para este curso."
                />
              )}
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

          {/* Estado */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="label-text font-semibold">Curso activo en landing</span>
            </label>
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

      {/* Drawer para crear/editar plan de precios */}
      <Drawer
        ref={planDrawerRef}
        title={editingPlan ? 'Editar plan' : 'Crear plan de precios'}
        width="lg"
        actions={[
          { label: 'Cancelar', variant: 'ghost', onClick: () => planDrawerRef.current?.close() },
          {
            label: editingPlan ? 'Guardar' : 'Crear plan',
            variant: 'primary',
            onClick: handleSubmitPlan,
            loading: submittingPlan,
            disabled:
              !planFormData.name ||
              planFormData.price === undefined ||
              (planFormData.accessMode !== 'materials_only' &&
                (planFormData.reservationCount === undefined ||
                  planFormData.reservationCount === null)),
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
              className="input input-bordered w-full"
              value={planFormData.name}
              onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              placeholder="Ej: Pack 5 clases"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Descripción</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={planFormData.description ?? ''}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              placeholder="Descripción opcional"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Tipo de paquete</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={planFormData.accessMode}
              onChange={(e) => {
                const mode = e.target.value as 'sessions_and_materials' | 'materials_only';
                setPlanFormData({
                  ...planFormData,
                  accessMode: mode,
                  ...(mode === 'materials_only'
                    ? {
                        reservationCount: 0,
                        allowReschedule: false,
                        allowedModalities: [],
                        allowedStudentsGroups: [],
                      }
                    : {}),
                });
              }}
            >
              <option value="sessions_and_materials">Sesiones y materiales</option>
              <option value="materials_only">Solo materiales</option>
            </select>
          </div>
          <div
            className={planFormData.accessMode === 'materials_only' ? '' : 'grid grid-cols-2 gap-4'}
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Precio (CLP) *</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                className="input input-bordered w-full"
                value={planFormData.price === 0 ? '' : planFormData.price}
                onChange={(e) =>
                  setPlanFormData({ ...planFormData, price: Number(e.target.value) || 0 })
                }
              />
            </div>
            {planFormData.accessMode === 'sessions_and_materials' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Créditos (sesiones) *</span>
                </label>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-full"
                  value={planFormData.reservationCount}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      reservationCount: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={planFormData.isActive}
                onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
              />
              <span className="label-text font-semibold">Plan activo</span>
            </label>
          </div>
          {planFormData.accessMode === 'sessions_and_materials' && (
            <>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={planFormData.allowReschedule}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, allowReschedule: e.target.checked })
                    }
                  />
                  <span className="label-text font-semibold">Permitir reagenda</span>
                </label>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Modalidades permitidas</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['remote', 'onsite'].map((mod) => (
                    <label key={mod} className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={(planFormData.allowedModalities ?? []).includes(mod)}
                        onChange={(e) => {
                          const arr = planFormData.allowedModalities ?? [];
                          setPlanFormData({
                            ...planFormData,
                            allowedModalities: e.target.checked
                              ? [...arr, mod]
                              : arr.filter((m) => m !== mod),
                          });
                        }}
                      />
                      <span className="label-text">
                        {mod === 'remote' ? 'Remoto' : 'Presencial'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Grupos permitidos</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['group', 'private'].map((gr) => (
                    <label key={gr} className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={(planFormData.allowedStudentsGroups ?? []).includes(gr)}
                        onChange={(e) => {
                          const arr = planFormData.allowedStudentsGroups ?? [];
                          setPlanFormData({
                            ...planFormData,
                            allowedStudentsGroups: e.target.checked
                              ? [...arr, gr]
                              : arr.filter((g) => g !== gr),
                          });
                        }}
                      />
                      <span className="label-text">{gr === 'group' ? 'Grupal' : 'Privado'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Clases permitidas (vacío = todas)</span>
            </label>
            <div className="border-base-300 max-h-40 space-y-2 overflow-y-auto rounded-lg border p-2">
              {course.classes.map((cls) => (
                <label
                  key={cls.id}
                  className="hover:bg-base-200 flex cursor-pointer items-center gap-2 rounded p-2"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={(planFormData.classIds ?? []).includes(cls.id)}
                    onChange={(e) => {
                      const ids = planFormData.classIds ?? [];
                      setPlanFormData({
                        ...planFormData,
                        classIds: e.target.checked
                          ? [...ids, cls.id]
                          : ids.filter((id) => id !== cls.id),
                      });
                    }}
                  />
                  <span className="label-text">{cls.title}</span>
                </label>
              ))}
              {course.classes.length === 0 && (
                <p className="text-base-content/60 text-sm">No hay clases en este curso</p>
              )}
            </div>
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
        ref={editClassDrawerRef}
        title="Editar Clase"
        width="lg"
        actions={[
          {
            label: 'Cancelar',
            variant: 'ghost',
            onClick: () => editClassDrawerRef.current?.close(),
          },
          {
            label: 'Guardar Cambios',
            variant: 'primary',
            onClick: handleSubmitEditClass,
            loading: submittingClass,
            disabled: !classFormData.title || classFormData.orderIndex == null,
          },
        ]}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Orden</span>
            </label>
            <input
              type="number"
              min={1}
              className="input input-bordered w-full"
              value={classFormData.orderIndex ?? ''}
              onChange={(e) =>
                setClassFormData({
                  ...classFormData,
                  orderIndex: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </form>
      </Drawer>

      <Drawer
        ref={materialsDrawerRef}
        title={
          materialsDrawerClass
            ? `Materiales: ${materialsDrawerClass.title}`
            : 'Gestionar materiales'
        }
        width="lg"
        actions={[
          {
            label: 'Cerrar',
            variant: 'ghost',
            onClick: () => materialsDrawerRef.current?.close(),
          },
        ]}
      >
        {materialsDrawerClass && (
          <div className="space-y-4">
            <p className="text-base-content/60 text-sm">
              Administra los archivos por tipo de material.
            </p>
            <div className="flex flex-col gap-2">
              {allMaterialTypes.map((type) => {
                const materials = materialsDrawerClass.materials || [];
                const material = materials.find((m: Material) => m.filename === type);
                const exists = !!material;
                const acceptedFileTypes = isVideoMaterialType(type)
                  ? (['video/mp4', '.mp4'] as const)
                  : (['image/*', 'application/pdf'] as const);
                const maxSizeMB = isVideoMaterialType(type) ? 500 : 5;

                return (
                  <div
                    key={type}
                    className={clsx(
                      'flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
                      exists
                        ? 'border-success/40 bg-success/5 dark:bg-success/10'
                        : 'border-base-300 bg-base-200/50'
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={clsx(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          exists ? 'bg-success/20 text-success' : 'bg-base-300 text-base-content/50'
                        )}
                      >
                        {MATERIAL_ICONS[type]}
                      </span>
                      <p
                        className={clsx(
                          'font-medium',
                          exists ? 'text-base-content' : 'text-base-content/70'
                        )}
                        title={MATERIAL_LABELS[type]}
                      >
                        {MATERIAL_LABELS[type]}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {exists && material?.id ? (
                        <>
                          <FileInput
                            acceptedFileTypes={[...acceptedFileTypes]}
                            onFileUpload={async (file) => {
                              await handleReplaceMaterial(material.id, file, type);
                            }}
                            maxSizeMB={maxSizeMB}
                            buttonText=""
                            modalTitle={`Reemplazar ${MATERIAL_LABELS[type]}`}
                            fixedType={type}
                            customButton={
                              <button
                                type="button"
                                className="btn btn-outline btn-sm gap-1.5"
                                title="Reemplazar material"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                              </button>
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-outline btn-sm text-error hover:bg-error/10 gap-1.5"
                            onClick={() => handleDeleteMaterial(material.id, type)}
                            title="Eliminar material"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : exists && !material?.id ? (
                        <span className="text-error text-sm">Error: ID no disponible</span>
                      ) : (
                        <FileInput
                          acceptedFileTypes={[...acceptedFileTypes]}
                          onFileUpload={async (file) => {
                            const classId =
                              materialsDrawerClassIdRef.current ?? materialsDrawerClass.id;
                            await handleFileUpload(file, classId, type);
                          }}
                          maxSizeMB={maxSizeMB}
                          buttonText="Subir"
                          modalTitle={`Subir ${MATERIAL_LABELS[type]}`}
                          fixedType={type}
                          customButton={
                            <button
                              type="button"
                              className="btn btn-primary btn-sm gap-1.5"
                              title="Subir material"
                            >
                              Subir
                            </button>
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

      <DescriptionModal
        open={!!descriptionModalClass}
        onClose={() => setDescriptionModalClass(null)}
        title={descriptionModalClass?.title ?? ''}
        description={descriptionModalClass?.description ?? null}
        sections={
          descriptionModalClass
            ? [{ label: 'Objetivos', content: descriptionModalClass.objectives ?? null }]
            : []
        }
      />

      <ConfirmationModal />
    </div>
  );
}
