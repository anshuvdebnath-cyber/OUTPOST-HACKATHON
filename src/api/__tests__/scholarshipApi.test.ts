import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS } from '../../features/scholarships/filterScholarships';
import { EMPTY_PROFILE } from '../../store/useProfileStore';
import {
  evaluateScholarshipByIdAsync,
  fetchScholarshipCatalog,
  queryScholarshipsAsync,
} from '../scholarshipApi';

describe('scholarshipApi', () => {
  it('fetches the scholarship catalog and respects AbortController', async () => {
    const res = await fetchScholarshipCatalog();
    expect(res.error).toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data?.length).toBeGreaterThanOrEqual(20);

    const controller = new AbortController();
    controller.abort();
    const aborted = await fetchScholarshipCatalog(controller.signal);
    expect(aborted.data).toBeNull();
    expect(aborted.error).toBe('Request aborted');
  });

  it('queries and ranks scholarships asynchronously', async () => {
    const res = await queryScholarshipsAsync(
      { ...DEFAULT_FILTERS, query: 'Merit' },
      EMPTY_PROFILE,
    );
    expect(res.error).toBeNull();
    expect(res.data?.length).toBeGreaterThan(0);
  });

  it('evaluates a single scholarship by id or returns an error for missing ids', async () => {
    const catalog = await fetchScholarshipCatalog();
    const firstId = catalog.data?.[0]?.id ?? '';
    const found = await evaluateScholarshipByIdAsync(firstId, EMPTY_PROFILE);
    expect(found.error).toBeNull();
    expect(found.data?.scholarship.id).toBe(firstId);

    const missing = await evaluateScholarshipByIdAsync('non-existent-id-xyz', EMPTY_PROFILE);
    expect(missing.data).toBeNull();
    expect(missing.error).toContain('not found');
  });
});
