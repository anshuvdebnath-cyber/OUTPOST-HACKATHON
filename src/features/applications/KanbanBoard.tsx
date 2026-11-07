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
 * Spacious, uncongested frosted-glass Kanban board.
 * Each column has a generous 21.5rem width with smooth horizontal scrolling and stage pill filters.
 */
export function KanbanBoard({ applications }: { applications: Application[] }) {
  const moveApplication = useApplicationStore((s) => s.moveApplication);
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);
  const [activeStage, setActiveStage] = useState<ApplicationStatus | 'all'>('all');

  const onDrop = (status: ApplicationStatus) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    if (id) {
      moveApplication(id, status);
      toast(`Moved to ${STATUS_META[status].label}`);
    }
  };

  const visibleStatuses = activeStage === 'all' ? APPLICATION_STATUSES : [activeStage];

  return (
    <div className="space-y-6">
      {/* Stage filter pills for quick uncongested focus */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Kanban stage filter">
        <button
          type="button"
          role="tab"
          aria-selected={activeStage === 'all'}
          onClick={() => setActiveStage('all')}
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
            activeStage === 'all'
              ? 'bg-accent text-accent-ink shadow-sm'
              : 'glass-subtle text-ink/75 hover:text-ink',
          )}
        >
          All stages ({applications.length})
        </button>
        {APPLICATION_STATUSES.map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const meta = STATUS_META[status];
          const isSelected = activeStage === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveStage(status)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                isSelected
                  ? 'bg-accent text-accent-ink shadow-sm'
                  : 'glass-subtle text-ink/75 hover:text-ink',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" />
              <span>{meta.label}</span>
              <span className="opacity-75 font-semibold">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Spacious Kanban columns container */}
      <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
        <div className="flex gap-5 snap-x">
          {visibleStatuses.map((status) => {
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
                  'card flex w-[21.5rem] min-w-[21.5rem] shrink-0 snap-start flex-col p-4.5 transition-all duration-300',
                  isTargeted && 'scale-[1.01] shadow-lift ring-2 ring-accent',
                )}
              >
                <header className="mb-4 flex items-center justify-between px-1">
                  <h2 id={`col-${status}`} className="flex items-center gap-2 text-sm font-medium tracking-tight text-ink">
                    <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} aria-hidden="true" />
                    <span>{meta.label}</span>
                  </h2>
                  <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink">
                    {items.length}
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-3.5">
                  {items.map((app) => (
                    <ApplicationCard key={app.scholarshipId} app={app} />
                  ))}

                  {/* Clean, compact drop zone target */}
                  {items.length === 0 ? (
                    <div
                      className={cn(
                        'glass-subtle flex min-h-[7rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line/30 p-4 text-center text-xs text-ink-muted transition-colors duration-300',
                        isTargeted && 'border-accent bg-accent/15 text-ink',
                      )}
                    >
                      <span>Drop applications here to move</span>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex min-h-[3rem] items-center justify-center rounded-xl border border-dashed border-transparent text-center text-xs text-ink-muted transition-colors duration-300',
                        isTargeted && 'border-accent bg-accent/15 text-ink',
                      )}
                    >
                      {isTargeted && <span>Drop here</span>}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
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
          <Link to={`/scholarships/${s.id}`} className="line-clamp-2 text-[15px] font-medium leading-snug text-ink hover:underline">
            {s.title}
          </Link>
          <p className="mt-1 truncate text-xs text-ink/75">{s.provider}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold text-ink">{formatINRCompact(s.amount)}</span>
        {app.status !== 'awarded' && app.status !== 'rejected' && <CountdownBadge deadline={s.deadline} />}
      </div>

      <ProgressBar className="mt-3" value={progress} label={`${s.title} checklist progress`} />
      <p className="mt-1 text-xs text-ink/75">
        {app.steps.filter((x) => x.done).length}/{app.steps.length} steps done
      </p>

      {/* Status control with plenty of breathing room */}
      <div className="mt-3.5 flex items-center gap-2 border-t border-line/20 pt-3">
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
            className="input h-9 w-full appearance-none rounded-full py-0 pl-3.5 pr-8 text-xs font-medium text-ink"
          >
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_META[st].label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            removeApplication(s.id);
            toast('Application removed', 'info');
          }}
          aria-label={`Remove ${s.title} from tracker`}
          className="glass-subtle grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/70 transition hover:bg-red-500/15 hover:text-ink"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
});
