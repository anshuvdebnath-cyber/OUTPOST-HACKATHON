import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

const ICONS = { success: CheckCircle2, info: Info, error: XCircle };

/** Renders active toasts in a frosted glass pill inside a polite live region. */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2.5 px-4 lg:bottom-8 lg:items-end lg:pr-8"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="glass-pill pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-center gap-3 rounded-full px-5 py-3"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-ink" />
            <p className="flex-1 text-xs font-medium text-ink">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-full p-1 text-ink-muted transition hover:bg-ink/10 hover:text-ink"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
