import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  label: string;
  showValue?: boolean;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

const TONES = {
  brand: 'bg-gradient-to-r from-brand-500 to-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

/** Accessible progress bar exposing role="progressbar" with aria values. */
export function ProgressBar({ value, label, showValue = false, tone = 'brand', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>{label}</span>
          <span className="font-semibold text-ink">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500', TONES[tone])} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
