/**
 * Remove all non RUT characters and normalize case
 * @param input - Raw RUT string
 * @returns Cleaned rut with digits and optional 'k'
 */
export function cleanRut(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/[^0-9kK]/g, '')
    .toLowerCase();
}

/**
 * Compute the verification digit (DV) for a RUT body
 * @param body - RUT number without DV
 * @returns DV as digit or 'k'
 */
export function computeRutDV(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return '0';
  if (mod === 10) return 'k';
  return String(mod);
}

/**
 * Validate a Chilean RUT string
 * @param rut - RUT string with or without dots/hyphen
 * @returns Whether the RUT is valid
 */
export function validateRut(rut: string | undefined | null): boolean {
  const cleaned = cleanRut(rut);
  if (!cleaned || cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  const expected = computeRutDV(body);
  return dv === expected;
}

/**
 * Format a RUT for display: 12.345.678-9
 * @param rut - Raw RUT string
 * @returns Formatted RUT or empty string
 */
export function formatRut(rut: string | undefined | null): string {
  const cleaned = cleanRut(rut);
  if (!cleaned) return '';
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Progressive input formatter for RUT fields
 * @param input - Current input value
 * @returns Formatted input value
 */
export function formatRutInput(input: string | undefined | null): string {
  const cleaned = cleanRut(input);
  if (!cleaned) return '';
  if (cleaned.length === 1) return cleaned; // dv only typing scenario
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Normalize RUT to canonical form without dots, with hyphen
 * @param rut - Any rut string
 * @returns Canonical rut: 12345678-9
 */
export function normalizeRut(rut: string | undefined | null): string {
  const cleaned = cleanRut(rut);
  if (!cleaned) return '';
  if (cleaned.length === 1) return cleaned;
  return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;
}
