/**
 * Formats a Chilean phone number as the user types
 * Automatically adds the +569 prefix if not present
 *
 * @param value - Current input value
 * @returns Phone number formatted with +569 prefix
 */
export function formatPhoneInput(value: string): string {
  if (!value) return '';

  let cleaned = value.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('09')) {
    cleaned = '+56' + cleaned.slice(1);
  } else if (cleaned.startsWith('9') && !cleaned.startsWith('+')) {
    cleaned = '+56' + cleaned;
  } else if (cleaned.startsWith('56') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('+56') && !cleaned.startsWith('+569')) {
    const afterPrefix = cleaned.slice(3);
    if (afterPrefix && afterPrefix[0] === '9') {
    } else if (afterPrefix) {
      cleaned = '+569' + afterPrefix;
    }
  } else if (!cleaned.startsWith('+') && cleaned.length > 0) {
    cleaned = '+569' + cleaned;
  }

  if (cleaned.length > 13) {
    cleaned = cleaned.slice(0, 13);
  }

  return cleaned;
}

/**
 * Formats a Chilean RUT as the user types
 * Applies the XX.XXX.XXX-X format automatically
 *
 * @param value - Current input value
 * @returns RUT formatted with dots and dash
 */
export function formatRutInput(value: string): string {
  if (!value) return '';

  let cleaned = value.replace(/[^\dKk]/g, '').toUpperCase();

  if (cleaned.length > 9) {
    cleaned = cleaned.slice(0, 9);
  }

  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (!verifier) return formatted;

  return `${formatted}-${verifier}`;
}
