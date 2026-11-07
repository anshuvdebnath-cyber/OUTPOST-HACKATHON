import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';

/** Toggles between light and dark themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink-muted transition hover:text-ink"
    >
      {isDark ? <Sun aria-hidden="true" className="h-5 w-5" /> : <Moon aria-hidden="true" className="h-5 w-5" />}
    </button>
  );
}

