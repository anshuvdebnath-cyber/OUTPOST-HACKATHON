import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CalendarPlus, Command, Compass, Search, Sparkles, X } from 'lucide-react';
import { fetchScholarshipCatalog } from './api/scholarshipApi';
import { preloadCoreRoutes } from './app/router';
import { AppShell } from './components/layout/AppShell';
import { ShaderBackground } from './components/layout/ShaderBackground';
import { SkipLink } from './components/layout/SkipLink';
import { Button } from './components/ui/Button';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageSkeleton } from './components/ui/Skeleton';
import { Toaster } from './components/ui/Toaster';
import { APP_CONFIG } from './config/appConfig';
import { ScholarshipProvider } from './context/ScholarshipContext';
import { SCHOLARSHIPS } from './data/scholarships';
import { downloadIcs } from './features/deadlines/generateIcs';
import { computeDocumentReadiness } from './features/documents/documentReadiness';
import { computeMatch } from './features/eligibility/matchEngine';
import { filterScholarships } from './features/scholarships/filterScholarships';
import { EDUCATION_LEVEL_LABELS, SCHOLARSHIP_TYPE_LABELS } from './lib/constants';
import { formatINR } from './lib/currency';
import { formatDate } from './lib/date';
import { initPerformanceMonitoring } from './lib/performance';
import ComparePage from './pages/ComparePage';
import DashboardPage from './pages/DashboardPage';
import DeadlinesPage from './pages/DeadlinesPage';
import DiscoverPage from './pages/DiscoverPage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import TrackerPage from './pages/TrackerPage';
import { computePortfolioAnalytics, downloadApplicationsCsv } from './services/scholarshipService';
import { useApplicationStore } from './store/useApplicationStore';
import { useFilterStore } from './store/useFilterStore';
import { useProfileStore } from './store/useProfileStore';
import { useThemeStore } from './store/useThemeStore';
import { toast } from './store/useToastStore';
import type { EducationLevel, ScholarshipType } from './types/scholarship';
import { sanitizeSearchQuery } from './utils/security';

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Root GRANTLY Application Component:
 *  - Mounts the unified Scholarship Discovery, Eligibility Matching & Application Management routes
 *  - Provides a global Command & Quick-Eligibility Finder Modal (Ctrl+K / Cmd+K)
 *  - Syncs Light/Night theme, WebGL refractive glass shader, and Core Web Vitals telemetry
 */
