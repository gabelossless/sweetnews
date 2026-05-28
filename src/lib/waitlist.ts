import { collection, addDoc, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeObject, isValidEmail, isValidPhone, isNonEmpty } from './utils';

export interface WaitlistEntry {
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  city: string;
}

export class WaitlistValidationError extends Error {
  constructor(public field: keyof WaitlistEntry, message: string) {
    super(message);
    this.name = 'WaitlistValidationError';
  }
}

export class WaitlistDuplicateError extends Error {
  constructor() {
    super('This email is already on the waitlist.');
    this.name = 'WaitlistDuplicateError';
  }
}

export class WaitlistNetworkError extends Error {
  constructor() {
    super('Network issue submitting waitlist entry.');
    this.name = 'WaitlistNetworkError';
  }
}

const MAX_FIELD_LEN = 200;

function validate(entry: WaitlistEntry): void {
  if (!isNonEmpty(entry.fullName, 2, MAX_FIELD_LEN)) {
    throw new WaitlistValidationError('fullName', 'Please enter your name.');
  }
  if (!isValidEmail(entry.email) || entry.email.length > MAX_FIELD_LEN) {
    throw new WaitlistValidationError('email', 'Please enter a valid email address.');
  }
  if (!isValidPhone(entry.phone) || entry.phone.length > 50) {
    throw new WaitlistValidationError('phone', 'Please enter a valid phone number.');
  }
  if (!isNonEmpty(entry.city, 2, MAX_FIELD_LEN)) {
    throw new WaitlistValidationError('city', 'Please enter the city you want to deliver in.');
  }
  if (entry.vehicleType && entry.vehicleType.length > MAX_FIELD_LEN) {
    throw new WaitlistValidationError('vehicleType', 'Vehicle type is too long.');
  }
}

/**
 * Submits a new driver interest entry to the waitlist collection.
 * Validates and sanitizes input client-side and checks for duplicate email before write.
 */
export const joinDriverWaitlist = async (data: WaitlistEntry) => {
  const sanitized = sanitizeObject(data);
  validate(sanitized);

  const normalizedEmail = sanitized.email.toLowerCase();

  try {
    // Duplicate guard: same email already on list?
    const existing = await getDocs(
      query(collection(db, 'waitlist'), where('email', '==', normalizedEmail), limit(1))
    );
    if (!existing.empty) {
      throw new WaitlistDuplicateError();
    }

    const docRef = await addDoc(collection(db, 'waitlist'), {
      ...sanitized,
      email: normalizedEmail,
      vehicleType: sanitized.vehicleType || '',
      status: 'waiting',
      source: 'customer-app',
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 200),
      submittedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    if (error instanceof WaitlistDuplicateError || error instanceof WaitlistValidationError) {
      throw error;
    }
    console.error('Waitlist submission failed:', error);
    throw new WaitlistNetworkError();
  }
};
