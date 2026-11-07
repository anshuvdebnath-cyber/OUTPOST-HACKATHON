import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Building2,
  CalendarPlus,
  CheckCircle2,
  Circle,
  ExternalLink,
  GitCompareArrows,
  Gift,
  ListChecks,
  ShieldCheck,
  SearchX,
  Users,
} from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getScholarshipById } from '@/data/scholarships';
import { CountdownBadge } from '@/features/deadlines/CountdownBadge';
import { downloadIcs } from '@/features/deadlines/generateIcs';
import { DocumentReadinessMeter } from '@/features/documents/DocumentReadinessMeter';
import { MatchBadge } from '@/features/eligibility/MatchBadge';
import { MatchReasons } from '@/features/eligibility/MatchReasons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMatch } from '@/hooks/useMatch';
import {
  CATEGORY_LABELS,
  EDUCATION_LEVEL_LABELS,
  FIELD_LABELS,
  SCHOLARSHIP_TYPE_LABELS,
  STATUS_META,
} from '@/lib/constants';
import { formatINR } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { applicationProgress, useApplicationStore } from '@/store/useApplicationStore';
import { MAX_COMPARE, useCompareStore } from '@/store/useCompareStore';
import { toast } from '@/store/useToastStore';
import type { Scholarship } from '@/types/scholarship';

