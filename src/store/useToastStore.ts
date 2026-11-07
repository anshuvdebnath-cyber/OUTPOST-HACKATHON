import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Lightweight toast notifications announced to screen readers via an aria-live region. */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper usable outside React components. */
export const toast = (message: string, tone?: Toast['tone']) => useToastStore.getState().push(message, tone);

