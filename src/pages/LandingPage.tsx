import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Compass,
  Download,
  FileCheck2,
  GitCompareArrows,
  IndianRupee,
  KanbanSquare,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { NAV_ITEMS } from '../components/layout/navItems';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Button, buttonClasses } from '../components/ui/Button';
import { SCHOLARSHIPS } from '../data/scholarships';
import { downloadIcs } from '../features/deadlines/generateIcs';
import { ScholarshipCard } from '../features/scholarships/ScholarshipCard';
import { filterScholarships } from '../features/scholarships/filterScholarships';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  CATEGORY_LABELS,
  EDUCATION_LEVEL_LABELS,
  FIELD_LABELS,
  SCHOLARSHIP_TYPE_LABELS,
  STATUS_META,
} from '../lib/constants';
import { formatINR, formatINRCompact } from '../lib/currency';
import { daysUntil } from '../lib/date';
import { computePortfolioAnalytics, downloadApplicationsCsv } from '../services/scholarshipService';
import { useApplicationStore } from '../store/useApplicationStore';
import { useCompareStore } from '../store/useCompareStore';
import { useFilterStore } from '../store/useFilterStore';
import { profileCompleteness, useProfileStore } from '../store/useProfileStore';
import { toast } from '../store/useToastStore';
import type {
  ApplicationStatus,
  EducationLevel,
  FieldOfStudy,
  ScholarshipType,
  SocialCategory,
  SortOption,
} from '../types/scholarship';
import { sanitizeNumericInput, sanitizeSearchQuery, sanitizeTextInput } from '../utils/security';

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

/**
 * Unified Scholarship Discovery & Management Landing + Live Interactive Workspace.
 * Renders the hero overview, live interactive scholarship search/filter studio,
 * real-time eligibility matcher form, and application tracker controls directly on `/`.
 */
