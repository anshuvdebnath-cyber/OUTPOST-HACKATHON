import { cn } from '@/lib/cn';
import type { MatchResult } from './matchEngine';

const VERDICT_META = {
  eligible: { label: 'Eligible', ring: 'text-accent', chip: 'bg-accent text-accent-ink' },
  likely: { label: 'Likely eligible', ring: 'text-ink/80', chip: 'text-ink' },
  ineligible: { label: 'Not eligible', ring: 'text-ink/35', chip: 'text-ink-muted' },
} as const;

interface MatchBadgeProps {
  match: MatchResult;
  size?: 'sm' | 'lg';
}

/** Shader-harmonized circular match-score gauge with frosted glass verdict label. */
export function MatchBadge({ match, size = 'sm' }: MatchBadgeProps) {
  const meta = VERDICT_META[match.verdict];
  const dim = size === 'lg' ? 88 : 48;
  const stroke = size === 'lg' ? 6 : 4;
  const r = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - match.score / 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90" aria-hidden="true">
          <circle cx={dim / 2} cy={dim / 2} r={r} strokeWidth={stroke} className="fill-none stroke-ink/15" />
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
            'absolute inset-0 grid place-items-center font-medium tracking-tight text-ink',
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
