import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { httpClient } from '@/client/config';
import { fetchReservations, deleteReservation } from '@/client/reservations';
import { ReservationsCalendar } from './reservationsCalendar';
import type { Reservation } from '@/interfaces/events/IEvent';

export { default as ReservationCard } from './ReservationCard';
const Reservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  async function removeReservation(reservationId: number) {
    setDeletingId(reservationId);
    try {
      await deleteReservation(reservationId);
      // remove after successful deletion
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    } catch (err) {
      console.error('Failed to delete reservation', err);
    } finally {
      setDeletingId(null);
    }
  }

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
    <ReservationsCalendar
      reservations={reservations}
      onDeleteReservation={removeReservation}
      deletingId={deletingId}
    />
  );
};

export default Reservations;
