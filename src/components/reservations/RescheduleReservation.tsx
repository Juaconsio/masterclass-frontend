import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { getRescheduleOptions, rescheduleReservation, requestRefund, type RescheduleOption } from '@/client/reservations';
import { SlotInfo } from '@/components/slots';
import { showToast } from '@/lib/toast';

const ERROR_MESSAGES: Record<string, string> = {
  'Reservation not found': 'No se encontró la reserva. Puede que no exista o no tengas acceso.',
  'Reservation is not paid': 'Solo se puede reagendar reservas que ya están pagadas.',
  'Reservation is not pending reschedule':
    'Esta reserva no está pendiente de reagendar. Si el módulo fue cancelado, revisa tu correo para el enlace de reagendamiento.',
  'Original slot is not cancelled': 'El módulo original no está cancelado. Solo puedes reagendar cuando el módulo fue cancelado.',
  'New slot not found': 'El nuevo horario seleccionado no existe.',
  'New slot must be from the same class': 'Debes elegir un horario de la misma clase.',
  'New slot is cancelled': 'El horario seleccionado fue cancelado. Elige otro.',
  'New slot must be in the future': 'El horario seleccionado ya pasó. Elige uno futuro.',
  'New slot is full': 'El horario seleccionado ya no tiene cupos. Elige otro.',
  'Refund can only be requested from reschedule_pending':
    'Solo puedes solicitar reembolso cuando tu reserva está pendiente de reagendar (módulo cancelado).',
  'Refund can only be requested when the slot is cancelled':
    'Solo puedes solicitar reembolso cuando el módulo fue cancelado.',
};

function getFriendlyError(backendMessage: string): string {
  return ERROR_MESSAGES[backendMessage] ?? backendMessage;
}

export default function RescheduleReservation() {
  const navigate = useNavigate();
  const { reservationId } = useParams<{ reservationId: string }>();
  const id = useMemo(() => Number(reservationId), [reservationId]);

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<RescheduleOption[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id || Number.isNaN(id)) {
        navigate('/app/reservas');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await getRescheduleOptions(id);
        setOptions(data.options || []);
        setSelectedSlotId((data.options || [])[0]?.id ?? null);
      } catch (e: any) {
        const msg = e?.response?.data?.message;
        setError(msg ? getFriendlyError(msg) : 'No se pudieron cargar opciones de reagenda');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  const handleConfirm = async () => {
    if (!selectedSlotId) return;
    setSubmitting(true);
    try {
      await rescheduleReservation(id, selectedSlotId);
      showToast.success('Reserva reagendada correctamente');
      navigate('/app/reservas');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast.error(msg ? getFriendlyError(msg) : 'No se pudo reagendar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async () => {
    setSubmitting(true);
    try {
      await requestRefund(id);
      showToast.success('Reembolso solicitado. El equipo lo revisará.');
      navigate('/app/reservas');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast.error(msg ? getFriendlyError(msg) : 'No se pudo solicitar reembolso');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No se puede reagendar</h2>
          <p className="text-base-content/70 text-sm">
            Esta reserva no cumple las condiciones para reagendar o solicitar reembolso.
          </p>
        </div>
        <div className="alert alert-warning">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-medium">Motivo</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/reservas" className="btn btn-primary">
            Ver mis reservas
          </Link>
          <Link to="/app" className="btn btn-ghost">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Reagendar reserva</h2>
        <p className="text-base-content/70 text-sm">
          Elige un nuevo slot disponible para la misma clase. Si prefieres, también puedes solicitar
          reembolso.
        </p>
      </div>

      {options.length === 0 ? (
        <div className="alert alert-info">
          <span>
            No hay slots disponibles para reagendar en este momento. Puedes solicitar reembolso.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((o) => (
            <label
              key={o.id}
              className="border-base-300 hover:bg-base-200 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors"
            >
              <input
                type="radio"
                name="slot"
                className="radio radio-primary mt-1 shrink-0"
                checked={selectedSlotId === o.id}
                onChange={() => setSelectedSlotId(o.id)}
                disabled={submitting}
              />
              <div className="min-w-0 flex-1">
                <SlotInfo event={o} variant="detailed" />
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={submitting || options.length === 0 || !selectedSlotId}
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Procesando...
            </>
          ) : (
            'Confirmar reagenda'
          )}
        </button>
        <button className="btn btn-outline btn-error" onClick={handleRefund} disabled={submitting}>
          Solicitar reembolso
        </button>
        <Link to="/app/reservas" className="btn btn-ghost">
          Cancelar
        </Link>
      </div>
    </div>
  );
}

