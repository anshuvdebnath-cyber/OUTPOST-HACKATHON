import { memo, useEffect, useRef, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Compass, FolderKanban, GripVertical, Trash2 } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
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

const STAGE_DESCRIPTIONS: Record<ApplicationStatus, string> = {
  saved: 'Scholarships bookmarked for review before starting your application.',
  preparing: 'Gathering documents, writing essays, and completing checklist items.',
  submitted: 'Applications formally submitted and awaiting review by the provider.',
  interview: 'Shortlisted for aptitude tests, interviews, or verification calls.',
  awarded: 'Congratulations! Scholarships you have officially won.',
  rejected: 'Past applications that were not selected this cycle.',
};

/**
 * Full-width, edge-aligned frosted-glass Kanban & stage workspace.
 *  - No horizontal scrollbar: uses a balanced 3-column bento grid in "All stages" mode
 *  - Full-width stage container when a specific stage tab is selected
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

  return (
    <div className="space-y-6">
      {/* Full-width aligned frosted glass stage tab bar */}
      <div
        className="glass-pill flex flex-wrap items-center justify-between gap-2 rounded-2xl p-2"
        role="tablist"
        aria-label="Kanban stage filter"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="stage-tab-all"
            type="button"
            role="tab"
            aria-selected={activeStage === 'all'}
            aria-controls="stage-panel-workspace"
            onClick={() => setActiveStage('all')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300',
              activeStage === 'all'
                ? 'bg-accent text-accent-ink shadow-sm'
                : 'text-ink/80 hover:bg-accent/10 hover:text-ink',
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
                id={`stage-tab-${status}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="stage-panel-workspace"
                onClick={() => setActiveStage(status)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-300',
                  isSelected
                    ? 'bg-accent text-accent-ink shadow-sm'
                    : 'text-ink/80 hover:bg-accent/10 hover:text-ink',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" />
                <span>{meta.label}</span>
                <span className="opacity-75 font-semibold">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="hidden pr-3 text-xs text-ink-muted xl:inline">
          Drag cards between stages or use the status menu
        </span>
      </div>

      {/* Stage Workspace: 3-column aligned Bento Grid for "All stages", or Full-Width Panel for a single stage */}
      <div
        id="stage-panel-workspace"
        role="tabpanel"
        aria-labelledby={activeStage === 'all' ? 'stage-tab-all' : `stage-tab-${activeStage}`}
      >
      {activeStage === 'all' ? (
        <div key="all-stages" className="animate-fade-in-up grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                  'card flex min-h-[16rem] flex-col p-5 transition-all duration-300',
                  isTargeted && 'scale-[1.01] shadow-lift ring-2 ring-accent',
                )}
              >
                <header className="mb-4 flex items-center justify-between border-b border-line/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} aria-hidden="true" />
                    <h2 id={`col-${status}`} className="text-[16px] font-medium tracking-tight text-ink">
                      {meta.label}
                    </h2>
                  </div>
                  <span className="glass-subtle rounded-full px-3 py-0.5 text-xs font-semibold text-ink">
                    {items.length}
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-3.5">
                  {items.map((app) => (
                    <ApplicationCard key={app.scholarshipId} app={app} />
                  ))}

                  {items.length === 0 && (
                    <div
                      className={cn(
                        'glass-subtle flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line/30 p-6 text-center transition-colors duration-300',
                        isTargeted && 'border-accent bg-accent/15 text-ink',
                      )}
                    >
                      <p className="text-xs font-medium text-ink/80">No applications in {meta.label}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">Drag a scholarship card here to move it</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Full-width aligned single-stage view */
        <SingleStagePanel
          key={activeStage}
          status={activeStage}
          items={applications.filter((a) => a.status === activeStage)}
          isTargeted={dragOver === activeStage}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(activeStage);
          }}
          onDragLeave={() => setDragOver((s) => (s === activeStage ? null : s))}
          onDrop={onDrop(activeStage)}
          onShowAll={() => setActiveStage('all')}
        />
      )}
      </div>
    </div>
  );
}

interface SingleStagePanelProps {
  status: ApplicationStatus;
  items: Application[];
  isTargeted: boolean;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onShowAll: () => void;
}

function SingleStagePanel({
  status,
  items,
  isTargeted,
  onDragOver,
  onDragLeave,
  onDrop,
  onShowAll,
}: SingleStagePanelProps) {
  const meta = STATUS_META[status];

  return (
    <section
      aria-labelledby={`single-col-${status}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'card animate-fade-in-up w-full p-6 transition-all duration-300 sm:p-8',
        isTargeted && 'ring-2 ring-accent',
      )}
    >
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-line/20 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={cn('h-3 w-3 rounded-full', meta.dot)} aria-hidden="true" />
            <h2 id={`single-col-${status}`} className="text-2xl font-normal tracking-[-0.02em] text-ink">
              {meta.label}
            </h2>
            <span className="glass-subtle rounded-full px-3 py-0.5 text-xs font-semibold text-ink">
              {items.length} {items.length === 1 ? 'application' : 'applications'}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">{STAGE_DESCRIPTIONS[status]}</p>
        </div>

        <button
          type="button"
          onClick={onShowAll}
          className="glass-subtle self-start rounded-full px-4 py-2 text-xs font-medium text-ink transition hover:scale-[1.02] sm:self-auto"
        >
          View all 6 stages
        </button>
      </header>

      {items.length === 0 ? (
        <div className="glass-subtle flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line/35 p-8 text-center">
          <div className="glass-pill mb-3 grid h-11 w-11 place-items-center rounded-2xl text-ink">
            <FolderKanban aria-hidden="true" className="h-5 w-5" />
          </div>
          <h3 className="text-[16px] font-medium text-ink">No applications in {meta.label} yet</h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
            Switch to &ldquo;All stages&rdquo; to drag an existing application into {meta.label}, or explore new scholarships to add to your tracker.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={onShowAll}
              className={buttonClasses('secondary', 'sm')}
            >
              Show all stages
            </button>
            <Link to="/discover" className={buttonClasses('primary', 'sm')}>
              <Compass aria-hidden="true" className="h-3.5 w-3.5" /> Discover scholarships
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((app) => (
            <ApplicationCard key={app.scholarshipId} app={app} />
          ))}
        </div>
      )}
    </section>
  );
}

