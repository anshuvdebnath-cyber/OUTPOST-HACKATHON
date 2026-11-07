import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/cn';

const ICONS = { success: CheckCircle2, info: Info, error: XCircle };
const TONES = {
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-brand-600 dark:text-brand-300',
  error: 'text-rose-600 dark:text-rose-400',
};

/** Renders active toasts in a polite live region so screen readers announce them. */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="card pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-center gap-3 px-4 py-3"
          >
            <Icon aria-hidden="true" className={cn('h-5 w-5 shrink-0', TONES[t.tone])} />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-ink-muted hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

