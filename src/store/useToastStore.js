import { create } from 'zustand';

let nextToastId = 0;

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, tone = 'success', duration = 4000) => {
    const id = ++nextToastId;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, duration);
    return id;
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

export default useToastStore;
