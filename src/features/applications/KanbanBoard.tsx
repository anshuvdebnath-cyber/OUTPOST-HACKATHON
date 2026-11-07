import { memo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getScholarshipById } from '@/data/scholarships';
import { CountdownBadge } from '@/features/deadlines/CountdownBadge';
import { APPLICATION_STATUSES, STATUS_META } from '@/lib/constants';
import { formatINRCompact } from '@/lib/currency';
import { cn } from '@/lib/cn';
import { applicationProgress, useApplicationStore } from '@/store/useApplicationStore';
import { toast } from '@/store/useToastStore';
import type { Application, ApplicationStatus } from '@/types/scholarship';

const DRAG_TYPE = 'application/x-grantly-scholarship';

/**
 * Balanced frosted-glass Kanban board of applications grouped by status.
 * Responsive horizontal scroll on compact screens, 6 uniform columns on desktop.
 */
export function KanbanBoard({ applications }: { applications: Application[] }) {
  const moveApplication = useApplicationStore((s) => s.moveApplication);
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);

  const onDrop = (status: ApplicationStatus) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    if (id) {
      moveApplication(id, status);
      toast(`Moved to ${STATUS_META[status].label}`);
    }
  };

  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
      <div className="grid min-w-max auto-cols-[18rem] grid-flow-col gap-4.5 xl:min-w-0 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-6">
        {APPLICATION_STATUSES.map((status) => {
          const items = applications.filter((a) => a.status === status);
          const meta = STATUS_META[status];
          const isTargeted = dragOver === status;

          return (
            <section
              key={status}
              aria-labelledby={`col-${status}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={onDrop(status)}
              className={cn(
                'card flex flex-col p-4 transition-all duration-300',
                isTargeted && 'scale-[1.01] shadow-lift ring-2 ring-accent',
              )}
            >
              <header className="mb-3.5 flex items-center justify-between px-1">
                <h2 id={`col-${status}`} className="flex items-center gap-2 text-sm font-medium tracking-tight text-ink">
                  <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} aria-hidden="true" />
                  <span className="truncate">{meta.label}</span>
                </h2>
                <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink">
                  {items.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-3">
                {items.map((app) => (
                  <ApplicationCard key={app.scholarshipId} app={app} />
                ))}

                {/* Clean, balanced drop zone target */}
                {items.length === 0 ? (
                  <div
                    className={cn(
                      'glass-subtle flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line/35 p-4 text-center text-xs text-ink-muted transition-colors duration-300',
                      isTargeted && 'border-accent bg-accent/10 text-ink',
                    )}
                  >
                    <span>Drop applications here</span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'flex min-h-[4rem] items-center justify-center rounded-xl border border-dashed border-transparent text-center text-xs text-ink-muted transition-colors duration-300',
                      isTargeted && 'border-accent bg-accent/10 text-ink',
                    )}
                  >
                    {isTargeted && <span>Drop to add</span>}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const ApplicationCard = memo(function ApplicationCard({ app }: { app: Application }) {
  const s = getScholarshipById(app.scholarshipId);
  const moveApplication = useApplicationStore((st) => st.moveApplication);
  const removeApplication = useApplicationStore((st) => st.removeApplication);
  if (!s) return null;
  const progress = applicationProgress(app);

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, s.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="glass-pill animate-fade-in-up cursor-grab rounded-2xl p-3.5 transition hover:-translate-y-0.5 active:cursor-grabbing"
      aria-label={s.title}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />
        <div className="min-w-0 flex-1">
          <Link to={`/scholarships/${s.id}`} className="line-clamp-2 text-sm font-medium text-ink hover:underline">
            {s.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{s.provider}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="font-display text-sm font-medium text-ink">{formatINRCompact(s.amount)}</span>
        {app.status !== 'awarded' && app.status !== 'rejected' && <CountdownBadge deadline={s.deadline} />}
      </div>

      <ProgressBar className="mt-2.5" value={progress} label={`${s.title} checklist progress`} />
      <p className="mt-1 text-[11px] text-ink-muted">
        {app.steps.filter((x) => x.done).length}/{app.steps.length} steps done
      </p>

      {/* Status control with custom arrow so text is never clipped */}
      <div className="mt-3 flex items-center gap-2 border-t border-line/20 pt-2.5">
        <div className="relative flex-1">
          <label htmlFor={`status-${s.id}`} className="sr-only">
            Status for {s.title}
          </label>
          <select
            id={`status-${s.id}`}
            value={app.status}
            onChange={(e) => {
              const status = e.target.value as ApplicationStatus;
              moveApplication(s.id, status);
              toast(`Moved to ${STATUS_META[status].label}`);
            }}
            className="input h-8 w-full appearance-none rounded-full py-0 pl-3 pr-7 text-xs font-medium text-ink"
          >
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_META[st].label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            removeApplication(s.id);
            toast('Application removed', 'info');
          }}
          aria-label={`Remove ${s.title} from tracker`}
          className="glass-subtle grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition hover:text-ink"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
});
