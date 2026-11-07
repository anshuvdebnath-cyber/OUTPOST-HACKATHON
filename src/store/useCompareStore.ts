import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_COMPARE = 3;

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

/** Scholarships selected for side-by-side comparison (max 3). */
export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => {
          if (s.ids.includes(id)) return { ids: s.ids.filter((x) => x !== id) };
          if (s.ids.length >= MAX_COMPARE) return s;
          return { ids: [...s.ids, id] };
        }),
      clear: () => set({ ids: [] }),
    }),
    { name: 'grantly-compare' },
  ),
);

