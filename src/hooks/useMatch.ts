import { useMemo } from 'react';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { computeMatch, type MatchResult } from '@/features/eligibility/matchEngine';
import { useProfileStore } from '@/store/useProfileStore';
import type { Scholarship } from '@/types/scholarship';

/** Memoised match result for a single scholarship against the current profile. */
export function useMatch(scholarship: Scholarship | undefined): MatchResult | null {
  const profile = useProfileStore((s) => s.profile);
  return useMemo(() => (scholarship ? computeMatch(profile, scholarship) : null), [profile, scholarship]);
}

/** Memoised map of scholarshipId → match result for every scholarship. */
export function useAllMatches(): Map<string, MatchResult> {
  const profile = useProfileStore((s) => s.profile);
  return useMemo(() => new Map(SCHOLARSHIPS.map((s) => [s.id, computeMatch(profile, s)])), [profile]);
}

