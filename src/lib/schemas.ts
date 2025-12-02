import { z } from 'zod';
import { cleanRut, formatRut, validateRut } from '@/lib/rut';

// RUT schema with preprocessing to formatted form
export const rutSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== 'string') return raw;
    const cleaned = cleanRut(raw); // digits + k (lowercase)
    if (/^\d{7,8}[0-9k]$/.test(cleaned)) {
      return formatRut(cleaned);
    }
    return cleaned;
  },
  z.string().refine((val) => validateRut(val), {
    message: 'Ingresa un RUT válido (ej: 12.345.678-9)',
  })
);

// Phone schema normalizing to +569XXXXXXXX and validating
export const phoneSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== 'string') return raw;
    const cleaned = raw.replace(/[\s\-.]/g, '');
    if (/^09\d{8}$/.test(cleaned)) return `+56${cleaned.slice(1)}`;
    if (/^9\d{8}$/.test(cleaned)) return `+56${cleaned}`;
    if (/^\+569\d{8}$/.test(cleaned)) return cleaned;
    if (/^56\d{9}$/.test(cleaned) && cleaned.startsWith('569')) return `+${cleaned}`;
    return cleaned;
  },
  z.string().regex(/^\+569\d{8}$/, 'Ingresa un número de teléfono de Chile válido.')
);

export type RutSchema = typeof rutSchema;
export type PhoneSchema = typeof phoneSchema;
