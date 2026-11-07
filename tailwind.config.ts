import type { Config } from 'tailwindcss';

/**
 * Grantly Monochrome Glassmorphism Design System.
 * All UI tokens are strictly black, white, and translucent monochrome shades.
 * Colour exists exclusively in the live WebGL shader background.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
    },
    extend: {
      colors: {
        // Remap brand scale to pure monochrome so every utility is strictly B&W
        brand: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#52525b',
          600: '#18181b',
          700: '#09090b',
          800: '#050505',
          900: '#000000',
        },
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        base: 'rgb(var(--color-base) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -12px rgb(0 0 0 / 0.16), inset 0 1px 1px 0 rgb(255 255 255 / 0.8), inset 0 -1px 1px 0 rgb(255 255 255 / 0.25)',
        lift: '0 28px 65px -12px rgb(0 0 0 / 0.28), inset 0 1.5px 2px 0 rgb(255 255 255 / 0.92), inset 0 -1px 1px 0 rgb(255 255 255 / 0.35)',
        glass:
          '0 24px 60px -15px rgb(0 0 0 / 0.22), inset 0 1.5px 1.5px 0 rgb(255 255 255 / 0.85), inset 1px 0 1px 0 rgb(255 255 255 / 0.45), inset 0 -1px 1px 0 rgb(255 255 255 / 0.2)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 14px, 0) scale(0.985)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translate3d(0, 18px, 0) scale(0.99)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glass': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.01)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-enter': 'page-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-glass': 'pulse-glass 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
