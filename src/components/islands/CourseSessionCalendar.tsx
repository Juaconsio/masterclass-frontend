import { useState, useEffect } from 'react';
import { getSlotsByCourseAcronym } from '@/client/courses';
import { SlotInfo } from '@components/slots';
import type { IEvent } from '@interfaces/events/IEvent';
import type { SlotModality, SlotStatus } from '@interfaces/enums';
import type { ISlot } from '@interfaces/models';

interface ClassWithSlots {
  title: string;
  slots: ISlot[];
}

interface CourseSessionCalendarProps {
  courseAcronym: string;
}

export default function CourseSessionCalendar({ courseAcronym }: CourseSessionCalendarProps) {
  const [classesData, setClassesData] = useState<ClassWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const data = await getSlotsByCourseAcronym(courseAcronym);
        setClassesData(data.classes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading slots');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [courseAcronym]);

  const handleSelectSlot = (slotId: number) => {
    window.location.href = `/checkout?courseAcronym=${courseAcronym}&slotId=${slotId}`;
  };

  // Filtrar solo las clases que tienen slots
  const classesWithSlots = classesData.filter((classData) => classData.slots.length > 0);

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

  if (classesWithSlots.length === 0) {
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

        {/* Tabs de DaisyUI */}
        <div role="tablist" className="tabs tabs-boxed mt-2">
          {classesWithSlots.map((classData, index) => (
            <button
              key={index}
              role="tab"
              className={`tab ${activeTab === index ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {classData.title}
            </button>
          ))}
        </div>

        {/* Contenido de los tabs */}
        <div className="mt-4">
          {classesWithSlots.map((classData, index) => (
            <div key={index} className={`space-y-3 ${activeTab === index ? '' : 'hidden'}`}>
              {classData.slots.map((slot) => {
                // Convertir slot a IEvent para SlotInfo
                const event: IEvent = {
                  id: slot.id,
                  classId: slot.classId,
                  professorId: slot.professorId,
                  professor: slot.professor,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  modality: slot.modality as SlotModality,
                  status: slot.status as SlotStatus,
                  studentsGroup: 'group' as const,
                  minStudents: slot.minStudents,
                  maxStudents: slot.maxStudents,
                  class: {
                    id: slot.classId,
                    title: classData.title,
                    courseId: 0,
                    description: '',
                    orderIndex: 0,
                    basePrice: 0,
                  },
                  reservations: [],
                };

                return (
                  <div key={slot.id} className="relative">
                    <SlotInfo
                      event={event}
                      variant="detailed"
                      action={
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSlot(slot.id);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Inscribirse en esta sesión
                          </button>
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
