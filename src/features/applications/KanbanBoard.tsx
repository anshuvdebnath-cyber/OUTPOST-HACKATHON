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
 * Kanban board of applications grouped by status.
 * - Mouse/trackpad: drag cards between columns (HTML5 drag & drop).
 * - Keyboard/touch/screen readers: change status with the select on each card.
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
      <div className="grid min-w-max auto-cols-[17rem] grid-flow-col gap-4 xl:min-w-0 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-6">
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
                'flex min-h-[16rem] flex-col rounded-2xl border border-dashed p-3 transition',
                dragOver === status ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-900/20' : 'border-transparent bg-surface-muted/60',
              )}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 id={`col-${status}`} className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} aria-hidden="true" />
                  {meta.label}
                </h2>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted">{items.length}</span>
              </header>
              <ul className="flex flex-1 flex-col gap-3">
                {items.map((app) => (
                  <li key={app.scholarshipId}>
                    <ApplicationCard app={app} />
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="grid flex-1 place-items-center rounded-xl p-4 text-center text-xs text-ink-muted">
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
      className="card cursor-grab p-3.5 active:cursor-grabbing"
      aria-label={s.title}
    >
      <div className="flex items-start gap-2">
        <GripVertical aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />
        <div className="min-w-0 flex-1">
          <Link to={`/scholarships/${s.id}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-600">
            {s.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{s.provider}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-ink">{formatINRCompact(s.amount)}</span>
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
          className="input h-9 flex-1 py-1 text-xs"
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
          className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
});

