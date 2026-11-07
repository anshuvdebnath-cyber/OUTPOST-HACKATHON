import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

/** Toggles between light and dark monochrome glass themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className="glass-subtle grid h-9 w-9 place-items-center rounded-full text-ink transition duration-300 hover:scale-105 active:scale-95"
    >
      {isDark ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
    </button>
  );
}
