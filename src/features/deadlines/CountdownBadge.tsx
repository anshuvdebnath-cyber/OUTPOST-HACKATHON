import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCountdown, formatDate, getUrgency, type Urgency } from '@/lib/date';

const URGENCY_STYLES: Record<Urgency, string> = {
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  upcoming: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  later: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
};

/** Colour-coded deadline countdown chip (red ≤3 days, amber ≤10, blue ≤30, green later). */
export function CountdownBadge({ deadline, className }: { deadline: string; className?: string }) {
  const urgency = getUrgency(deadline);
  return (
    <span
      className={cn('chip whitespace-nowrap', URGENCY_STYLES[urgency], className)}
      title={`Deadline: ${formatDate(deadline)}`}
    >
      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
      <span>
        {formatCountdown(deadline)}
        <span className="sr-only">, deadline {formatDate(deadline)}</span>
      </span>
    </span>
  );
}

