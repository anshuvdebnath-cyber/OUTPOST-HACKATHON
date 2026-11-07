import { create } from 'zustand';
import type { ScholarshipFilters } from '@/types/scholarship';
import { DEFAULT_FILTERS } from '@/features/scholarships/filterScholarships';

interface FilterState {
  filters: ScholarshipFilters;
  setFilter: <K extends keyof ScholarshipFilters>(key: K, value: ScholarshipFilters[K]) => void;
  toggleInList: <K extends 'levels' | 'fields' | 'types'>(key: K, value: ScholarshipFilters[K][number]) => void;
  resetFilters: () => void;
}

/** Discover-page filters. Kept in memory so they survive navigation within a session. */
export const useFilterStore = create<FilterState>()((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  toggleInList: (key, value) =>
    set((s) => {
      const list = s.filters[key] as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { filters: { ...s.filters, [key]: next } };
    }),
  resetFilters: () => set((s) => ({ filters: { ...DEFAULT_FILTERS, sort: s.filters.sort } })),
}));

