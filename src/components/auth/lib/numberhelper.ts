import { z } from 'zod';

const phoneSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== 'string') return raw;

    // Elimina espacios, guiones, puntos, etc.
    const cleaned = raw.replace(/[\s\-.]/g, '');

    // Si empieza con 09 => cambia a +569
    if (/^09\d{8}$/.test(cleaned)) return `+56${cleaned.slice(1)}`;

    // Si empieza con 9 y tiene 9 dígitos => agrega +56
    if (/^9\d{8}$/.test(cleaned)) return `+56${cleaned}`;

    // Si ya está en formato +569XXXXXXXX
    if (/^\+569\d{8}$/.test(cleaned)) return cleaned;

    return cleaned; // devolver lo limpiado aunque no sea válido aún
  },
  z.string().regex(/^\+569\d{8}$/, 'Ingresa un número de teléfono de Chile válido.')
);

export default phoneSchema;
