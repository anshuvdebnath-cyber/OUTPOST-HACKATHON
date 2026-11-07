import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CalendarPlus, Compass } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { CountdownBadge } from '@/features/deadlines/CountdownBadge';
import { downloadIcs } from '@/features/deadlines/generateIcs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { STATUS_META } from '@/lib/constants';
import { formatINR } from '@/lib/currency';
import { daysUntil, formatDate, getUrgency, type Urgency } from '@/lib/date';
import { cn } from '@/lib/cn';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from '@/store/useToastStore';
import type { Scholarship } from '@/types/scholarship';

const URGENCY_SECTIONS: { key: Exclude<Urgency, 'closed'>; title: string; subtitle: string }[] = [
  { key: 'critical', title: 'Urgent — due in 3 days or less', subtitle: 'Submit these applications first' },
  { key: 'soon', title: 'Due within 10 days', subtitle: 'Finalise documents and essays this week' },
  { key: 'upcoming', title: 'Due within 30 days', subtitle: 'Good time to start preparing' },
  { key: 'later', title: 'More than 30 days away', subtitle: 'Plan ahead and gather recommendations' },
];

/** Chronological deadline radar with urgency buckets and one-click .ics calendar export. */
export default function DeadlinesPage() {
  useDocumentTitle('Scholarship deadlines');
  const applications = useApplicationStore((s) => s.applications);
  const [scope, setScope] = useState<'tracked' | 'all'>('all');

  const trackedIds = useMemo(() => new Set(Object.keys(applications)), [applications]);

  const list = useMemo(() => {
    const base = scope === 'tracked' ? SCHOLARSHIPS.filter((s) => trackedIds.has(s.id)) : SCHOLARSHIPS;
    return [...base]
      .filter((s) => daysUntil(s.deadline) >= 0)
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
  }, [scope, trackedIds]);

  const grouped = useMemo(() => {
    const map = new Map<Exclude<Urgency, 'closed'>, Scholarship[]>();
    for (const sec of URGENCY_SECTIONS) map.set(sec.key, []);
    for (const s of list) {
      const u = getUrgency(s.deadline);
      if (u !== 'closed') map.get(u)?.push(s);
    }
    return map;
  }, [list]);

  return (
    <>
      <PageHeader
        title="Deadline timeline"
        description="Never miss a submission window. Deadlines are grouped by urgency and can be exported to Google, Apple or Outlook Calendar."
        actions={
          <>
            <div className="inline-flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="Deadline scope">
              <button
                type="button"
                aria-pressed={scope === 'all'}
                onClick={() => setScope('all')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  scope === 'all' ? 'bg-brand-600 text-white' : 'text-ink-muted hover:text-ink',
                )}
              >
                All open ({SCHOLARSHIPS.length})
              </button>
              <button
                type="button"
                aria-pressed={scope === 'tracked'}
                onClick={() => setScope('tracked')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  scope === 'tracked' ? 'bg-brand-600 text-white' : 'text-ink-muted hover:text-ink',
                )}
              >
                My tracked ({trackedIds.size})
              </button>
            </div>
            {list.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  downloadIcs(list);
                  toast(`Exported ${list.length} scholarship deadlines (.ics)`);
                }}
              >
                <CalendarPlus aria-hidden="true" className="h-4 w-4" /> Export .ics
              </Button>
            )}
          </>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No tracked deadlines yet"
          description="Save scholarships from Discover or switch to 'All open' to view every upcoming deadline."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => setScope('all')}>
                Show all open deadlines
              </Button>
              <Link to="/discover" className={buttonClasses('primary')}>
                <Compass aria-hidden="true" className="h-4 w-4" /> Discover scholarships
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-8">
          {URGENCY_SECTIONS.map((sec) => {
            const items = grouped.get(sec.key) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={sec.key} aria-labelledby={`urgency-${sec.key}`}>
                <div className="mb-3">
                  <h2 id={`urgency-${sec.key}`} className="text-lg font-semibold text-ink">
                    {sec.title}
                  </h2>
                  <p className="text-xs text-ink-muted">{sec.subtitle}</p>
                </div>
                <ol className="space-y-3">
                  {items.map((s) => {
                    const app = applications[s.id];
                    return (
                      <li
                        key={s.id}
                        className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CountdownBadge deadline={s.deadline} />
                            <span className="text-xs font-medium text-ink-muted">{formatDate(s.deadline)}</span>
                            {app && <span className={cn('chip', STATUS_META[app.status].tone)}>{STATUS_META[app.status].label}</span>}
                          </div>
                          <Link
                            to={`/scholarships/${s.id}`}
                            className="mt-1.5 block text-base font-semibold text-ink hover:text-brand-600"
                          >
                            {s.title}
                          </Link>
                          <p className="text-xs text-ink-muted">
                            {s.provider} · {formatINR(s.amount)} ({s.frequency === 'annual' ? 'per year' : 'one-time'})
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              downloadIcs([s], `${s.id}-deadline.ics`);
                              toast('Calendar invite downloaded');
                            }}
                          >
                            <CalendarPlus aria-hidden="true" className="h-4 w-4" /> .ics
                          </Button>
                          <Link to={`/scholarships/${s.id}`} className={buttonClasses('primary', 'sm')}>
                            View details
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

