import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { httpClient } from '@/client/config';
import { fetchReservations, deleteReservation } from '@/client/reservations';
import { ReservationsCalendar } from './reservationsCalendar';
import type { Reservation } from '@/interfaces/events/IEvent';
import { ConfirmActionModal, type ConfirmActionModalRef } from '@/components/UI/ConfirmActionModal';

export { default as ReservationCard } from './ReservationCard';
const Reservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const modalRef = useRef<ConfirmActionModalRef>(null);

  async function loadData() {
    setLoading(true);
    try {
      const reservationsRes = await fetchReservations().then((dataJson) => dataJson || []);
      // Filtrar solo reservas activas (pending o confirmed)
      const activeReservations = (reservationsRes || []).filter(
        (r: Reservation) => r.status === 'pending' || r.status === 'confirmed'
      );
      setReservations(activeReservations);
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
    <>
      <ReservationsCalendar
        reservations={reservations}
        onDeleteReservation={handleDeleteClick}
        deletingId={deletingId}
      />
      <ConfirmActionModal
        ref={modalRef}
        title="¿Cancelar reserva?"
        message="Esta acción marcará tu reserva como cancelada. Los datos se conservarán pero el slot quedará disponible para otros estudiantes."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDangerous={true}
        isLoading={deletingId !== null}
      />
    </>
  );
};

export default Reservations;
