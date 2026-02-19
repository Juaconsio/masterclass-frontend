import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { getRescheduleOptions, rescheduleReservation, requestRefund } from '@/client/reservations';
import { showToast } from '@/lib/toast';

export default function RescheduleReservation() {
  const navigate = useNavigate();
  const { reservationId } = useParams<{ reservationId: string }>();
  const id = useMemo(() => Number(reservationId), [reservationId]);

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<any[]>([]);
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
        setError(e?.response?.data?.message || 'No se pudieron cargar opciones de reagenda');
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
      showToast.error(e?.response?.data?.message || 'No se pudo reagendar');
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
      showToast.error(e?.response?.data?.message || 'No se pudo solicitar reembolso');
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
      <div className="space-y-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <Link to="/app/reservas" className="btn btn-ghost btn-sm">
          Volver a reservas
        </Link>
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
              className="border-base-300 hover:bg-base-200 flex cursor-pointer items-start gap-3 rounded-lg border p-4"
            >
              <input
                type="radio"
                name="slot"
                className="radio radio-primary mt-1"
                checked={selectedSlotId === o.id}
                onChange={() => setSelectedSlotId(o.id)}
                disabled={submitting}
              />
              <div className="flex-1">
                <div className="font-semibold">
                  {new Date(o.startTime).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
                </div>
                <div className="text-base-content/70 text-sm">
                  Profesor: {o.professor?.name || '-'} · Cupos: {o.availableSeats}
                </div>
                {o.location && <div className="text-base-content/60 text-xs">{o.location}</div>}
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

