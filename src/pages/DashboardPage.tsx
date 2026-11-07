import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarClock,
  Compass,
  IndianRupee,
  KanbanSquare,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getScholarshipById, SCHOLARSHIPS } from '@/data/scholarships';
import { CountdownBadge } from '@/features/deadlines/CountdownBadge';
import { ScholarshipCard } from '@/features/scholarships/ScholarshipCard';
import { DEFAULT_FILTERS, filterScholarships } from '@/features/scholarships/filterScholarships';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { STATUS_META } from '@/lib/constants';
import { formatINR, formatINRCompact } from '@/lib/currency';
import { daysUntil, formatDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { useApplicationStore } from '@/store/useApplicationStore';
import { profileCompleteness, useProfileStore } from '@/store/useProfileStore';

/** Student command centre: funding potential, top matches, upcoming deadlines and tracker summary. */
export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const profile = useProfileStore((s) => s.profile);
  const applicationsMap = useApplicationStore((s) => s.applications);
  const applications = useMemo(() => Object.values(applicationsMap), [applicationsMap]);
  const completeness = profileCompleteness(profile);

  const ranked = useMemo(() => filterScholarships(SCHOLARSHIPS, DEFAULT_FILTERS, profile), [profile]);
  const eligibleMatches = useMemo(() => ranked.filter((r) => r.match.verdict !== 'ineligible'), [ranked]);
  const topMatches = useMemo(() => ranked.slice(0, 3), [ranked]);

  const fundingStats = useMemo(() => {
    let trackedTotal = 0;
    let awardedTotal = 0;
    for (const app of applications) {
      const s = getScholarshipById(app.scholarshipId);
      if (!s) continue;
      if (app.status !== 'rejected') trackedTotal += s.amount;
      if (app.status === 'awarded') awardedTotal += s.amount;
    }
    const eligiblePool = eligibleMatches.reduce((sum, r) => sum + r.scholarship.amount, 0);
    return { trackedTotal, awardedTotal, eligiblePool };
  }, [applications, eligibleMatches]);

  const urgentDeadlines = useMemo(
    () =>
      [...SCHOLARSHIPS]
        .filter((s) => {
          const d = daysUntil(s.deadline);
          return d >= 0 && d <= 14;
        })
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 5),
    [],
  );

  const greeting = profile.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Your scholarship command centre';

  return (
    <>
      <PageHeader
        title={greeting}
        description="Track your funding potential, jump into your highest-scoring matches and stay ahead of every deadline."
        actions={
          <>
            <Link to="/profile" className={buttonClasses('secondary')}>
              <UserRound aria-hidden="true" className="h-4 w-4" /> Profile ({completeness}%)
            </Link>
            <Link to="/discover" className={buttonClasses('primary')}>
              <Compass aria-hidden="true" className="h-4 w-4" /> Explore scholarships
            </Link>
          </>
        }
      />

      {/* KPI strip */}
      <section aria-label="Scholarship summary statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Eligible scholarship pool"
          value={formatINRCompact(fundingStats.eligiblePool)}
          hint={`${eligibleMatches.length} scholarships fit your profile`}
          icon={<Sparkles aria-hidden="true" className="h-5 w-5 text-brand-600 dark:text-brand-300" />}
        />
        <KpiCard
          label="Tracked funding potential"
          value={formatINR(fundingStats.trackedTotal)}
          hint={`${applications.length} applications in tracker`}
          icon={<IndianRupee aria-hidden="true" className="h-5 w-5 text-violet-600 dark:text-violet-300" />}
        />
        <KpiCard
          label="Scholarships won"
          value={formatINR(fundingStats.awardedTotal)}
          hint={`${applications.filter((a) => a.status === 'awarded').length} awarded`}
          icon={<Award aria-hidden="true" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <KpiCard
          label="Closing in 14 days"
          value={`${urgentDeadlines.length} deadlines`}
          hint="Prioritise these this week"
          icon={<CalendarClock aria-hidden="true" className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        />
      </section>

      {completeness < 100 && (
        <section
          aria-labelledby="onboard-banner"
          className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 p-5 text-white sm:flex-row sm:items-center sm:p-6"
        >
          <div>
            <h2 id="onboard-banner" className="text-lg font-bold">
              Unlock exact eligibility scores ({completeness}% complete)
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              Add your marks, family income and category so Grantly can flag every scholarship you qualify for — and explain why.
            </p>
          </div>
          <Link to="/profile" className={buttonClasses('secondary', 'md', 'bg-white text-brand-700 hover:bg-white/90')}>
            Complete profile <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Top matches */}
      <section aria-labelledby="top-matches-heading" className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="top-matches-heading" className="text-xl font-bold text-ink">
              Top matches for you
            </h2>
            <p className="text-sm text-ink-muted">Ranked by your explainable eligibility score and deadline urgency</p>
          </div>
          <Link to="/discover" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
            See all {SCHOLARSHIPS.length} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topMatches.map(({ scholarship, match }) => (
            <li key={scholarship.id}>
              <ScholarshipCard scholarship={scholarship} match={match} />
            </li>
          ))}
        </ul>
      </section>

      {/* Bottom 2-column: Upcoming deadlines + Application pipeline */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="closing-soon-heading" className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="closing-soon-heading" className="text-lg font-semibold text-ink">
              Closing in the next 2 weeks
            </h2>
            <Link to="/deadlines" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Full timeline →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {urgentDeadlines.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link to={`/scholarships/${s.id}`} className="truncate text-sm font-semibold text-ink hover:text-brand-600">
                    {s.title}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {formatINR(s.amount)} · Due {formatDate(s.deadline)}
                  </p>
                </div>
                <CountdownBadge deadline={s.deadline} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pipeline-heading" className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="pipeline-heading" className="flex items-center gap-2 text-lg font-semibold text-ink">
              <KanbanSquare aria-hidden="true" className="h-5 w-5 text-brand-600 dark:text-brand-300" />
              Your application pipeline
            </h2>
            <Link to="/tracker" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Open board →
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="rounded-xl bg-surface-muted/60 p-6 text-center">
              <p className="text-sm text-ink-muted">
                You haven’t saved any scholarships yet. Save opportunities from Discover to track your progress here.
              </p>
              <Link to="/discover" className={buttonClasses('primary', 'sm', 'mt-4')}>
                Find scholarships
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(['saved', 'preparing', 'submitted', 'interview', 'awarded'] as const).map((st) => {
                const count = applications.filter((a) => a.status === st).length;
                const pct = Math.round((count / applications.length) * 100);
                return (
                  <div key={st}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={cn('chip', STATUS_META[st].tone)}>{STATUS_META[st].label}</span>
                      <span className="font-semibold text-ink">{count}</span>
                    </div>
                    <ProgressBar value={pct} label={`${STATUS_META[st].label} applications`} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function KpiCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span className="rounded-xl bg-surface-muted p-2">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

