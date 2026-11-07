import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { MatchCheck } from './matchEngine';

const OUTCOME_META = {
  pass: { icon: CheckCircle2, cls: 'text-ink', sr: 'Met' },
  fail: { icon: XCircle, cls: 'text-ink-muted/60', sr: 'Not met' },
  unknown: { icon: HelpCircle, cls: 'text-ink-muted', sr: 'Unknown' },
} as const;

/** Explains each eligibility criterion in crisp monochrome typography. */
export function MatchReasons({ checks }: { checks: MatchCheck[] }) {
  return (
    <ul className="space-y-3" aria-label="Eligibility breakdown">
      {checks.map((c) => {
        const meta = OUTCOME_META[c.outcome];
        const Icon = meta.icon;
        return (
          <li key={c.key} className="glass-subtle flex items-start gap-3 rounded-2xl p-3">
            <Icon aria-hidden="true" className={cn('mt-0.5 h-4 w-4 shrink-0', meta.cls)} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                <span className="sr-only">{meta.sr}: </span>
                {c.label}
              </p>
              <p className="text-xs text-ink-muted">{c.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
