import { cn } from '../../lib/cn';

/** Frosted glass shimmering loader block with fluid motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('card relative overflow-hidden animate-pulse-glass', className)}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/15" />
    </div>
  );
}

/** Full-page fluid glass loading fallback used by React.Suspense for lazy routes. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-page-enter space-y-5">
      <span className="sr-only">Loading content…</span>
      <Skeleton className="h-10 w-72 rounded-full" />
      <Skeleton className="h-5 w-96 max-w-full rounded-full" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
