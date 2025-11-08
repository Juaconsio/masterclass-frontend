import { startOfWeek } from 'date-fns';
import type { APIRoute } from 'astro';
import type { Slot } from '@/interfaces';

export const prerender = false;

export const GET: APIRoute = async ({ params }): Promise<Response> => {
  const { acronym } = params as { acronym: string };

  try {
    // Fetch all slots
    const response = await fetch(
      `${import.meta.env.PUBLIC_BACKEND_API_URL}/courses/${acronym}/slots`
    );
    if (!response.ok) throw new Error('Failed to fetch slots');
    const course = await response.json();
    // Filter slots for this course
    const now = new Date().toISOString();
    const filteredSlots = course.classes.map((cls: any) => {
      const slots = cls.slots
        .flat()
        .filter((slot: Slot) => slot && slot.startTime >= now) // Filtrar por existencia y fecha futura
        .sort(
          (a: Slot, b: Slot) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      return { title: cls.title, slots };
    });

    return new Response(JSON.stringify({ slots: filteredSlots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch sessions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
