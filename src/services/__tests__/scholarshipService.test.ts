import { describe, expect, it } from 'vitest';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { computePortfolioAnalytics, serializeApplicationsToCsv } from '@/services/scholarshipService';
import { createApplication } from '@/store/useApplicationStore';
import type { StudentProfile } from '@/types/scholarship';

const SAMPLE_PROFILE: StudentProfile = {
  name: 'Ananya Sharma',
  educationLevel: 'undergraduate',
  fieldOfStudy: 'engineering',
  percentage: 88,
  familyIncome: 450000,
  state: 'Maharashtra',
  gender: 'female',
  category: 'general',
  documents: ['marksheet', 'income-certificate', 'id-proof'],
};

describe('scholarshipService', () => {
  it('computes portfolio analytics across scholarships and tracked applications', () => {
    const app1 = createApplication(SCHOLARSHIPS[0]);
    const app2 = { ...createApplication(SCHOLARSHIPS[1]), status: 'awarded' as const };

    const stats = computePortfolioAnalytics(SCHOLARSHIPS, [app1, app2], SAMPLE_PROFILE);

    expect(stats.totalScholarships).toBe(SCHOLARSHIPS.length);
    expect(stats.trackedCount).toBe(2);
    expect(stats.awardedCount).toBe(1);
    expect(stats.awardedPoolINR).toBe(SCHOLARSHIPS[1].amount);
    expect(stats.eligiblePoolINR).toBeGreaterThan(0);
    expect(stats.averageMatchScore).toBeGreaterThan(0);
  });

  it('serializes tracked applications to RFC 4180 CSV format', () => {
    const app = {
      ...createApplication(SCHOLARSHIPS[0]),
      notes: 'Submitted marksheet, awaiting verification',
    };
    const csv = serializeApplicationsToCsv([app]);

    expect(csv).toContain('Scholarship ID,Title,Provider,Award (INR)');
    expect(csv).toContain(SCHOLARSHIPS[0].id);
    expect(csv).toContain('"Submitted marksheet, awaiting verification"');
  });
});
