const defaultMessage = 'Hola, revise el sitio de SalvaRamos y quisieramos saber más.';
export const phoneNumber = '+56 9 3447 6377';

/** E.164-style digits without + (required by wa.me links). */
export const waPhoneDigits = '56934476377';

/**
 * Builds a WhatsApp click-to-chat URL for the site phone.
 */
export function waHrefWithMessage(message: string): string {
  return `https://wa.me/${waPhoneDigits}?text=${encodeURIComponent(message)}`;
}

const waUrl = waHrefWithMessage(defaultMessage);
export default waUrl;
