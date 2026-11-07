import type { Scholarship, ScholarshipFilters, StudentProfile } from '@/types/scholarship';
import { computeMatch, type MatchResult } from '@/features/eligibility/matchEngine';
import { daysUntil } from '@/lib/date';

export const DEFAULT_FILTERS: ScholarshipFilters = {
  query: '',
  levels: [],
  fields: [],
  types: [],
  minAmount: 0,
  deadlineWithinDays: null,
  eligibleOnly: false,
  sort: 'best-match',
};

export interface RankedScholarship {
  scholarship: Scholarship;
  match: MatchResult;
  daysLeft: number;
}

/** Lower-cased searchable text for a scholarship (title, provider, summary, tags). */
function haystack(s: Scholarship): string {
  return [s.title, s.provider, s.summary, s.type, ...s.tags].join(' ').toLowerCase();
}

/**
 * Scholarship search & filter engine.
 * Applies free-text search, facet filters and sorting, and attaches a match result
 * for the given student profile. Closed scholarships are always excluded.
 */
export function filterScholarships(
  scholarships: Scholarship[],
  filters: ScholarshipFilters,
  profile: StudentProfile,
  today: Date = new Date(),
): RankedScholarship[] {
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const results = scholarships
    .map((scholarship) => ({
      scholarship,
      match: computeMatch(profile, scholarship),
      daysLeft: daysUntil(scholarship.deadline, today),
    }))
    .filter(({ scholarship: s, match, daysLeft }) => {
      if (daysLeft < 0) return false;
      if (terms.length && !terms.every((t) => haystack(s).includes(t))) return false;
      if (filters.levels.length && !filters.levels.some((l) => s.eligibility.levels.includes(l))) return false;
      if (filters.fields.length && s.eligibility.fields?.length && !filters.fields.some((f) => s.eligibility.fields?.includes(f)))
        return false;
      if (filters.types.length && !filters.types.includes(s.type)) return false;
      if (s.amount < filters.minAmount) return false;
      if (filters.deadlineWithinDays !== null && daysLeft > filters.deadlineWithinDays) return false;
      if (filters.eligibleOnly && match.verdict === 'ineligible') return false;
      return true;
    });

  return sortResults(results, filters.sort);
}

function sortResults(results: RankedScholarship[], sort: ScholarshipFilters['sort']): RankedScholarship[] {
  const sorted = [...results];
  switch (sort) {
    case 'deadline':
      return sorted.sort((a, b) => a.daysLeft - b.daysLeft);
    case 'amount-high':
      return sorted.sort((a, b) => b.scholarship.amount - a.scholarship.amount);
    case 'amount-low':
      return sorted.sort((a, b) => a.scholarship.amount - b.scholarship.amount);
    case 'newest':
      return sorted.sort((a, b) => b.daysLeft - a.daysLeft);
    case 'best-match':
    default:
      return sorted.sort((a, b) => b.match.score - a.match.score || a.daysLeft - b.daysLeft);
  }
}

/** Number of active (non-default) filters — shown as a badge on the mobile filter button. */
export function countActiveFilters(f: ScholarshipFilters): number {
  return (
    f.levels.length +
    f.fields.length +
    f.types.length +
    (f.minAmount > 0 ? 1 : 0) +
    (f.deadlineWithinDays !== null ? 1 : 0) +
    (f.eligibleOnly ? 1 : 0)
  );
}

