import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Video, Users, BookOpen } from 'lucide-react';
import { getSlotsForPurchase, type PlanConstraints } from '@/client/purchases';
import { createReservation } from '@/client/reservations';
import { showToast } from '@/lib/toast';
import { getHttpErrorMessage } from '@/lib/errorMessages';
import { ConfirmActionModal, type ConfirmActionModalRef } from '@/components/UI/ConfirmActionModal';

type SlotItem = {
  id: number;
  classId: number;
  startTime: string;
  endTime: string;
  modality: string;
  professor?: { id: number; name: string };
  availableSeats: number;
};

type ClassWithSlots = { title: string; slots: SlotItem[] };

export default function ChooseSlotForPlan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const purchaseId = searchParams.get('purchaseId');

  const [purchaseSummary, setPurchaseSummary] = useState<{
    id: number;
    creditsRemaining: number;
    pricingPlan: { name: string; course?: { id: number; title: string; acronym: string } };
    planConstraints?: PlanConstraints;
  } | null>(null);
  const [classes, setClasses] = useState<ClassWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingSlotId, setSubmittingSlotId] = useState<number | null>(null);
  const [pendingSlot, setPendingSlot] = useState<{
    slotId: number;
    classTitle: string;
    dateTime: string;
  } | null>(null);
  const confirmModalRef = useRef<ConfirmActionModalRef>(null);
  const confirmMessageRef = useRef<string>('');

  useEffect(() => {
    if (!purchaseId) {
      navigate('/app/planes', { replace: true });
      return;
    }

    const id = Number(purchaseId);
    if (!id || Number.isNaN(id)) {
      navigate('/app/planes', { replace: true });
      return;
    }

    let cancelled = false;

    getSlotsForPurchase(id)
      .then((data) => {
        if (cancelled) return;
        setPurchaseSummary(data.purchase);
        setClasses(data.classes ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setPurchaseSummary(null);
          navigate('/app/planes', { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [purchaseId]);

  const openConfirmReservation = (slot: SlotItem, classTitle: string) => {
    const start = new Date(slot.startTime);
    const dateTime = start.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
    const payload = { slotId: slot.id, classTitle, dateTime };
    confirmMessageRef.current = `¿Inscribirte en "${classTitle}" el ${dateTime}? Se descontará un crédito de tu plan.`;
    setPendingSlot(payload);
    confirmModalRef.current?.open();
  };

  const handleConfirmReservation = async () => {
    if (!purchaseId || !pendingSlot) return;
    setSubmittingSlotId(pendingSlot.slotId);
    try {
      await createReservation({
        slotId: pendingSlot.slotId,
        studentPlanPurchaseId: Number(purchaseId),
      });
      confirmModalRef.current?.close();
      setPendingSlot(null);
      showToast.success('Reserva realizada. Revisa tus reservas.');
      navigate('/app/reservas', { replace: true });
    } catch (err: any) {
      showToast.error(getHttpErrorMessage(err));
    } finally {
      setSubmittingSlotId(null);
    }
  };

  if (loading || !purchaseSummary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const allSlots = classes.flatMap((c) => c.slots);
  const courseTitle =
    purchaseSummary.pricingPlan?.course?.title ??
    purchaseSummary.pricingPlan?.course?.acronym ??
    'Curso';
  const constraints = purchaseSummary.planConstraints;

  const modalityLabels: Record<string, string> = {
    remote: 'Online',
    onsite: 'Presencial',
  };
  const groupLabels: Record<string, string> = {
    group: 'Grupal',
    private: 'Particular',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/planes" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Elegir horario</h1>
        <p className="text-base-content/70 mt-1">
          Elige una sesión para canjear con tu plan: <strong>{courseTitle}</strong>
        </p>
        {constraints && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="badge badge-outline badge-sm gap-1">
              <Video className="h-3 w-3" />
              {constraints.allowedModalities.length > 0
                ? constraints.allowedModalities.map((m) => modalityLabels[m] ?? m).join(', ')
                : 'Cualquier modalidad'}
            </span>
            <span className="badge badge-outline badge-sm gap-1">
              <Users className="h-3 w-3" />
              {constraints.allowedStudentsGroups.length > 0
                ? constraints.allowedStudentsGroups.map((g) => groupLabels[g] ?? g).join(', ')
                : 'Cualquier grupo'}
            </span>
            <span className="badge badge-outline badge-sm gap-1">
              <BookOpen className="h-3 w-3" />
              {constraints.allowedClasses.length > 0
                ? constraints.allowedClasses.map((c) => c.title).join(', ')
                : 'Todas las clases'}
            </span>
          </div>
        )}
      </div>

      {allSlots.length === 0 ? (
        <div className="border-base-content/20 bg-base-200/50 rounded-xl border-2 border-dashed p-8 text-center">
          <Calendar className="text-base-content/40 mx-auto h-12 w-12" aria-hidden />
          <p className="text-base-content/70 mt-2">No hay horarios disponibles para este curso.</p>
          <Link to="/app/planes" className="btn btn-primary mt-4">
            Volver a Mis Planes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div key={cls.title}>
              <h2 className="text-base-content/80 mb-3 text-lg font-semibold">{cls.title}</h2>
              <ul className="space-y-2">
                {cls.slots.map((slot) => {
                  const start = new Date(slot.startTime);
                  const end = new Date(slot.endTime);
                  const isSubmitting = submittingSlotId === slot.id;

                  return (
                    <li
                      key={slot.id}
                      className="border-base-content/10 bg-base-100 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {start.toLocaleDateString('es-CL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-base-content/60 text-sm">
                          {start.toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          –{' '}
                          {end.toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {slot.professor?.name && ` · ${slot.professor.name}`}
                          {slot.modality && ` · ${slot.modality}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting}
                        onClick={() => openConfirmReservation(slot, cls.title)}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          'Reservar'
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ConfirmActionModal
        ref={confirmModalRef}
        title="Confirmar inscripción"
        message={pendingSlot ? confirmMessageRef.current : ''}
        confirmText="Sí, inscribirme"
        cancelText="Cancelar"
        onConfirm={handleConfirmReservation}
        onCancel={() => setPendingSlot(null)}
        isLoading={submittingSlotId !== null}
      />
    </div>
  );
}
