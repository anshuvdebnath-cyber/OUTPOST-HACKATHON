import { cn } from '@/lib/cn';
import type { MatchResult } from './matchEngine';

const VERDICT_META = {
  eligible: { label: 'Eligible', ring: 'text-emerald-500', chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  likely: { label: 'Likely eligible', ring: 'text-amber-500', chip: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' },
  ineligible: { label: 'Not eligible', ring: 'text-rose-500', chip: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
} as const;

interface MatchBadgeProps {
  match: MatchResult;
  size?: 'sm' | 'lg';
}

/** Circular match-score gauge with a verdict label. */
export function MatchBadge({ match, size = 'sm' }: MatchBadgeProps) {
  const meta = VERDICT_META[match.verdict];
  const dim = size === 'lg' ? 88 : 48;
  const stroke = size === 'lg' ? 8 : 5;
  const r = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - match.score / 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90" aria-hidden="true">
          <circle cx={dim / 2} cy={dim / 2} r={r} strokeWidth={stroke} className="fill-none stroke-surface-muted" />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('fill-none stroke-current transition-[stroke-dashoffset] duration-700', meta.ring)}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 grid place-items-center font-bold text-ink',
            size === 'lg' ? 'text-xl' : 'text-xs',
          )}
        >
          {match.score}%
        </span>
      </div>
      <div>
        <span className="sr-only">Match score {match.score} out of 100. </span>
        <span className={cn('chip', meta.chip)}>{meta.label}</span>
        {size === 'lg' && <p className="mt-1 text-xs text-ink-muted">Based on your profile</p>}
      </div>
    </div>
  );
}

