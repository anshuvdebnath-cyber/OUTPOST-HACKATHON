import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, buttonClasses } from '@/components/ui/Button';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { FilterPanel } from '@/features/scholarships/FilterPanel';
import { ScholarshipCard } from '@/features/scholarships/ScholarshipCard';
import { countActiveFilters, filterScholarships } from '@/features/scholarships/filterScholarships';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useCompareStore } from '@/store/useCompareStore';
import { useFilterStore } from '@/store/useFilterStore';
import { useProfileStore } from '@/store/useProfileStore';
import type { SortOption } from '@/types/scholarship';

const SORT_LABELS: Record<SortOption, string> = {
  'best-match': 'Best match',
  deadline: 'Deadline (soonest)',
  'amount-high': 'Award (high → low)',
  'amount-low': 'Award (low → high)',
  newest: 'Deadline (latest)',
};

/** Monochrome glassmorphism scholarship discovery page. */
export default function DiscoverPage() {
  useDocumentTitle('Discover scholarships');
  const { filters, setFilter, resetFilters } = useFilterStore();
  const profile = useProfileStore((s) => s.profile);
  const compareCount = useCompareStore((s) => s.ids.length);

  const [query, setQuery] = useState(filters.query);
  const debouncedQuery = useDebounce(query, 200);
  const deferredFilters = useDeferredValue(filters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setFilter('query', debouncedQuery), [debouncedQuery, setFilter]);

  const handleSortChange = useCallback(
    (val: SortOption) => {
      setFilter('sort', val);
    },
    [setFilter],
  );

  const handleClearAll = useCallback(() => {
    setQuery('');
    resetFilters();
  }, [resetFilters]);

  useEffect(() => {
    if (!drawerOpen) return;
    drawerCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const results = useMemo(
    () => filterScholarships(SCHOLARSHIPS, deferredFilters, profile),
    [deferredFilters, profile],
  );
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <>
      <PageHeader
        title="Discover scholarships"
        description="Search every opportunity in one place. Each scholarship is scored against your profile so the best fits rise to the top."
      />

      {/* Search + sort glass toolbar (z-30 so the sort dropdown floats above scholarship cards) */}
      <div className="card relative z-30 mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1">
          <label htmlFor="scholarship-search" className="sr-only">
            Search scholarships
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            id="scholarship-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, provider or keyword (e.g. women, engineering, research)"
            className="input h-12 rounded-full pl-11 text-sm"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <SortDropdown
            value={filters.sort}
            onChange={handleSortChange}
            options={SORT_LABELS}
          />
          <Button
            variant="secondary"
            className="h-12 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">{activeCount}</span>
            )}
          </Button>
        </div>
      </div>

      <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[19rem_1fr]">
        {/* Desktop filter sidebar — scrolls naturally with the page so all filters are reachable */}
        <aside aria-label="Scholarship filters" className="hidden lg:block">
          <div className="card p-6">
            <FilterPanel />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            Results
          </h2>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="glass-pill mb-4 inline-flex rounded-full px-4 py-1.5 text-xs text-ink-muted"
          >
            Showing <strong className="mx-1 text-ink">{results.length}</strong> of {SCHOLARSHIPS.length} open scholarships
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No scholarships match these filters"
              description="Try removing a filter or searching for a broader keyword."
              action={
                <Button variant="secondary" onClick={handleClearAll}>
                  Clear search & filters
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {results.map(({ scholarship, match }) => (
                <li key={scholarship.id}>
                  <ScholarshipCard scholarship={scholarship} match={match} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Floating compare tray */}
      {compareCount > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 lg:bottom-8">
          <Link to="/compare" className={buttonClasses('primary', 'lg', 'shadow-lift')}>
            <GitCompareArrows aria-hidden="true" className="h-4 w-4" />
            Compare {compareCount} selected
          </Link>
        </div>
      )}

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <button
            type="button"
            aria-label="Close filters"
            tabIndex={-1}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="card absolute inset-x-3 bottom-3 max-h-[85dvh] animate-fade-in-up overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="drawer-title" className="text-lg font-normal text-ink">
                Filter scholarships
              </h2>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="glass-subtle rounded-full p-2 text-ink"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel />
            <Button size="lg" className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
              Show {results.length} results
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
