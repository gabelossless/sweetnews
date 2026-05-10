/**
 * Sanitizes a string by removing HTML tags and trimming whitespace.
 * Prevents basic XSS and injection when saving to Firestore.
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();
};

/**
 * Sanitizes an object of strings.
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    }
  }
  return sanitized;
};
