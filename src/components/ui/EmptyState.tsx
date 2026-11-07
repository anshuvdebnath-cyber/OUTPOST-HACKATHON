import { memo, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Frosted glass empty state with fluid entrance animation. */
export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card animate-fade-in-up flex flex-col items-center px-6 py-16 text-center">
      <div className="glass-pill mb-4 rounded-2xl p-4 text-ink">
        <Icon aria-hidden="true" className="h-7 w-7 stroke-[1.5]" />
      </div>
      <h2 className="text-xl font-normal tracking-[-0.02em] text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
});
