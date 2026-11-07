import { Link } from 'react-router-dom';

/**
 * Grantly Fluted-Prism Logo:
 * Three ascending cylindrical glass reeds with a luminous apex spark,
 * paired with the editorial Grantly wordmark.
 */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      aria-label="Grantly home"
      className="group inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition duration-300 hover:opacity-90"
    >
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/45 bg-gradient-to-br from-[#2b5876] via-[#1c7c64] to-[#68c4af] shadow-sm transition-transform duration-300 group-hover:scale-105 dark:from-[#062834] dark:via-[#0b5c44] dark:to-[#24a179]">
        <svg viewBox="0 0 36 36" className="h-6 w-6" aria-hidden="true">
          <defs>
            <linearGradient id="grantly-reed-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#c7f9e5" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="grantly-reed-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.82" />
            </linearGradient>
          </defs>
          <rect x="6.5" y="15" width="5.2" height="14.5" rx="2.6" fill="url(#grantly-reed-a)" />
          <rect x="15.4" y="10" width="5.2" height="19.5" rx="2.6" fill="url(#grantly-reed-b)" />
          <rect x="24.3" y="6.5" width="5.2" height="23" rx="2.6" fill="url(#grantly-reed-a)" />
          <circle cx="9.1" cy="10" r="2.1" fill="#fde68a" />
        </svg>
      </span>
      <span className="font-display text-lg font-medium tracking-[-0.03em] text-ink">Grantly</span>
    </Link>
  );
}
