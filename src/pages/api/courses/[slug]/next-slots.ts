import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }): Promise<Response> => {
  const { slug } = params as { slug: string };

  try {
    // Fetch all slots
    const response = await fetch(`${import.meta.env.PUBLIC_BACKEND_API_URL}/slots`);
    if (!response.ok) throw new Error('Failed to fetch slots');
    const allSlots = await response.json();
    
    // Parse courseId from slug (you may need to adjust this based on your routing)
    const courseId = parseInt(slug);
    
    // Filter slots for this course
    const filteredSlots = allSlots
      .filter((slot: any) => 
        slot.classId === courseId && 
        slot.status === 'candidate'
      )
      .sort((a: any, b: any) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

    return new Response(JSON.stringify({ slots: filteredSlots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch sessions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};