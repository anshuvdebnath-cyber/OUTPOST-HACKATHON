import { describe, expect, it } from 'vitest';
import { computeMatch } from '@/features/eligibility/matchEngine';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { EMPTY_PROFILE } from '@/store/useProfileStore';
import type { StudentProfile } from '@/types/scholarship';

describe('computeMatch — Explainable Eligibility Match Engine', () => {
  const shakti = SCHOLARSHIPS.find((s) => s.id === 'shakti-women-stem')!;

  it('returns 100 and verdict "eligible" when every criterion is met', () => {
    const profile: StudentProfile = {
      name: 'Ananya',
      educationLevel: 'undergraduate',
      fieldOfStudy: 'engineering',
      percentage: 88,
      familyIncome: 450000,
      state: 'Maharashtra',
      gender: 'female',
      category: 'general',
      documents: [],
    };
    const res = computeMatch(profile, shakti);
    expect(res.score).toBe(100);
    expect(res.verdict).toBe('eligible');
    expect(res.checks.every((c) => c.outcome === 'pass')).toBe(true);
  });

  it('returns verdict "likely" when profile fields are incomplete but none fail', () => {
    const res = computeMatch(EMPTY_PROFILE, shakti);
    expect(res.verdict).toBe('likely');
    expect(res.score).toBeGreaterThan(0);
    expect(res.score).toBeLessThan(100);
  });

  it('penalises score and returns verdict "ineligible" when a criterion fails', () => {
    const profile: StudentProfile = {
      ...EMPTY_PROFILE,
      educationLevel: 'undergraduate',
      fieldOfStudy: 'engineering',
      percentage: 85,
      familyIncome: 400000,
      gender: 'male', // Shakti is reserved for female students
    };
    const res = computeMatch(profile, shakti);
    expect(res.verdict).toBe('ineligible');
    const genderCheck = res.checks.find((c) => c.key === 'gender');
    expect(genderCheck?.outcome).toBe('fail');
  });
});

