import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

/**
 * Grantly Adaptive Refractive-Prism Crest Logo:
 *  - Light Mode: Sapphire-navy & periwinkle-sky glass tile with ivory-sky & warm champagne facets
 *  - Dark Mode: Abyssal-emerald & luminous jade glass tile with mint-crystal & champagne-gold facets
 *  - Features three ascending fluted glass pillars crowned by a diamond academic crest & 4-point spark
 */
export function Logo({ to = '/', size = 'md' }: { to?: string; size?: 'sm' | 'md' }) {
  const uid = useId().replace(/:/g, '');
  const reedGradId = `grantly-reed-${uid}`;
  const centerGradId = `grantly-center-${uid}`;
  const capGradId = `grantly-cap-${uid}`;

  return (
    <Link
      to={to}
      aria-label="Grantly home"
      className="group inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 transition duration-300 hover:opacity-95"
    >
      <span
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-xl border transition-all duration-500 group-hover:scale-105',
          // Light mode: Sapphire-navy -> Periwinkle-sky refractive glass tile
          'border-white/75 bg-gradient-to-br from-[#0f294a] via-[#184b82] to-[#3b82c4] shadow-[0_6px_18px_-4px_rgba(15,41,74,0.38),inset_0_1.5px_1.5px_rgba(255,255,255,0.65)]',
          // Dark mode: Abyssal-emerald -> Luminous-jade refractive glass tile
          'dark:border-[#a7f3d0]/45 dark:from-[#04241c] dark:via-[#0b5c46] dark:to-[#22a077] dark:shadow-[0_6px_20px_-4px_rgba(2,20,15,0.62),inset_0_1.5px_1.5px_rgba(209,250,229,0.45)]',
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        )}
      >
        {/* Subtle diagonal glass specular reflection */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.04)_48%,transparent_100%)]"
        />
        <svg
          viewBox="0 0 36 36"
          className={cn('relative z-10', size === 'sm' ? 'h-5 w-5' : 'h-6 w-6')}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={reedGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.78" className="dark:[stop-color:#a7f3d0]" />
            </linearGradient>
            <linearGradient id={centerGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
              <stop offset="52%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.86" className="dark:[stop-color:#6ee7b7]" />
            </linearGradient>
            <linearGradient id={capGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Three ascending fluted glass pillars */}
          <rect x="6.5" y="16.5" width="5" height="13" rx="2.5" fill={`url(#${reedGradId})`} />
          <rect x="15.5" y="12" width="5" height="17.5" rx="2.5" fill={`url(#${centerGradId})`} />
          <rect x="24.5" y="8" width="5" height="21.5" rx="2.5" fill={`url(#${reedGradId})`} />

          {/* Crystalline 4-point scholarship star spark above the first pillar */}
          <path
            d="M9 5.8 L10 8.5 L12.7 9.5 L10 10.5 L9 13.2 L8 10.5 L5.3 9.5 L8 8.5 Z"
            fill={`url(#${capGradId})`}
          />
        </svg>
      </span>
      <span
        className={cn(
          'font-display font-medium tracking-[-0.03em] text-ink',
          size === 'sm' ? 'text-lg' : 'text-xl',
        )}
      >
        Grantly
      </span>
    </Link>
  );
}
