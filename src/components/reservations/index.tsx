import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchReservations, deleteReservation } from '@/client/reservations';
import { ReservationsCalendar } from './reservationsCalendar';
import type { IReservation } from '@/interfaces';
import { ConfirmActionModal, type ConfirmActionModalRef } from '@/components/UI/ConfirmActionModal';
import { MyReservations } from '@/components/reservations/MyReservations';

export { default as ReservationCard } from './ReservationCard';
const Reservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const modalRef = useRef<ConfirmActionModalRef>(null);

  async function loadData() {
    setLoading(true);
    try {
      const reservationsRes = await fetchReservations().then((dataJson) => dataJson || []);
      setReservations(reservationsRes || []);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleDeleteClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    modalRef.current?.open();
  };

  const handleConfirmDelete = async () => {
    if (!selectedReservationId) return;

    setDeletingId(selectedReservationId);
    try {
      await deleteReservation(selectedReservationId);
      setReservations((prev) => prev.filter((r) => r.id !== selectedReservationId));
      modalRef.current?.close();
    } catch (err) {
      console.error('Failed to delete reservation', err);
    } finally {
      setDeletingId(null);
      setSelectedReservationId(null);
    }
  };

  const handleCancelDelete = () => {
    setSelectedReservationId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto space-y-8 px-4 py-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto space-y-8 px-4 py-8">
        <ReservationsCalendar
          reservations={reservations.filter((r) => r.status !== 'cancelled')}
          onDeleteReservation={handleDeleteClick}
          deletingId={deletingId}
        />
        <section className="mt-10">
          <h2 className="text-base-content mb-4 text-xl font-bold">Lista por estado</h2>
          <p className="text-base-content/70 mb-4 text-sm">
            Tus reservas consumen créditos de tu plan. Puedes desinscribirte hasta 4 horas antes del
            horario de la sesión; el crédito se devuelve a tu plan siempre que este permita
            reagendar. Accede al material, cancela o reagenda según el estado de cada reserva.
          </p>
          <MyReservations
            reservations={reservations}
            loading={false}
            onReservationDeleted={loadData}
          />
        </section>
      </main>
      <ConfirmActionModal
        ref={modalRef}
        title="¿Desinscribirte de esta sesión?"
        message="La reserva se cancelará y el slot quedará disponible para otros. Si tu plan permite reagendar, el crédito volverá a tu plan (hasta 4 horas antes del horario)."
        confirmText="Sí, desinscribirme"
        cancelText="No, mantener"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDangerous={true}
        isLoading={deletingId !== null}
      />
    </div>
  );
};

export default Reservations;
