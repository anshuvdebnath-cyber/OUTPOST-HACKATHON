import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, buttonClasses } from '@/components/ui/Button';
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

/** Scholarship discovery: search, filter, sort and personalised match scores. */
export default function DiscoverPage() {
  useDocumentTitle('Discover scholarships');
  const { filters, setFilter, resetFilters } = useFilterStore();
  const profile = useProfileStore((s) => s.profile);
  const compareCount = useCompareStore((s) => s.ids.length);

  const [query, setQuery] = useState(filters.query);
  const debouncedQuery = useDebounce(query, 200);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setFilter('query', debouncedQuery), [debouncedQuery, setFilter]);

  // Drawer: focus the close button on open, close on Escape, lock background scroll.
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

  const results = useMemo(() => filterScholarships(SCHOLARSHIPS, filters, profile), [filters, profile]);
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <PageHeader
        title="Discover scholarships"
        description="Search every opportunity in one place. Each scholarship is scored against your profile so the best fits rise to the top."
      />

      {/* Search + sort toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="scholarship-search" className="sr-only">
            Search scholarships
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input
            id="scholarship-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, provider or keyword (e.g. women, engineering, research)"
            className="input h-12 pl-11 text-base"
            autoComplete="off"
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort scholarships
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value as SortOption)}
            className="input h-12 flex-1 sm:w-52"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
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
              <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* Desktop filter sidebar */}
        <aside aria-label="Scholarship filters" className="hidden lg:block">
          <div className="card sticky top-6 p-5">
            <FilterPanel />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            Results
          </h2>
          <p aria-live="polite" className="mb-4 text-sm text-ink-muted">
            Showing <strong className="text-ink">{results.length}</strong> of {SCHOLARSHIPS.length} open scholarships
          </p>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No scholarships match these filters"
              description="Try removing a filter or searching for a broader keyword."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    resetFilters();
                  }}
                >
                  Clear search & filters
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
        <div className="fixed inset-x-0 bottom-20 z-20 flex justify-center px-4 lg:bottom-6 lg:pl-64">
          <Link to="/compare" className={buttonClasses('primary', 'lg', 'shadow-lift')}>
            <GitCompareArrows aria-hidden="true" className="h-5 w-5" />
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
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-fade-in-up overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="drawer-title" className="text-lg font-semibold text-ink">
                Filter scholarships
              </h2>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted"
              >
                <X aria-hidden="true" className="h-5 w-5" />
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

