import { create } from 'zustand';

export interface ToastState {
  toastMessage: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let toastTimeout: number | null = null;

export const useToastStore = create<ToastState>((set) => ({
  toastMessage: null,
  showToast: (message) => {
    // Clear any previous active timeouts to prevent racing overlaps
    if (toastTimeout !== null) {
      window.clearTimeout(toastTimeout);
    }

    set({ toastMessage: message });

    toastTimeout = window.setTimeout(() => {
      set({ toastMessage: null });
      toastTimeout = null;
    }, 2500);
  },
  hideToast: () => {
    if (toastTimeout !== null) {
      window.clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    set({ toastMessage: null });
  }
}));

export default useToastStore;
