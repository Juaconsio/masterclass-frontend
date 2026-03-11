import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, Copy, TriangleAlert, BookOpen, GraduationCap } from 'lucide-react';
import type { IReservation, IPayment } from '@/interfaces';
import { Link } from 'react-router';
import { showToast } from '@/lib/toast';

interface StoredPurchaseData {
  purchase: {
    id: number;
    pricingPlanId: number;
    creditsTotal: number;
    creditsRemaining: number;
    createdAt?: string;
    expiresAt?: string | null;
      pricingPlan?: {
      id: number;
      name: string;
      description?: string | null;
      price: number;
      reservationCount: number;
      accessMode?: 'sessions_and_materials' | 'materials_only';
      courseId?: number | null;
      course?: { id: number; title: string; acronym: string };
      allowedClasses?: Array<{ id: number; title?: string; orderIndex?: number; courseId?: number }>;
    };
  };
  payment: IPayment;
  /** Present when the purchase included a slot reservation; absent when plan only. */
  reservation?: IReservation | null;
}

const BANK_DATA = {
  accountHolder: 'Carlos Sáez',
  bankName: 'Banco estado',
  accountType: 'Cuenta RUT',
  rut: '20461083-5',
  email: 'carlos.saez.finanzas@gmail.com',
};

export default function ReservationConfirm() {
  const [purchaseData, setPurchaseData] = useState<StoredPurchaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: any; pending?: any } | null>(
    null
  );

  const copyBankDetails = () => {
    const details = `
Titular: ${BANK_DATA.accountHolder}
RUT: ${BANK_DATA.rut}
Banco: ${BANK_DATA.bankName}
Tipo de cuenta: ${BANK_DATA.accountType}
N° de cuenta: ${BANK_DATA.rut.slice(0, 8)}
Email: ${BANK_DATA.email}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      showToast.success('Datos bancarios copiados al portapapeles');
    });
  };

  useEffect(() => {
    try {
      const errorStored = localStorage.getItem('reservation.error');
      if (errorStored) {
        const parsedError = JSON.parse(errorStored);
        setError(parsedError);
        localStorage.removeItem('reservation.error');
        setLoading(false);
        return;
      }

      const purchaseStored = localStorage.getItem('purchase.success');
      if (purchaseStored) {
        const parsed = JSON.parse(purchaseStored);
        setPurchaseData(parsed);
        localStorage.removeItem('purchase.success');
      }
    } catch (error) {
      console.error('Error loading reservation data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-base-100 flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="card border-error/20 border bg-white shadow-2xl">
              <div className="card-body">
                <div className="mb-4 flex justify-center">
                  <div className="bg-error/10 rounded-full p-6">
                    <TriangleAlert className="text-error h-16 w-16" />
                  </div>
                </div>
                <h2 className="card-title text-error mb-2 justify-center text-2xl">
                  Error al Procesar la Reserva
                </h2>
                <p className="text-base-content/70 mb-6 text-center">{error.message}</p>

                {error.details?.code === 'EMAIL_NOT_CONFIRMED' && (
                  <div className="alert alert-info mb-4">
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
                      ></path>
                    </svg>
                    <span>
                      Por favor, revisa tu correo electrónico y confirma tu cuenta antes de realizar
                      una reserva.
                    </span>
                  </div>
                )}

                <div className="card-actions mt-6 justify-center gap-3">
                  <Link to="/courses" className="btn btn-primary">
                    Ver Cursos
                  </Link>
                  <Link to="/app" className="btn btn-outline">
                    Ir al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!purchaseData) {
    return (
      <div className="">
        <div className="container mx-auto px-4 py-16">
          <div className="card mx-auto max-w-md bg-white shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-error justify-center">No se encontró información</h2>
              <p className="text-base-content/70">
                No se pudo cargar la información de tu reserva.
              </p>
              <div className="card-actions justify-center">
                <Link to="/app/reservas" className="btn btn-primary">
                  Ver mis reservas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { purchase, payment } = purchaseData;
  const reservation = purchaseData.reservation ?? null;
  const plan = purchase.pricingPlan;
  const slot = reservation?.slot;
  const slotClass = slot?.class;
  const course = plan?.course ?? slotClass?.course;
  const hasReservation = reservation != null && slot != null;
  const isMaterialsOnly =
    plan?.accessMode === 'materials_only' || (purchase.creditsTotal === 0 && !hasReservation);
  const allowedClasses = plan?.allowedClasses ?? [];

  const copyPaymentReference = () => {
    navigator.clipboard.writeText(payment.transactionReference).then(() => {
      showToast.success('Referencia de pago copiada al portapapeles');
    });
  };

  return (
    <div className="py-4">
      <div className="container mx-auto px-4">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center"></div>
          <h1 className="text-primary mb-2 text-3xl font-bold">¡Plan inscrito!</h1>
          <p className="text-base-content/70 text-lg">
            {isMaterialsOnly
              ? 'Debes realizar un pago para acceder a los materiales.'
              : 'Debes realizar un pago para acceder a los contenidos.'}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          {/* Reservation Details Card */}
          <div className="card hover:shadow-3xl border-base-300 border bg-white shadow-2xl transition-shadow duration-300">
            <div className="card-body">
              <h2 className="card-title text-secondary mb-6 text-xl">
                <Calendar className="h-6 w-6" />
                Detalles del Plan
              </h2>

              <div className="space-y-6">
                <div className="border-base-200 border-b pb-4">
                  <div className="text-lg font-bold">{plan?.name ?? 'N/A'}</div>
                  {plan?.description && (
                    <p className="text-base-content/70 mt-1 text-sm">{plan.description}</p>
                  )}
                </div>

                {course && (
                  <div className="border-base-200 border-b pb-4">
                    <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                      Curso
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-primary h-5 w-5 shrink-0" />
                      <span className="font-medium">
                        {course.title}
                        {course.acronym ? ` (${course.acronym})` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {!isMaterialsOnly && (
                  <div className="border-base-200 border-b pb-4">
                    <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                      Créditos del plan
                    </div>
                    <div className="font-medium">
                      {purchase.creditsRemaining} de {purchase.creditsTotal} disponibles
                    </div>
                  </div>
                )}

                {purchase.expiresAt && (
                  <div className="border-base-200 border-b pb-4">
                    <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                      Válido hasta
                    </div>
                    <div className="font-medium">
                      {format(new Date(purchase.expiresAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                )}

                {hasReservation ? (
                  <>
                    <div className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
                      Reserva
                    </div>
                    {slotClass?.title && (
                      <div className="border-base-200 border-b pb-4">
                        <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                          Clase
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="text-primary h-5 w-5 shrink-0" />
                          <span className="font-medium">{slotClass.title}</span>
                        </div>
                      </div>
                    )}
                    <div className="border-base-200 border-b pb-4">
                      <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                        Fecha y Hora
                      </div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <Calendar className="text-primary h-5 w-5" />
                        </div>
                        <span className="text-base font-semibold">
                          {format(new Date(slot.startTime), "EEEE d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <Clock className="text-primary h-5 w-5" />
                        </div>
                        <span className="font-medium">
                          {format(new Date(slot.startTime), 'HH:mm')} -{' '}
                          {format(new Date(slot.endTime), 'HH:mm')}
                        </span>
                      </div>
                    </div>

                    {slot.location && (
                      <div className="border-base-200 border-b pb-4">
                        <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                          Ubicación
                        </div>
                        <div className="font-medium">{slot.location}</div>
                      </div>
                    )}

                    <div className="border-base-200 border-b pb-4">
                      <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                        Modalidad y Tipo
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="badge badge-primary badge-lg font-semibold">
                          {slot.modality === 'remote' ? '🌐 Online' : '📍 Presencial'}
                        </div>
                        <div className="badge badge-secondary badge-lg font-semibold">
                          {slot.studentsGroup === 'private' ? '👤 Particular' : '👥 Grupal'}
                        </div>
                      </div>
                    </div>
                  </>
                ) : isMaterialsOnly ? (
                  <div className="border-base-200 border-b pb-4">
                    <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                      Clases incluidas en el paquete
                    </div>
                    <p className="text-base-content/70 mb-2 text-sm">
                      Este plan te da acceso a los materiales de las siguientes clases:
                    </p>
                    {allowedClasses.length > 0 ? (
                      <ul className="space-y-1">
                        {allowedClasses
                          .slice()
                          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                          .map((c) => (
                            <li key={c.id} className="flex items-center gap-2">
                              <BookOpen className="text-primary h-4 w-4 shrink-0" />
                              <span className="font-medium">{c.title ?? `Clase ${c.id}`}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-base-content/70 text-sm">
                        Todas las clases del curso.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border-base-200 rounded-lg border border-dashed bg-base-200/50 px-4 py-3">
                    <p className="text-base-content/70 text-sm">
                      Sin reserva de horario. Podrás elegir tu clase desde{' '}
                      <Link to="/app/reservas" className="link link-primary font-medium">
                        Mis reservas
                      </Link>
                      .
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                    Estado del pago
                  </div>
                  <div
                    className={`badge badge-lg gap-2 font-semibold ${
                      payment.status === 'paid'
                        ? 'badge-success'
                        : payment.status === 'failed' || payment.status === 'refunded'
                          ? 'badge-error'
                          : 'badge-warning'
                    }`}
                  >
                    {payment.status === 'paid'
                      ? 'Pagado'
                      : payment.status === 'failed'
                        ? 'Fallido'
                        : payment.status === 'refunded'
                          ? 'Reembolsado'
                          : 'Pendiente de pago'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions Card */}
          <div className="card hover:shadow-3xl border-base-300 border bg-white shadow-2xl transition-shadow duration-300">
            <div className="card-body">
              <h2 className="card-title text-secondary mb-6 text-xl">
                <CreditCard className="h-6 w-6" />
                Instrucciones de Pago
              </h2>

              <div className="space-y-6">
                <div className="divider text-base-content/60 text-sm font-bold">
                  Datos para Transferencia
                </div>

                <div className="bg-base-200 space-y-4 rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">Titular</div>
                      <div className="text-base font-bold">{BANK_DATA.accountHolder}</div>
                    </div>
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">RUT</div>
                      <div className="text-base font-bold">{BANK_DATA.rut}</div>
                    </div>
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">Banco</div>
                      <div className="text-base font-bold capitalize">{BANK_DATA.bankName}</div>
                    </div>
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">
                        Tipo de cuenta
                      </div>
                      <div className="text-base font-bold">{BANK_DATA.accountType}</div>
                    </div>
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">
                        N° de cuenta
                      </div>
                      <div className="font-mono text-base font-bold">
                        {BANK_DATA.rut.slice(0, 8)}
                      </div>
                    </div>
                    <div>
                      <div className="text-base-content/60 mb-1 text-xs font-medium">Monto</div>
                      <div className="text-primary text-xl font-bold">
                        ${payment.amount.toLocaleString('es-CL')} CLP
                      </div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div>
                    <div className="text-base-content/60 mb-1 text-xs font-medium">
                      Referencia de pago
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-base font-bold">{payment.transactionReference}</div>
                      <button onClick={copyPaymentReference} className="btn btn-ghost btn-xs">
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60 mb-1 text-xs font-medium">
                      Email de confirmación
                    </div>
                    <div className="text-base font-bold">{BANK_DATA.email}</div>
                  </div>
                </div>

                <button onClick={copyBankDetails} className="btn btn-outline btn-block gap-2">
                  <Copy className="h-5 w-5" />
                  Copiar Datos Bancarios
                </button>

                <div className="alert alert-warning shadow-md">
                  <TriangleAlert className="h-6 w-6 shrink-0" />
                  <div className="text-sm">
                    <div className="mb-1 font-bold">Importante:</div>
                    <div>
                      Envía el comprobante de pago a{' '}
                      <a
                        href={`mailto:${BANK_DATA.email}`}
                        className="link font-semibold hover:underline"
                      >
                        {BANK_DATA.email}
                      </a>{' '}
                      {isMaterialsOnly ? 'para activar tu acceso a los materiales.' : 'para confirmar tu reserva.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app/reservas" className="btn btn-primary btn-lg shadow-lg hover:shadow-xl">
              Ver mis reservas
            </Link>
            <a href="/courses" className="btn btn-outline btn-lg shadow-md hover:shadow-lg">
              Ver otros cursos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