export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const profile = useProfileStore((s) => s.profile);
  const { filters, setFilter } = useFilterStore();
  const applicationsMap = useApplicationStore((s) => s.applications);
  const saveScholarship = useApplicationStore((s) => s.saveScholarship);
  const removeApplication = useApplicationStore((s) => s.removeApplication);

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickLevel, setQuickLevel] = useState<EducationLevel | 'all'>('all');
  const [quickType, setQuickType] = useState<ScholarshipType | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    initPerformanceMonitoring();
    preloadCoreRoutes();
    const controller = new AbortController();
    void fetchScholarshipCatalog(controller.signal);
    return () => controller.abort();
  }, []);

  // Global keyboard shortcut (Ctrl+K / Cmd+K) for quick scholarship discovery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuickOpen((prev) => !prev);
      } else if (event.key === 'Escape' && quickOpen) {
        setQuickOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickOpen]);

  useEffect(() => {
    if (quickOpen) {
      searchInputRef.current?.focus();
    }
  }, [quickOpen]);

  const applications = useMemo(() => Object.values(applicationsMap), [applicationsMap]);

  const quickResults = useMemo(() => {
    const scopedFilters = {
      ...filters,
      query: sanitizeSearchQuery(quickQuery),
      levels: quickLevel === 'all' ? [] : [quickLevel],
      types: quickType === 'all' ? [] : [quickType],
    };
    return filterScholarships(SCHOLARSHIPS, scopedFilters, profile).slice(0, 6);
  }, [filters, quickQuery, quickLevel, quickType, profile]);

  const portfolioStats = useMemo(
    () => computePortfolioAnalytics(SCHOLARSHIPS, applications, profile),
    [applications, profile],
  );

  const handleQuickSearchSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFilter('query', sanitizeSearchQuery(quickQuery));
      setQuickOpen(false);
    },
    [quickQuery, setFilter],
  );

  const handleToggleSave = useCallback(
    (scholarshipId: string) => {
      const target = SCHOLARSHIPS.find((s) => s.id === scholarshipId);
      if (!target) return;
      if (applicationsMap[scholarshipId]) {
        removeApplication(scholarshipId);
        toast('Removed from your scholarship tracker', 'info');
      } else {
        saveScholarship(target);
        toast('Saved to your scholarship application tracker');
      }
    },
    [applicationsMap, removeApplication, saveScholarship],
  );

  return (
    <ErrorBoundary fallbackTitle={`${APP_CONFIG.appName} Workspace Recovery`}>
      <ScholarshipProvider>
        <BrowserRouter>
          <SkipLink />
          <ShaderBackground />

          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
                <Route path="/tracker" element={<TrackerPage />} />
                <Route path="/deadlines" element={<DeadlinesPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>

          {/* Floating Quick-Finder & Eligibility Command Trigger (Ctrl+K) */}
          <div className="no-print fixed bottom-20 right-4 z-30 lg:bottom-6 lg:right-6">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              aria-label="Open quick scholarship search and eligibility finder (Ctrl+K)"
              aria-haspopup="dialog"
              aria-expanded={quickOpen}
              className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-ink shadow-lift transition hover:scale-105"
            >
              <Command aria-hidden="true" className="h-3.5 w-3.5 text-ink" />
              <span className="hidden sm:inline">Quick Finder</span>
              <kbd className="glass-subtle rounded px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Global Scholarship Quick-Finder & Eligibility Modal */}
          {quickOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-finder-title"
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
            >
              <button
                type="button"
                aria-label="Close quick finder"
                tabIndex={-1}
                onClick={() => setQuickOpen(false)}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm"
              />
              <div className="glass-popover relative z-10 w-full max-w-2xl animate-fade-in-up rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3 border-b border-line/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-ink" />
                    <h2 id="quick-finder-title" className="text-lg font-medium text-ink">
                      Quick Scholarship Finder &amp; Eligibility Check
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickOpen(false)}
                    aria-label="Close quick finder dialog"
                    className="glass-subtle rounded-full p-1.5 text-ink"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleQuickSearchSubmit} className="mt-4 space-y-3">
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery(sanitizeSearchQuery(e.target.value))}
                      placeholder="Type a scholarship name, provider, field or keyword…"
                      aria-label="Quick search scholarships"
                      className="input pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    <select
                      aria-label="Filter by education level"
                      value={quickLevel}
                      onChange={(e) => setQuickLevel(e.target.value as EducationLevel | 'all')}
                      className="input py-2 text-xs"
                    >
                      <option value="all">All levels</option>
                      {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {EDUCATION_LEVEL_LABELS[lvl]}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter by scholarship type"
                      value={quickType}
                      onChange={(e) => setQuickType(e.target.value as ScholarshipType | 'all')}
                      className="input py-2 text-xs"
                    >
                      <option value="all">All types</option>
                      {(Object.keys(SCHOLARSHIP_TYPE_LABELS) as ScholarshipType[]).map((t) => (
                        <option key={t} value={t}>
                          {SCHOLARSHIP_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        downloadIcs(
                          quickResults.map((r) => r.scholarship),
                          'grantly-quick-deadlines.ics',
                        );
                        toast('Exported matching deadlines (.ics)');
                      }}
                    >
                      <CalendarPlus aria-hidden="true" className="h-3.5 w-3.5" /> Export .ics
                    </Button>
                  </div>
                </form>

                <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1" aria-label="Quick search results">
                  {quickResults.map(({ scholarship }) => {
                    const match = computeMatch(profile, scholarship);
                    const readiness = computeDocumentReadiness(scholarship, profile.documents);
                    const isSaved = Boolean(applicationsMap[scholarship.id]);
                    return (
                      <li
                        key={scholarship.id}
                        className="glass-subtle flex items-center justify-between gap-3 rounded-2xl p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/scholarships/${scholarship.id}`}
                            onClick={() => setQuickOpen(false)}
                            className="block truncate text-sm font-medium text-ink hover:underline"
                          >
                            {scholarship.title}
                          </Link>
                          <p className="text-xs text-ink-muted">
                            {formatINR(scholarship.amount)} · Due {formatDate(scholarship.deadline)} · Match{' '}
                            <strong className="text-ink">{match.score}%</strong> · Docs{' '}
                            <strong className="text-ink">{readiness.percent}%</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSave(scholarship.id)}
                          aria-pressed={isSaved}
                          aria-label={isSaved ? `Remove ${scholarship.title}` : `Save ${scholarship.title}`}
                          className="glass-pill rounded-full p-2 text-ink"
                        >
                          {isSaved ? (
                            <BookmarkCheck aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <Bookmark aria-hidden="true" className="h-4 w-4" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/20 pt-3 text-xs text-ink-muted">
                  <span>
                    Eligible pool: <strong className="text-ink">{formatINR(portfolioStats.eligiblePoolINR)}</strong> ·
                    Tracked: <strong className="text-ink">{portfolioStats.trackedCount}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {applications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => downloadApplicationsCsv(applications)}
                        className="underline hover:text-ink"
                      >
                        Export CSV
                      </button>
                    )}
                    <Link
                      to="/discover"
                      onClick={() => setQuickOpen(false)}
                      className="inline-flex items-center gap-1 font-medium text-ink hover:underline"
                    >
                      <Compass aria-hidden="true" className="h-3.5 w-3.5" /> Full Discover page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Toaster />
        </BrowserRouter>
      </ScholarshipProvider>
    </ErrorBoundary>
  );
}
