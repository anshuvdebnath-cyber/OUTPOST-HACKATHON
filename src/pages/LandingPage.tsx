import { Link, NavLink } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Compass,
  FileCheck2,
  GitCompareArrows,
  KanbanSquare,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { NAV_ITEMS } from '@/components/layout/navItems';
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
      'Countdowns highlight applications closing in 3, 10 or 30 days, with one-click export to Google, Apple or Outlook Calendar.',
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

/** Editorial glassmorphism landing page set over the dual-mode fluted WebGL wave shader. */
export default function LandingPage() {
  useDocumentTitle('Rethinking the Scholarship Experience');
  const totalPool = SCHOLARSHIPS.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Floating glassmorphism pill navbar with new Fluted-Prism Logo */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4 sm:top-6 sm:px-6">
        <div className="glass-pill flex items-center justify-between gap-4 rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5">
          <Logo to="/" />
          <nav aria-label="Landing navigation" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-300 hover:bg-accent/15 hover:text-ink"
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/dashboard" className={buttonClasses('primary', 'sm')}>
              Open workspace <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="animate-fade-in-up flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="card mx-auto max-w-5xl px-6 py-14 text-center sm:px-14 sm:py-20">
            <span className="chip text-ink">Unified Scholarship Discovery &amp; Management</span>
            <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-light tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.25rem]">
              Everything intelligent adapts.
              <br />
              So should scholarship discovery.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Bridging scattered financial-aid portals, explainable eligibility matching, and high-confidence application workflows in one calm workspace.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/discover" className={buttonClasses('primary', 'lg')}>
                Discover scholarships <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link to="/profile" className={buttonClasses('secondary', 'lg')}>
                Build your profile (60 sec)
              </Link>
            </div>
          </div>

          {/* Live stats strip */}
          <dl className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Open scholarships" value={String(SCHOLARSHIPS.length)} />
            <Stat label="Total award pool" value={formatINRCompact(totalPool)} />
            <Stat label="Eligibility criteria explained" value="7 checks" />
            <Stat label="Account required" value="None · 100% private" />
          </dl>
        </section>

        {/* Capabilities */}
        <section aria-labelledby="journey-heading" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="card mb-8 p-8 text-center sm:p-10">
            <h2 id="journey-heading" className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">
              Every stage of the scholarship journey, in one place.
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm text-ink-muted sm:text-base">
              Designed around the four biggest barriers students face when seeking educational financial assistance.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article key={title} className="card animate-fade-in-up p-7 hover:-translate-y-1 hover:shadow-lift">
                <div className="glass-pill inline-flex rounded-2xl p-3 text-ink">
                  <Icon aria-hidden="true" className="h-5 w-5 stroke-[1.5]" />
                </div>
                <h3 className="mt-5 text-lg font-normal tracking-[-0.02em] text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="card p-8 text-center sm:p-14">
            <h2 id="cta-heading" className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">
              Ready to see your personalised scholarship matches?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
              Try one of our built-in student personas with a single click, or enter your own details. Everything stays in your browser.
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-ink">
              <li className="chip">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Instant match scores
              </li>
              <li className="chip">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Step-by-step checklists
              </li>
              <li className="chip">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Calendar export (.ics)
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/dashboard" className={buttonClasses('primary', 'lg')}>
                Launch Grantly <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mb-6 w-full max-w-6xl px-4 sm:px-6">
        <div className="glass-pill rounded-full px-6 py-4 text-center text-xs text-ink-muted">
          Grantly — Unified Scholarship Discovery &amp; Management Platform. All scholarship entries are sample data for demonstration.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card animate-fade-in-up p-5 text-center hover:-translate-y-0.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1.5 font-display text-2xl font-normal tracking-[-0.03em] text-ink sm:text-3xl">{value}</dd>
    </div>
  );
}
