import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { MatchCheck } from './matchEngine';

const OUTCOME_META = {
  pass: { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400', sr: 'Met' },
  fail: { icon: XCircle, cls: 'text-rose-600 dark:text-rose-400', sr: 'Not met' },
  unknown: { icon: HelpCircle, cls: 'text-amber-600 dark:text-amber-400', sr: 'Unknown' },
} as const;

/** Explains each eligibility criterion — the "why" behind a match score. */
export function MatchReasons({ checks }: { checks: MatchCheck[] }) {
  return (
    <ul className="space-y-2.5" aria-label="Eligibility breakdown">
      {checks.map((c) => {
        const meta = OUTCOME_META[c.outcome];
        const Icon = meta.icon;
        return (
          <li key={c.key} className="flex items-start gap-3">
            <Icon aria-hidden="true" className={cn('mt-0.5 h-5 w-5 shrink-0', meta.cls)} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                <span className="sr-only">{meta.sr}: </span>
                {c.label}
              </p>
              <p className="text-sm text-ink-muted">{c.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

