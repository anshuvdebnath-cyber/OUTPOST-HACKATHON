import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCountdown, formatDate, getUrgency, type Urgency } from '@/lib/date';

const URGENCY_STYLES: Record<Urgency, string> = {
  closed: 'opacity-50 text-ink-muted',
  critical: 'bg-accent text-accent-ink font-semibold',
  soon: 'text-ink font-medium',
  upcoming: 'text-ink',
  later: 'text-ink-muted',
};

/** Shader-matched glass deadline countdown chip. */
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
