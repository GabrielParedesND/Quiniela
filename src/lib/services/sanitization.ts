/**
 * Sanitize user-provided text by trimming whitespace and escaping HTML characters.
 * Prevents XSS/script injection when text is rendered.
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize an object's string fields.
 * Only sanitizes fields that are strings and not undefined.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj };
  for (const field of fields) {
    const value = sanitized[field];
    if (typeof value === 'string') {
      (sanitized[field] as unknown) = sanitizeText(value);
    }
  }
  return sanitized;
}
