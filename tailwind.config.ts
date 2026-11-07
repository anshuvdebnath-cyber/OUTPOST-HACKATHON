import type { Config } from 'tailwindcss';

/**
 * Grantly Shader-Harmonized Glassmorphism Design System.
 *  - Light Mode: Sapphire-slate, periwinkle-sky, seafoam-aqua & warm champagne
 *  - Night Mode: Forest-emerald, abyssal-teal, luminous jade & champagne-mint
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
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59afff',
          500: '#2b8ce6',
          600: '#184e8a',
          700: '#123d6e',
          800: '#0f223d',
          900: '#081526',
        },
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        base: 'rgb(var(--color-base) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--color-accent-ink) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -12px rgb(6 24 44 / 0.16), inset 0 1px 1.5px 0 rgb(255 255 255 / 0.82), inset 0 -1px 1px 0 rgb(255 255 255 / 0.28)',
        lift: '0 28px 65px -12px rgb(6 24 44 / 0.26), inset 0 1.5px 2px 0 rgb(255 255 255 / 0.92), inset 0 -1px 1px 0 rgb(255 255 255 / 0.38)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translate3d(42px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translate3d(-42px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glass': {
          '0%, 100%': { opacity: '0.58' },
          '50%': { opacity: '0.92' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.42s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-right': 'slide-in-right 0.44s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-left': 'slide-in-left 0.44s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-glass': 'pulse-glass 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
