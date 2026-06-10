import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '../types';

export interface ProfileState {
  deliveryName: string;
  deliveryAddress: string;
  savedAddresses: Address[];
  pushNotificationsEnabled: boolean;
  detectedCity: string | null;
  detectedRegion: string | null;
  setDeliveryName: (name: string) => void;
  setDeliveryAddress: (address: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id'>>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setDetectedLocation: (city: string | null, region: string | null) => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      deliveryName: '',
      deliveryAddress: '',
      savedAddresses: [],
      pushNotificationsEnabled: true,
      detectedCity: null,
      detectedRegion: null,

      setDeliveryName: (deliveryName) => set({ deliveryName }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),

      addAddress: (input) =>
        set((state) => {
          const address: Address = { ...input, id: generateId() };
          const savedAddresses = state.savedAddresses.length === 0
            ? [{ ...address, isDefault: true }]
            : [...state.savedAddresses, address];
          return { savedAddresses };
        }),

      updateAddress: (id, updates) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      removeAddress: (id) =>
        set((state) => {
          const removed = state.savedAddresses.find((a) => a.id === id);
          let savedAddresses = state.savedAddresses.filter((a) => a.id !== id);
          if (removed?.isDefault && savedAddresses.length > 0) {
            savedAddresses = [{ ...savedAddresses[0], isDefault: true }, ...savedAddresses.slice(1)];
          }
          const deliveryAddress =
            removed?.isDefault && savedAddresses.length > 0
              ? savedAddresses[0].street
              : removed?.isDefault
              ? ''
              : state.deliveryAddress;
          return { savedAddresses, deliveryAddress };
        }),

      setDefaultAddress: (id) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
          deliveryAddress: state.savedAddresses.find((a) => a.id === id)?.street ?? state.deliveryAddress,
        })),

      setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),

      setDetectedLocation: (detectedCity, detectedRegion) => set({ detectedCity, detectedRegion }),
    }),
    {
      name: 'sweetnews-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
