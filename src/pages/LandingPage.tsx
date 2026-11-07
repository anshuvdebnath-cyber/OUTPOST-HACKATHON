import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Compass,
  FileCheck2,
  GitCompareArrows,
  KanbanSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { SkipLink } from '@/components/layout/SkipLink';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { buttonClasses } from '@/components/ui/Button';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINRCompact } from '@/lib/currency';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Explainable Match Score (0–100)',
    description:
      'Stop reading 20-page PDFs to find out you do not qualify. Grantly checks your marks, income, field, state and category and explains every single criterion.',
  },
  {
    icon: FileCheck2,
    title: 'Document Readiness Vault',
    description:
      'Tick the documents you already have once. Every scholarship immediately shows whether you are 100% ready to apply or what is still missing.',
  },
  {
    icon: KanbanSquare,
    title: 'Kanban Application Tracker',
    description:
      'Move scholarships from Saved → Preparing → Submitted → Interview → Awarded with step-by-step checklists that persist in your browser.',
  },
  {
    icon: CalendarClock,
    title: 'Urgency Radar & .ics Calendar Export',
    description:
      'Colour-coded countdowns highlight applications closing in 3, 10 or 30 days, with one-click export to Google, Apple or Outlook Calendar.',
  },
  {
    icon: GitCompareArrows,
    title: 'Side-by-Side Scholarship Comparison',
    description:
      'Compare up to 3 scholarships across award value, renewal frequency, eligibility rules and required documents.',
  },
  {
    icon: Compass,
    title: 'Faceted Search & Instant Filtering',
    description:
      'Filter by education level, field of study, scholarship type, minimum award and deadline window — or toggle “Only show scholarships I qualify for”.',
  },
];

/** Marketing & onboarding landing page for Grantly. */
export default function LandingPage() {
  useDocumentTitle('Rethinking the Scholarship Experience');
  const totalPool = SCHOLARSHIPS.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="min-h-dvh flex flex-col">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo to="/" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/discover" className={buttonClasses('ghost', 'sm')}>
              Browse scholarships
            </Link>
            <ThemeToggle />
            <Link to="/dashboard" className={buttonClasses('primary', 'sm')}>
              Open app <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Unified Scholarship Discovery &amp; Management
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Find scholarships you <span className="gradient-text">actually qualify for</span> — and never miss a deadline.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
                Grantly turns a confusing maze of portals, PDFs and spreadsheets into one calm workspace: discover opportunities,
                see why you match, check document readiness and track every application from saved to awarded.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/discover" className={buttonClasses('primary', 'lg')}>
                  Discover scholarships <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link to="/profile" className={buttonClasses('secondary', 'lg')}>
                  Build your profile (60 sec)
                </Link>
              </div>
            </div>

            {/* Live stats strip */}
            <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Open scholarships" value={String(SCHOLARSHIPS.length)} />
              <Stat label="Total award pool" value={formatINRCompact(totalPool)} />
              <Stat label="Eligibility criteria explained" value="7 checks" />
              <Stat label="Account required" value="None — 100% private" />
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="journey-heading" className="border-y border-line bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="journey-heading" className="text-2xl font-bold text-ink sm:text-3xl">
                Every stage of the scholarship journey, in one place
              </h2>
              <p className="mt-2 text-sm text-ink-muted sm:text-base">
                Designed around the four biggest barriers students face when seeking financial aid.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <article key={title} className="card p-6">
                  <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-heading" className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-8 text-center text-white sm:p-12">
              <h2 id="cta-heading" className="text-2xl font-bold sm:text-3xl">
                Ready to see your personalised scholarship matches?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                Try one of our built-in student personas with a single click, or enter your own details. Everything stays in your browser.
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/90 sm:text-sm">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Instant match scores
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Step-by-step checklists
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Calendar export (.ics)
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/dashboard" className={buttonClasses('secondary', 'lg', 'bg-white text-brand-700 hover:bg-white/90')}>
                  Launch Grantly <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface py-8 text-center text-xs text-ink-muted">
        <div className="mx-auto max-w-7xl px-4">
          <p>Grantly — Unified Scholarship Discovery &amp; Management Platform. All scholarship entries are sample data for demonstration.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">{value}</dd>
    </div>
  );
}

