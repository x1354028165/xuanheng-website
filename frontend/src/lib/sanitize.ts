/** Strip HTML tags to prevent XSS in stored content */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Sanitize and trim a string field with max length */
export function sanitizeField(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return null;
  return stripHtml(value).trim().slice(0, maxLength) || null;
}

/** Validate email format loosely */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate phone number (digits, spaces, dashes, plus, parens) */
export function isValidPhone(phone: string): boolean {
  return /^[+\d\s\-()]{5,20}$/.test(phone);
}
