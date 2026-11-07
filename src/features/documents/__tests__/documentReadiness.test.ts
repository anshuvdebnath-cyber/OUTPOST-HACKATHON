import { describe, expect, it } from 'vitest';
import { computeDocumentReadiness } from '../documentReadiness';
import { SCHOLARSHIPS } from '../../../data/scholarships';

describe('computeDocumentReadiness', () => {
  const s = SCHOLARSHIPS[0];

  it('computes 0% when student has no documents', () => {
    const res = computeDocumentReadiness(s, []);
    expect(res.percent).toBe(0);
    expect(res.missing.length).toBe(s.requiredDocuments.length);
  });

  it('computes 100% when student owns all required documents', () => {
    const res = computeDocumentReadiness(s, s.requiredDocuments);
    expect(res.percent).toBe(100);
    expect(res.missing).toHaveLength(0);
  });
});

