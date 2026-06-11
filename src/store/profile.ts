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

const formatFullAddress = (addr: Address) => 
  `${addr.street}${addr.apt ? `, ${addr.apt}` : ''}, ${addr.city}, ${addr.state} ${addr.zip}`;

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      deliveryName: '',
      deliveryAddress: '',
      savedAddresses: [],
      pushNotificationsEnabled: true,
      detectedCity: null,
      detectedRegion: null,

      setDeliveryName: (deliveryName) => set({ deliveryName }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),

      addAddress: (input) => {
        const address: Address = { ...input, id: generateId() };
        const isFirst = get().savedAddresses.length === 0;
        const newAddress = isFirst ? { ...address, isDefault: true } : address;
        const savedAddresses = isFirst ? [newAddress] : [...get().savedAddresses, newAddress];
        const deliveryAddress = isFirst ? formatFullAddress(newAddress) : get().deliveryAddress;
        set({ savedAddresses, deliveryAddress });
      },

      updateAddress: (id, updates) => {
        const current = get();
        const updated = current.savedAddresses.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        );
        
        const newDefault = updated.find(a => a.isDefault);
        const deliveryAddress = newDefault ? formatFullAddress(newDefault) : '';
        set({ savedAddresses: updated, deliveryAddress });
      },

      removeAddress: (id) => {
        const current = get();
        let savedAddresses = current.savedAddresses.filter((a) => a.id !== id);
        const removed = current.savedAddresses.find(a => a.id === id);

        if (removed?.isDefault && savedAddresses.length > 0) {
          const newDefault = savedAddresses[0];
          savedAddresses = [{ ...newDefault, isDefault: true }, ...savedAddresses.slice(1)];
        }

        const newDefault = savedAddresses.find(a => a.isDefault);
        const deliveryAddress = newDefault ? formatFullAddress(newDefault) : '';
        set({ savedAddresses, deliveryAddress });
      },

      setDefaultAddress: (id) => {
        const current = get();
        const updated = current.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));
        const newDefault = updated.find(a => a.isDefault);
        const deliveryAddress = newDefault ? formatFullAddress(newDefault) : '';
        set({ savedAddresses: updated, deliveryAddress });
      },

      setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),

      setDetectedLocation: (detectedCity, detectedRegion) => set({ detectedCity, detectedRegion }),
    }),
    {
      name: 'sweetnews-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
