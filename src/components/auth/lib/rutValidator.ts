import { z } from 'zod';

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rut - RUT sin puntos, guiones ni dígito verificador
 * @returns El dígito verificador calculado (puede ser '0'-'9' o 'K')
 */
function calculateVerifier(rut: string): string {
  let sum = 0;
  let multiplier = 2;

  // Recorre el RUT de derecha a izquierda
  for (let i = rut.length - 1; i >= 0; i--) {
    sum += parseInt(rut[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const verifier = 11 - remainder;

  if (verifier === 11) return '0';
  if (verifier === 10) return 'K';
  return verifier.toString();
}

/**
 * Valida que el RUT sea correcto según el algoritmo chileno
 * @param rut - RUT completo (con o sin formato)
 * @returns true si es válido, false en caso contrario
 */
function isValidRut(rut: string): boolean {
  // Limpia el RUT: elimina puntos, guiones y espacios
  const cleaned = rut.replace(/[\s.\-]/g, '').toUpperCase();

  // Debe tener entre 8 y 9 caracteres (7-8 dígitos + 1 verificador)
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;

  // Separa el cuerpo del dígito verificador
  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  // Calcula y compara
  return calculateVerifier(body) === verifier;
}

/**
 * Formatea un RUT al formato estándar: XX.XXX.XXX-X
 * @param rut - RUT sin formato
 * @returns RUT formateado
 */
function formatRut(rut: string): string {
  const cleaned = rut.replace(/[\s.\-]/g, '').toUpperCase();

  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  // Añade los puntos al cuerpo
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted}-${verifier}`;
}

const rutSchema = z.preprocess(
  (raw) => {
    if (typeof raw !== 'string') return raw;

    // Limpia el RUT: elimina espacios, puntos y guiones
    const cleaned = raw.replace(/[\s.\-]/g, '').toUpperCase();

    // Si tiene el formato correcto, lo devuelve formateado
    if (/^\d{7,8}[0-9K]$/.test(cleaned)) {
      return formatRut(cleaned);
    }

    return cleaned; // devolver lo limpiado aunque no sea válido aún
  },
  z.string().refine(isValidRut, {
    message: 'Ingresa un RUT válido (ej: 12.345.678-9)',
  })
);

export default rutSchema;
export { isValidRut, formatRut, calculateVerifier };
