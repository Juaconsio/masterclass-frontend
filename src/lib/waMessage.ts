const defaultMessage = 'Hola, revise el sitio de SalvaRamos y me gustaría saber más.';

/** E.164-style digits without + (required by wa.me links). Single source of truth. */
export const waPhoneDigits = '56934476377';

/**
 * Formats E.164 digits (no +) for display. Chile mobile: +56 9 XXXX XXXX.
 */
export function formatWaPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.startsWith('56') && d.length === 11 && d[2] === '9') {
    const rest = d.slice(3);
    return `+56 9 ${rest.slice(0, 4)} ${rest.slice(4)}`;
  }
  return d ? `+${d}` : '';
}

/** Same number as {@link waPhoneDigits}, formatted for UI labels and links text. */
export const waPhoneDisplay = formatWaPhoneDisplay(waPhoneDigits);

/**
 * Builds a WhatsApp click-to-chat URL for the site phone.
 */
export function waHrefWithMessage(message: string): string {
  return `https://wa.me/${waPhoneDigits}?text=${encodeURIComponent(message)}`;
}

const waUrl = waHrefWithMessage(defaultMessage);
export default waUrl;
