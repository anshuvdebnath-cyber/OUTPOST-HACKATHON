import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { SCHOLARSHIPS } from '../data/scholarships';
import { filterScholarships } from '../features/scholarships/filterScholarships';
import type { RankedScholarship } from '../features/scholarships/filterScholarships';
import { computePortfolioAnalytics, type PortfolioAnalytics } from '../services/scholarshipService';
import { useApplicationStore } from '../store/useApplicationStore';
import { useFilterStore } from '../store/useFilterStore';
import { useProfileStore } from '../store/useProfileStore';
import type { Scholarship } from '../types/scholarship';

export interface ScholarshipContextValue {
  scholarships: Scholarship[];
  rankedScholarships: RankedScholarship[];
  analytics: PortfolioAnalytics;
}

const ScholarshipContext = createContext<ScholarshipContextValue | null>(null);

/**
 * Domain context provider that exposes the scholarship catalog, live profile-ranked
 * eligibility matches, and real-time portfolio analytics across the application tree.
 */
export function ScholarshipProvider({ children }: { children: ReactNode }) {
  const profile = useProfileStore((s) => s.profile);
  const filters = useFilterStore((s) => s.filters);
  const applicationsMap = useApplicationStore((s) => s.applications);

  const applications = useMemo(() => Object.values(applicationsMap), [applicationsMap]);

  const rankedScholarships = useMemo(
    () => filterScholarships(SCHOLARSHIPS, filters, profile),
    [filters, profile],
  );

  const analytics = useMemo(
    () => computePortfolioAnalytics(SCHOLARSHIPS, applications, profile),
    [applications, profile],
  );

  const value = useMemo<ScholarshipContextValue>(
    () => ({
      scholarships: SCHOLARSHIPS,
      rankedScholarships,
      analytics,
    }),
    [rankedScholarships, analytics],
  );

  return <ScholarshipContext.Provider value={value}>{children}</ScholarshipContext.Provider>;
}

/**
 * Hook to consume the shared ScholarshipContext.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useScholarshipContext(): ScholarshipContextValue {
  const ctx = useContext(ScholarshipContext);
  if (!ctx) {
    throw new Error('useScholarshipContext must be used within a ScholarshipProvider');
  }
  return ctx;
}