export default function LandingPage() {
  useDocumentTitle('Grantly — Unified Scholarship Discovery & Management Platform');

  const { profile, updateProfile, completeOnboarding } = useProfileStore();
  const { filters, setFilter, resetFilters } = useFilterStore();
  const applicationsMap = useApplicationStore((s) => s.applications);
  const moveApplication = useApplicationStore((s) => s.moveApplication);
  const compareIds = useCompareStore((s) => s.ids);

  const [searchInput, setSearchInput] = useState(filters.query);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | 'all'>(
    filters.levels[0] ?? 'all',
  );
  const [selectedType, setSelectedType] = useState<ScholarshipType | 'all'>(
    filters.types[0] ?? 'all',
  );
  const [showCount, setShowCount] = useState(6);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 150);

  const applications = useMemo(() => Object.values(applicationsMap), [applicationsMap]);
  const completeness = useMemo(() => profileCompleteness(profile), [profile]);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      query: sanitizeSearchQuery(debouncedSearch),
      levels: selectedLevel === 'all' ? filters.levels : [selectedLevel],
      types: selectedType === 'all' ? filters.types : [selectedType],
    }),
    [filters, debouncedSearch, selectedLevel, selectedType],
  );

  const rankedScholarships = useMemo(
    () => filterScholarships(SCHOLARSHIPS, effectiveFilters, profile),
    [effectiveFilters, profile],
  );

  const analytics = useMemo(
    () => computePortfolioAnalytics(SCHOLARSHIPS, applications, profile),
    [applications, profile],
  );

  const urgentScholarships = useMemo(
    () =>
      [...SCHOLARSHIPS]
        .filter((s) => {
          const d = daysUntil(s.deadline);
          return d >= 0 && d <= 14;
        })
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      const clean = sanitizeSearchQuery(value);
      setSearchInput(clean);
      setFilter('query', clean);
    },
    [setFilter],
  );

  const handleResetAll = useCallback(() => {
    setSearchInput('');
    setSelectedLevel('all');
    setSelectedType('all');
    resetFilters();
    toast('Filters reset to default');
  }, [resetFilters]);

  const handleProfileQuickSave = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      completeOnboarding();
      toast('Eligibility profile updated — scholarship match scores recalculated!');
    },
    [completeOnboarding],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Floating glassmorphism pill navbar */}
      <header role="banner" className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:top-6 sm:px-6 lg:px-8">
        <div className="glass-pill flex items-center justify-between gap-4 rounded-full px-4 py-2 sm:px-6 sm:py-2.5">
          <Logo to="/" />
          <nav aria-label="Primary navigation" className="hidden items-center gap-1.5 md:flex">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="rounded-full px-4 py-2 text-[15px] font-medium text-ink/80 transition-colors duration-300 hover:bg-accent/15 hover:text-ink sm:text-[16px]"
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="glass-subtle inline-flex items-center justify-center rounded-full p-2 text-ink md:hidden"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav-menu"
            aria-label="Mobile navigation"
            className="glass-popover mt-2 flex flex-col gap-1 rounded-3xl p-3 md:hidden"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent/15"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" role="main" className="responsive-container animate-fade-in-up flex-1">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8"
        >
          <div className="card mx-auto px-6 py-12 text-center sm:px-14 sm:py-16">
            <picture className="mx-auto mb-4 inline-block">
              <source media="(min-width: 768px)" srcSet="/favicon.svg" type="image/svg+xml" />
              <source media="(max-width: 767px)" srcSet="/favicon.svg" type="image/svg+xml" />
              <img
                src="/favicon.svg"
                srcSet="/favicon.svg 1x, /favicon.svg 2x"
                sizes="(max-width: 768px) 36px, 44px"
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
                alt="Grantly optical prism emblem"
                className="mx-auto h-11 w-11 rounded-2xl shadow-sm"
              />
            </picture>
            <div>
              <span className="chip text-ink">GRANTLY — Unified Scholarship Discovery &amp; Management Platform</span>
            </div>
            <h1
              id="hero-heading"
              className="mx-auto mt-5 max-w-4xl font-display text-4xl font-light tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4rem]"
            >
              Rethinking the Scholarship Experience.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-muted sm:text-lg">
              Transform a complex maze of portals, PDFs, and spreadsheets into one seamless digital journey: find relevant opportunities, understand eligibility with explainable match scores, navigate application processes, and track every deadline.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/discover" className={buttonClasses('primary', 'lg')}>
                Discover scholarships <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link to="/tracker" className={buttonClasses('secondary', 'lg')}>
                Application tracker ({applications.length})
              </Link>
              <Link to="/profile" className={buttonClasses('secondary', 'lg')}>
                Eligibility profile ({completeness}%)
              </Link>
            </div>
          </div>

          {/* Live Portfolio KPIs */}
          <dl
            aria-label="Scholarship platform summary metrics"
            className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <Stat
              label="Open scholarships"
              value={String(SCHOLARSHIPS.length)}
              hint={`${analytics.eligibleCount + analytics.likelyCount} match your profile`}
              icon={<Sparkles aria-hidden="true" className="h-4 w-4 text-ink" />}
            />
            <Stat
              label="Eligible funding pool"
              value={formatINRCompact(analytics.eligiblePoolINR)}
              hint={`Avg match score: ${analytics.averageMatchScore}%`}
              icon={<IndianRupee aria-hidden="true" className="h-4 w-4 text-ink" />}
            />
            <Stat
              label="Tracked applications"
              value={String(analytics.trackedCount)}
              hint={`${formatINR(analytics.trackedPoolINR)} tracked value`}
              icon={<Award aria-hidden="true" className="h-4 w-4 text-ink" />}
            />
            <Stat
              label="Closing in 14 days"
              value={`${analytics.closingSoonCount} urgent`}
              hint="Exportable to .ics calendar"
              icon={<CalendarClock aria-hidden="true" className="h-4 w-4 text-ink" />}
            />
          </dl>
        </section>

        {/* Interactive Scholarship Discovery, Eligibility Matcher & Application Management Studio */}
        <section
          aria-labelledby="live-workspace-heading"
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="card mb-6 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-line/20 pb-5 lg:flex-row lg:items-center">
              <div>
                <h2 id="live-workspace-heading" className="text-2xl font-light tracking-[-0.03em] text-ink sm:text-3xl">
                  Interactive Scholarship Discovery &amp; Eligibility Matcher
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Search opportunities, filter by education level, award amount or scholarship type, and customize your student profile for instant 0–100% eligibility scoring.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    downloadIcs(urgentScholarships, 'grantly-urgent-deadlines.ics');
                    toast(`Exported ${urgentScholarships.length} upcoming deadlines (.ics)`);
                  }}
                >
                  <CalendarPlus aria-hidden="true" className="h-3.5 w-3.5" /> Export Deadlines (.ics)
                </Button>
                {applications.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      downloadApplicationsCsv(applications);
                      toast(`Exported ${applications.length} tracked applications (.csv)`);
                    }}
                  >
                    <Download aria-hidden="true" className="h-3.5 w-3.5" /> Export Tracker (.csv)
                  </Button>
                )}
                {compareIds.length > 0 && (
                  <Link to="/compare" className={buttonClasses('primary', 'sm')}>
                    <GitCompareArrows aria-hidden="true" className="h-3.5 w-3.5" /> Compare ({compareIds.length})
                  </Link>
                )}
              </div>
            </div>

            {/* Interactive Search & Multi-Facet Filter Controls */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative sm:col-span-2">
                <label htmlFor="landing-scholarship-search" className="label">
                  Search scholarships
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                  />
                  <input
                    id="landing-scholarship-search"
                    type="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by title, provider, field or keyword…"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="landing-level-filter" className="label">
                  Education level
                </label>
                <select
                  id="landing-level-filter"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as EducationLevel | 'all')}
                  className="input"
                >
                  <option value="all">All education levels</option>
                  {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {EDUCATION_LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="landing-type-filter" className="label">
                  Scholarship category
                </label>
                <select
                  id="landing-type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ScholarshipType | 'all')}
                  className="input"
                >
                  <option value="all">All categories</option>
                  {(Object.keys(SCHOLARSHIP_TYPE_LABELS) as ScholarshipType[]).map((t) => (
                    <option key={t} value={t}>
                      {SCHOLARSHIP_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="landing-sort-select" className="label">
                  Sort opportunities by
                </label>
                <select
                  id="landing-sort-select"
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value as SortOption)}
                  className="input"
                >
                  <option value="best-match">Best eligibility match</option>
                  <option value="deadline">Deadline (soonest first)</option>
                  <option value="amount-high">Award amount (high → low)</option>
                  <option value="amount-low">Award amount (low → high)</option>
                  <option value="newest">Deadline (latest)</option>
                </select>
              </div>
            </div>

            {/* Minimum Award Slider + Eligible-Only Toggle + Reset */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line/15 pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={filters.eligibleOnly}
                    onChange={(e) => setFilter('eligibleOnly', e.target.checked)}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span>Only show scholarships I qualify for</span>
                </label>

                <div className="flex items-center gap-2.5">
                  <label htmlFor="landing-min-award" className="text-xs font-medium text-ink-muted">
                    Min award:{' '}
                    <strong className="text-ink">
                      {filters.minAmount > 0 ? formatINRCompact(filters.minAmount) : 'Any'}
                    </strong>
                  </label>
                  <input
                    id="landing-min-award"
                    type="range"
                    min={0}
                    max={200000}
                    step={5000}
                    value={filters.minAmount}
                    onChange={(e) => setFilter('minAmount', Number(e.target.value))}
                    aria-label="Minimum scholarship award amount"
                    className="w-32 accent-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="text-xs font-medium text-ink-muted"
                >
                  Showing <strong className="text-ink">{rankedScholarships.length}</strong> of {SCHOLARSHIPS.length}{' '}
                  scholarships
                </span>
                <Button variant="secondary" size="sm" onClick={handleResetAll}>
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Reset filters
                </Button>
              </div>
            </div>
          </div>

          {/* Instant Student Eligibility Profile Tuner Form */}
          <form
            onSubmit={handleProfileQuickSave}
            aria-label="Quick student eligibility calculator"
            className="card mb-6 p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wand2 aria-hidden="true" className="h-4 w-4 text-ink" />
                <h3 className="text-[16px] font-medium text-ink">
                  Live Eligibility Profile Calculator ({completeness}% complete)
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                Adjust your academic &amp; income details to recalculate all 24 match scores in real time
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <label htmlFor="quick-name" className="label">
                  Student name
                </label>
                <input
                  id="quick-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: sanitizeTextInput(e.target.value, 80) })}
                  placeholder="e.g. Ananya Sharma"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="quick-level" className="label">
                  Current level
                </label>
                <select
                  id="quick-level"
                  value={profile.educationLevel ?? ''}
                  onChange={(e) =>
                    updateProfile({ educationLevel: (e.target.value || null) as EducationLevel | null })
                  }
                  className="input"
                >
                  <option value="">Select level…</option>
                  {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]).map((k) => (
                    <option key={k} value={k}>
                      {EDUCATION_LEVEL_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quick-field" className="label">
                  Field of study
                </label>
                <select
                  id="quick-field"
                  value={profile.fieldOfStudy ?? ''}
                  onChange={(e) =>
                    updateProfile({ fieldOfStudy: (e.target.value || null) as FieldOfStudy | null })
                  }
                  className="input"
                >
                  <option value="">Select field…</option>
                  {(Object.keys(FIELD_LABELS) as FieldOfStudy[]).map((k) => (
                    <option key={k} value={k}>
                      {FIELD_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quick-pct" className="label">
                  Marks / CGPA (%)
                </label>
                <input
                  id="quick-pct"
                  type="number"
                  min={0}
                  max={100}
                  value={profile.percentage ?? ''}
                  onChange={(e) =>
                    updateProfile({ percentage: sanitizeNumericInput(e.target.value, 0, 100) })
                  }
                  placeholder="88"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="quick-income" className="label">
                  Family income (₹/yr)
                </label>
                <input
                  id="quick-income"
                  type="number"
                  min={0}
                  step={10000}
                  value={profile.familyIncome ?? ''}
                  onChange={(e) =>
                    updateProfile({ familyIncome: sanitizeNumericInput(e.target.value, 0, 50000000) })
                  }
                  placeholder="450000"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="quick-category" className="label">
                  Social category
                </label>
                <div className="flex gap-2">
                  <select
                    id="quick-category"
                    value={profile.category ?? ''}
                    onChange={(e) =>
                      updateProfile({ category: (e.target.value || null) as SocialCategory | null })
                    }
                    className="input"
                  >
                    <option value="">Category…</option>
                    {(Object.keys(CATEGORY_LABELS) as SocialCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="md" aria-label="Apply profile changes">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Live Filtered Scholarship Results Grid */}
          {rankedScholarships.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-[16px] font-medium text-ink">No scholarships match your current filter combination.</p>
              <p className="mt-1 text-xs text-ink-muted">
                Try clearing a filter or lowering the minimum award threshold.
              </p>
              <Button variant="secondary" className="mt-4" onClick={handleResetAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Matching scholarships">
                {rankedScholarships.slice(0, showCount).map(({ scholarship, match }) => (
                  <li key={scholarship.id}>
                    <ScholarshipCard scholarship={scholarship} match={match} />
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {showCount < rankedScholarships.length && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowCount((c) => c + 6)}
                  >
                    Show more scholarships ({rankedScholarships.length - showCount} remaining)
                  </Button>
                )}
                <Link to="/discover" className={buttonClasses('primary', 'lg')}>
                  Open full Discover &amp; Filter view <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}

          {/* Quick Tracked Applications Strip */}
          {applications.length > 0 && (
            <div className="card mt-8 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-normal tracking-[-0.02em] text-ink">
                  Your Active Scholarship Applications ({applications.length})
                </h3>
                <Link to="/tracker" className="text-xs font-medium text-ink hover:underline">
                  Open full Kanban board →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {applications.slice(0, 3).map((app) => {
                  const s = SCHOLARSHIPS.find((x) => x.id === app.scholarshipId);
                  if (!s) return null;
                  return (
                    <div
                      key={app.scholarshipId}
                      className="glass-subtle flex items-center justify-between gap-3 rounded-2xl p-3.5"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/scholarships/${s.id}`}
                          className="block truncate text-sm font-medium text-ink hover:underline"
                        >
                          {s.title}
                        </Link>
                        <p className="text-xs text-ink-muted">{formatINR(s.amount)}</p>
                      </div>
                      <select
                        aria-label={`Application status for ${s.title}`}
                        value={app.status}
                        onChange={(e) => {
                          const next = e.target.value as ApplicationStatus;
                          moveApplication(s.id, next);
                          toast(`Moved to ${STATUS_META[next].label}`);
                        }}
                        className="glass-pill rounded-full px-3 py-1 text-xs font-medium text-ink"
                      >
                        {(Object.keys(STATUS_META) as ApplicationStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_META[st].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Capabilities */}
        <section aria-labelledby="journey-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="card mb-8 p-8 text-center sm:p-10">
            <h2 id="journey-heading" className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">
              Every stage of the scholarship journey, in one place.
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm text-ink-muted sm:text-[16px]">
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
        <section aria-labelledby="cta-heading" className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="card p-8 text-center sm:p-12">
            <h2 id="cta-heading" className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">
              Ready to manage your complete scholarship pipeline?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted sm:text-[16px]">
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
                Launch Command Dashboard <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer role="contentinfo" className="mx-auto mb-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-pill flex flex-col items-center justify-between gap-2 rounded-full px-6 py-4 text-center text-xs text-ink-muted sm:flex-row">
          <Logo to="/" size="sm" />
          <span>
            Grantly — Unified Scholarship Discovery &amp; Management Platform. All scholarship entries are sample data for demonstration.
          </span>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card animate-fade-in-up p-5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <dt className="text-xs font-medium text-ink-muted">{label}</dt>
        <span className="glass-subtle rounded-full p-2">{icon}</span>
      </div>
      <dd className="mt-2 font-display text-2xl font-normal tracking-[-0.03em] text-ink sm:text-3xl">{value}</dd>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
