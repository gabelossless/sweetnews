import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface DriverProfile {
  uid: string;
  vehicleInfo: {
    model: string;
    licensePlate: string;
    color: string;
  };
  driverPhotoURL?: string;
}

/**
 * Updates or creates a driver profile.
 */
export const updateDriverProfile = async (uid: string, data: Partial<DriverProfile>) => {
  const driverRef = doc(db, 'drivers', uid);
  await setDoc(driverRef, data, { merge: true });
};

/**
 * Uploads a driver profile photo to Firebase Storage.
 */
export const uploadDriverPhoto = async (uid: string, file: File) => {
  const storageRef = ref(storage, `drivers/${uid}/profile_${Date.now()}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // Sync with Firestore
        await updateDriverProfile(uid, { driverPhotoURL: downloadURL });
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Fetches driver profile metadata.
 */
export const getDriverProfile = async (uid: string) => {
  const driverRef = doc(db, 'drivers', uid);
  const snap = await getDoc(driverRef);
  return snap.exists() ? snap.data() as DriverProfile : null;
};