/** Monochrome frosted-glass scholarship detail workspace. */
export default function ScholarshipDetailPage() {
  const { id = '' } = useParams();
  const scholarship = getScholarshipById(id);
  const match = useMatch(scholarship);
  useDocumentTitle(scholarship?.title ?? 'Scholarship not found');

  if (!scholarship || !match) {
    return (
      <EmptyState
        icon={SearchX}
        title="Scholarship not found"
        description="This scholarship may have been removed or the link is incorrect."
        action={
          <Link to="/discover" className={buttonClasses('primary')}>
            Browse scholarships
          </Link>
        }
      />
    );
  }

  return (
    <article className="animate-fade-in-up">
      <Link
        to="/discover"
        className="glass-pill mb-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-ink transition hover:scale-105"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to discover
      </Link>

      <Hero scholarship={scholarship} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-6">
          <section aria-labelledby="about-heading" className="card p-6 sm:p-7">
            <h2 id="about-heading" className="text-xl font-normal tracking-[-0.02em] text-ink">
              About this scholarship
            </h2>
            <p className="mt-2.5 leading-relaxed text-ink-muted">{scholarship.description}</p>
            <h3 className="mt-6 flex items-center gap-2 text-[16px] font-normal text-ink">
              <Gift aria-hidden="true" className="h-4 w-4 text-ink" /> What you get
            </h3>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {scholarship.benefits.map((b) => (
                <li key={b} className="glass-subtle flex items-start gap-2.5 rounded-2xl p-3.5 text-sm text-ink">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <EligibilityRules scholarship={scholarship} />
          <ApplicationSteps scholarship={scholarship} />
        </div>

        <aside className="space-y-6" aria-label="Your eligibility and readiness">
          <section aria-labelledby="match-heading" className="card p-6">
            <h2 id="match-heading" className="mb-4 flex items-center gap-2 text-lg font-normal tracking-[-0.02em] text-ink">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-ink" /> Your match
            </h2>
            <MatchBadge match={match} size="lg" />
            <div className="mt-5 pt-2">
              <MatchReasons checks={match.checks} />
            </div>
            {match.verdict === 'likely' && (
              <Link to="/profile" className={buttonClasses('secondary', 'sm', 'mt-5 w-full')}>
                Complete profile for an exact match
              </Link>
            )}
          </section>
          <DocumentReadinessMeter scholarship={scholarship} />
        </aside>
      </div>
    </article>
  );
}

function Hero({ scholarship: s }: { scholarship: Scholarship }) {
  const isSaved = useApplicationStore((st) => Boolean(st.applications[s.id]));
  const saveScholarship = useApplicationStore((st) => st.saveScholarship);
  const isComparing = useCompareStore((st) => st.ids.includes(s.id));
  const compareFull = useCompareStore((st) => st.ids.length >= MAX_COMPARE);
  const toggleCompare = useCompareStore((st) => st.toggle);

  return (
    <header className="card overflow-hidden p-6 sm:p-9">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip text-ink">{SCHOLARSHIP_TYPE_LABELS[s.type]}</span>
        <span className="chip capitalize text-ink-muted">{s.providerType}</span>
        <CountdownBadge deadline={s.deadline} />
      </div>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">{s.title}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
        <Building2 aria-hidden="true" className="h-4 w-4" /> {s.provider}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Award" value={formatINR(s.amount)} hint={s.frequency === 'annual' ? 'per year' : 'one-time'} />
        <Stat label="Deadline" value={formatDate(s.deadline)} />
        <Stat
          label="Awards available"
          value={s.seats.toLocaleString('en-IN')}
          icon={<Users aria-hidden="true" className="h-4 w-4" />}
        />
        <Stat label="Documents" value={`${s.requiredDocuments.length} required`} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Button
          onClick={() => {
            saveScholarship(s);
            toast(isSaved ? 'Already in your tracker' : 'Application started — find it in your tracker');
          }}
          variant={isSaved ? 'secondary' : 'primary'}
        >
          {isSaved ? <BookmarkCheck aria-hidden="true" className="h-4 w-4" /> : <BookmarkPlus aria-hidden="true" className="h-4 w-4" />}
          {isSaved ? 'In your tracker' : 'Start application'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            downloadIcs([s], `${s.id}-deadline.ics`);
            toast('Deadline added — open the downloaded file to import into your calendar');
          }}
        >
          <CalendarPlus aria-hidden="true" className="h-4 w-4" /> Add to calendar
        </Button>
        <Button
          variant="secondary"
          aria-pressed={isComparing}
          onClick={() => {
            if (!isComparing && compareFull) return toast(`You can compare up to ${MAX_COMPARE} scholarships`, 'error');
            toggleCompare(s.id);
          }}
        >
          <GitCompareArrows aria-hidden="true" className="h-4 w-4" /> {isComparing ? 'Comparing' : 'Compare'}
        </Button>
        <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary')}>
          Official website <ExternalLink aria-hidden="true" className="h-4 w-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </header>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="glass-subtle rounded-2xl p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-medium text-ink">
        {icon}
        {value}
      </p>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function EligibilityRules({ scholarship: { eligibility: e } }: { scholarship: Scholarship }) {
  const rows: [string, string][] = [
    ['Education level', e.levels.map((l) => EDUCATION_LEVEL_LABELS[l]).join(', ')],
    ['Minimum marks', e.minPercentage ? `${e.minPercentage}%` : 'No minimum'],
    ['Family income', e.maxFamilyIncome ? `Up to ${formatINR(e.maxFamilyIncome)} per year` : 'No limit'],
    ['Field of study', e.fields?.length ? e.fields.map((f) => FIELD_LABELS[f]).join(', ') : 'All fields'],
    ['Location', e.states?.length ? e.states.join(', ') : 'All India'],
    ['Gender', e.genders?.length ? e.genders.join(', ') : 'All genders'],
    ['Category', e.categories?.length ? e.categories.map((c) => CATEGORY_LABELS[c]).join(', ') : 'All categories'],
  ];
  return (
    <section aria-labelledby="elig-heading" className="card p-6 sm:p-7">
      <h2 id="elig-heading" className="text-xl font-normal tracking-[-0.02em] text-ink">
        Eligibility criteria
      </h2>
      <dl className="mt-4 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="glass-subtle grid grid-cols-1 gap-1 rounded-2xl px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs text-ink-muted">{k}</dt>
            <dd className="text-sm font-medium capitalize text-ink sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ApplicationSteps({ scholarship: s }: { scholarship: Scholarship }) {
  const app = useApplicationStore((st) => st.applications[s.id]);
  const toggleStep = useApplicationStore((st) => st.toggleStep);

  return (
    <section aria-labelledby="steps-heading" className="card p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="steps-heading" className="flex items-center gap-2 text-xl font-normal tracking-[-0.02em] text-ink">
          <ListChecks aria-hidden="true" className="h-5 w-5 text-ink" /> How to apply
        </h2>
        {app && <span className={cn('chip', STATUS_META[app.status].tone)}>{STATUS_META[app.status].label}</span>}
      </div>
      {app ? (
        <ProgressBar className="mt-4" value={applicationProgress(app)} label="Application progress" showValue />
      ) : (
        <p className="mt-2 text-xs text-ink-muted">Start the application to turn these steps into an interactive checklist.</p>
      )}
      <ol className="mt-4 space-y-2">
        {s.applicationSteps.map((label, i) => {
          const step = app?.steps[i];
          const content = (
            <>
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
                  step?.done ? 'bg-accent text-accent-ink' : 'glass-subtle text-ink',
                )}
                aria-hidden="true"
              >
                {step?.done ? '✓' : i + 1}
              </span>
              <span className={cn('text-sm', step?.done ? 'text-ink-muted line-through' : 'text-ink')}>{label}</span>
            </>
          );
          return (
            <li key={label}>
              {step ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={step.done}
                  onClick={() => toggleStep(s.id, step.id)}
                  className="glass-subtle flex w-full items-center gap-3 rounded-2xl p-3 text-left transition duration-300 hover:scale-[1.01]"
                >
                  {content}
                  {step.done ? (
                    <CheckCircle2 aria-hidden="true" className="ml-auto h-4 w-4 text-ink" />
                  ) : (
                    <Circle aria-hidden="true" className="ml-auto h-4 w-4 text-ink-muted" />
                  )}
                </button>
              ) : (
                <div className="glass-subtle flex items-center gap-3 rounded-2xl p-3">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
