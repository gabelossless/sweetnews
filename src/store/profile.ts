import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ProfileState {
  deliveryName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  pushNotificationsEnabled: boolean;
  detectedCity: string | null;
  detectedRegion: string | null;
  setDeliveryName: (name: string) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryPhone: (phone: string) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setDetectedLocation: (city: string | null, region: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      deliveryName: '',
      deliveryAddress: '',
      deliveryPhone: '',
      pushNotificationsEnabled: true,
      detectedCity: null,
      detectedRegion: null,
      setDeliveryName: (deliveryName) => set({ deliveryName }),
      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
      setDeliveryPhone: (deliveryPhone) => set({ deliveryPhone }),
      setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),
      setDetectedLocation: (detectedCity, detectedRegion) => set({ detectedCity, detectedRegion }),
    }),
    {
      name: 'sweetnews-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
