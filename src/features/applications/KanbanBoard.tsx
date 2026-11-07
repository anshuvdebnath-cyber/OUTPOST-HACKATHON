import { memo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical, Trash2 } from 'lucide-react';
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
 * Monochrome frosted-glass Kanban board of applications grouped by status.
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
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      <div className="grid min-w-max auto-cols-[17.5rem] grid-flow-col gap-4 xl:min-w-0 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-6">
        {APPLICATION_STATUSES.map((status) => {
          const items = applications.filter((a) => a.status === status);
          const meta = STATUS_META[status];
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
                'card flex min-h-[18rem] flex-col p-3.5 transition-all duration-300',
                dragOver === status && 'scale-[1.01] shadow-lift',
              )}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 id={`col-${status}`} className="flex items-center gap-2 text-sm font-medium tracking-tight text-ink">
                  <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" />
                  {meta.label}
                </h2>
                <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs font-medium text-ink">
                  {items.length}
                </span>
              </header>
              <ul className="flex flex-1 flex-col gap-3">
                {items.map((app) => (
                  <li key={app.scholarshipId}>
                    <ApplicationCard app={app} />
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="glass-subtle grid flex-1 place-items-center rounded-2xl p-4 text-center text-xs text-ink-muted">
                    Drop applications here
                  </li>
                )}
              </ul>
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
      className="glass-pill animate-fade-in-up cursor-grab rounded-2xl p-4 transition hover:-translate-y-0.5 active:cursor-grabbing"
      aria-label={s.title}
    >
      <div className="flex items-start gap-2">
        <GripVertical aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />
        <div className="min-w-0 flex-1">
          <Link to={`/scholarships/${s.id}`} className="line-clamp-2 text-sm font-medium text-ink hover:underline">
            {s.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{s.provider}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-display text-sm font-medium text-ink">{formatINRCompact(s.amount)}</span>
        {app.status !== 'awarded' && app.status !== 'rejected' && <CountdownBadge deadline={s.deadline} />}
      </div>
      <ProgressBar className="mt-3" value={progress} label={`${s.title} checklist progress`} />
      <p className="mt-1 text-[11px] text-ink-muted">
        {app.steps.filter((x) => x.done).length}/{app.steps.length} steps done
      </p>
      <div className="mt-3 flex items-center gap-2">
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
          className="input h-9 flex-1 rounded-full py-1 text-xs"
        >
          {APPLICATION_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_META[st].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            removeApplication(s.id);
            toast('Application removed', 'info');
          }}
          aria-label={`Remove ${s.title} from tracker`}
          className="glass-subtle grid h-9 w-9 place-items-center rounded-full text-ink-muted transition hover:text-ink"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
});