const ApplicationCard = memo(function ApplicationCard({ app }: { app: Application }) {
  const s = getScholarshipById(app.scholarshipId);
  const moveApplication = useApplicationStore((st) => st.moveApplication);
  const removeApplication = useApplicationStore((st) => st.removeApplication);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (!s) return null;
  const progress = applicationProgress(app);

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, s.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'glass-pill animate-fade-in-up relative flex cursor-grab flex-col justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 active:cursor-grabbing',
        menuOpen && 'z-30',
      )}
      aria-label={s.title}
    >
      <div>
        <div className="flex items-start gap-2">
          <GripVertical aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />
          <div className="min-w-0 flex-1">
            <Link
              to={`/scholarships/${s.id}`}
              className="line-clamp-2 text-[15px] font-medium leading-snug text-ink hover:underline"
            >
              {s.title}
            </Link>
            <p className="mt-1 truncate text-xs text-ink/75">{s.provider}</p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2">
          <span className="font-display text-[16px] font-semibold text-ink">{formatINRCompact(s.amount)}</span>
          {app.status !== 'awarded' && app.status !== 'rejected' && <CountdownBadge deadline={s.deadline} />}
        </div>

        <ProgressBar className="mt-3.5" value={progress} label={`${s.title} checklist progress`} />
        <p className="mt-1.5 text-xs text-ink/75">
          {app.steps.filter((x) => x.done).length}/{app.steps.length} steps completed
        </p>
      </div>

      {/* Custom Frosted Glass Status Dropdown + Remove Button */}
      <div className="mt-4 flex items-center gap-2 border-t border-line/20 pt-3">
        <div ref={menuRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label={`Status for ${s.title}: ${STATUS_META[app.status].label}`}
            className="glass-subtle flex h-9 w-full items-center justify-between rounded-full px-3.5 text-xs font-medium text-ink transition hover:bg-surface/40"
          >
            <span className="flex items-center gap-2 truncate">
              <span className={cn('h-2 w-2 rounded-full', STATUS_META[app.status].dot)} aria-hidden="true" />
              <span className="truncate">{STATUS_META[app.status].label}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn('h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-200', menuOpen && 'rotate-180')}
            />
          </button>

          {menuOpen && (
            <ul
              role="listbox"
              aria-label={`Change status for ${s.title}`}
              className="glass-popover animate-fade-in-up absolute bottom-full left-0 z-50 mb-1.5 w-full min-w-[11rem] space-y-1 rounded-2xl p-1.5"
            >
              {APPLICATION_STATUSES.map((st) => {
                const selected = st === app.status;
                return (
                  <li key={st} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        moveApplication(s.id, st);
                        toast(`Moved to ${STATUS_META[st].label}`);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors duration-150',
                        selected
                          ? 'bg-accent text-accent-ink shadow-sm'
                          : 'text-ink/80 hover:bg-accent/15 hover:text-ink',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', STATUS_META[st].dot)} aria-hidden="true" />
                        <span>{STATUS_META[st].label}</span>
                      </span>
                      {selected && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            removeApplication(s.id);
            toast('Application removed', 'info');
          }}
          aria-label={`Remove ${s.title} from tracker`}
          className="glass-subtle grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/75 transition hover:bg-red-500/15 hover:text-ink"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
});
