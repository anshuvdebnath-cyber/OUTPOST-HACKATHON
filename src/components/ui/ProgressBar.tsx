import { cn } from '../../lib/cn';

interface ProgressBarProps {
  value: number;
  label: string;
  showValue?: boolean;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

/** Accessible shader-harmonized glass progress bar with smooth spring width transition. */
export function ProgressBar({ value, label, showValue = false, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
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
        className="glass-subtle h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
