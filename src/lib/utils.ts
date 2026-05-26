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

/** Basic RFC-5322-ish email check. Catches obvious typos, not adversarial input. */
export const isValidEmail = (s: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

/** Phone is valid if it contains 7–15 digits (E.164 max). Ignores spacing/punctuation. */
export const isValidPhone = (s: string): boolean => {
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

/** String is non-empty after trim and within length bounds. */
export const isNonEmpty = (s: string, min = 2, max = 200): boolean => {
  const t = s.trim();
  return t.length >= min && t.length <= max;
};

/** Builds a deep-link URL to open the user's preferred maps app for a given address. */
export const getMapUrl = (address: string): string => {
  const encoded = encodeURIComponent(address);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
};
