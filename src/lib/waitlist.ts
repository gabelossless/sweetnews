import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeObject } from './utils';

export interface WaitlistEntry {
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  city: string;
}

/**
 * Submits a new driver interest entry to the waitlist collection.
 */
export const joinDriverWaitlist = async (data: WaitlistEntry) => {
  const sanitized = sanitizeObject(data);
  
  try {
    const docRef = await addDoc(collection(db, 'waitlist'), {
      ...sanitized,
      status: 'waiting',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Waitlist submission failed:', error);
    throw error;
  }
};
