import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

/** Light / dark theme preference. Defaults to the OS setting. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: prefersDark() ? 'dark' : 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'grantly-theme' },
  ),
);

