/**
 * Formats a Chilean phone number to the format: +56 9 1234 5678
 * @param phone - Phone number (can include +56, spaces, dashes, etc.)
 * @returns Formatted number or original if invalid
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  let cleanNumber = digits;
  if (digits.startsWith('56')) {
    cleanNumber = digits.substring(2);
  }

  if (cleanNumber.length !== 9) {
    return phone;
  }

  const countryCode = '56';
  const firstDigit = cleanNumber[0];
  const firstPart = cleanNumber.substring(1, 5);
  const secondPart = cleanNumber.substring(5, 9);

  return `+${countryCode} ${firstDigit} ${firstPart} ${secondPart}`;
}

/**
 * Formats a phone number as the user types (for inputs)
 * @param value - Current input value
 * @returns Formatted value
 */
export function formatPhoneInput(value: string): string {
  let cleaned = value.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+56')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('56')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  cleaned = cleaned.substring(0, 9);

  if (cleaned.length === 0) return '';

  let formatted = '+56';

  if (cleaned.length > 0) {
    formatted += ` ${cleaned[0]}`;
  }

  if (cleaned.length > 1) {
    formatted += ` ${cleaned.substring(1, 5)}`;
  }

  if (cleaned.length > 5) {
    formatted += ` ${cleaned.substring(5, 9)}`;
  }

  return formatted.trim();
}

/**
 * Cleans a formatted number for backend submission
 * @param phone - Formatted phone number
 * @returns Clean number with format +56912345678
 */
export function cleanPhone(phone: string): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (!digits.startsWith('56')) {
    return `+56${digits}`;
  }

  return `+${digits}`;
}
