import { describe, expect, it } from 'vitest';
import { countActiveFilters, DEFAULT_FILTERS, filterScholarships } from '../filterScholarships';
import { SCHOLARSHIPS } from '../../../data/scholarships';
import { EMPTY_PROFILE } from '../../../store/useProfileStore';

describe('filterScholarships', () => {
  it('returns all open scholarships when default filters are used', () => {
    const res = filterScholarships(SCHOLARSHIPS, DEFAULT_FILTERS, EMPTY_PROFILE);
    expect(res.length).toBe(SCHOLARSHIPS.length);
  });

  it('filters by search query across title, provider and tags', () => {
    const res = filterScholarships(SCHOLARSHIPS, { ...DEFAULT_FILTERS, query: 'Shakti STEM' }, EMPTY_PROFILE);
    expect(res.length).toBe(1);
    expect(res[0].scholarship.id).toBe('shakti-women-stem');
  });

  it('filters by minimum award amount and sorts high to low', () => {
    const res = filterScholarships(
      SCHOLARSHIPS,
      { ...DEFAULT_FILTERS, minAmount: 100000, sort: 'amount-high' },
      EMPTY_PROFILE,
    );
    expect(res.every((r) => r.scholarship.amount >= 100000)).toBe(true);
    for (let i = 1; i < res.length; i++) {
      expect(res[i - 1].scholarship.amount).toBeGreaterThanOrEqual(res[i].scholarship.amount);
    }
  });

  it('counts active filters accurately', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_FILTERS,
        levels: ['undergraduate'],
        minAmount: 50000,
        eligibleOnly: true,
      }),
    ).toBe(3);
  });
});

