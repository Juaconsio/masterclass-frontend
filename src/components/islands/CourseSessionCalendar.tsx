import { useState, useEffect } from 'react';

interface Slot {
  id: number;
  classId: number;
  professorId: number;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  minStudents: number;
  maxStudents: number;
}

interface CourseSessionCalendarProps {
  courseId: string;
}

export default function CourseSessionCalendar({ courseId }: CourseSessionCalendarProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch(`/api/courses/${courseId}/next-slots`);
        if (!response.ok) throw new Error('Failed to fetch slots');
        const data = await response.json();
        setSlots(data.slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading slots');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [courseId]);

  const handleSelectSlot = (slotId: number) => {
    setSelectedSlot(slotId);
    window.location.href = `/registrar?course=${courseId}&slot=${slotId}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="card bg-white shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Próximas Sesiones</h3>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-white shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Próximas Sesiones</h3>
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="card bg-white shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Próximas Sesiones</h3>
          <div className="alert alert-info mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>No hay sesiones disponibles para este curso en este momento.</span>
          </div>
        </div>
      </div>
    );
  }

  const displaySlots = slots.slice(0, 3);

  return (
    <div className="card bg-white shadow-xl">
      <div className="card-body">
        <h3 className="card-title">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Próximas Sesiones
        </h3>

        <div className="mt-4 space-y-3">
          {displaySlots.map((slot) => {
            const start = formatDateTime(slot.startTime);
            const end = formatDateTime(slot.endTime);
            const availableSpots = slot.maxStudents - slot.minStudents;

            return (
              <div
                key={slot.id}
                className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors ${
                  selectedSlot === slot.id ? 'ring-primary ring-2' : ''
                }`}
                onClick={() => setSelectedSlot(slot.id)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-base-content font-medium">{start.date}</p>
                      <p className="text-base-content/70 text-sm">
                        {start.time} - {end.time}
                      </p>
                      <p className="text-base-content/70 mt-1 text-sm">
                        Modalidad: {slot.modality}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`badge ${availableSpots > 5 ? 'badge-success' : availableSpots > 0 ? 'badge-warning' : 'badge-error'}`}
                      >
                        {availableSpots > 0 ? `${availableSpots} cupos` : 'Lleno'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedSlot && (
          <div className="card-actions mt-4 justify-end">
            <button onClick={() => handleSelectSlot(selectedSlot)} className="btn btn-primary">
              Inscribirse en esta sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
