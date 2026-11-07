import { getScholarshipById, SCHOLARSHIPS } from '../data/scholarships';
import { computeMatch, type MatchResult } from '../features/eligibility/matchEngine';
import { filterScholarships, type RankedScholarship } from '../features/scholarships/filterScholarships';
import type { Scholarship, ScholarshipFilters, StudentProfile } from '../types/scholarship';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
}

/**
 * Asynchronous Scholarship Data & Matching API Client.
 * Supports AbortController cancellation, structured error handling, and deterministic local resolution.
 */
export async function fetchScholarshipCatalog(signal?: AbortSignal): Promise<ApiResponse<Scholarship[]>> {
  try {
    if (signal?.aborted) {
      return { data: null, error: 'Request aborted', timestamp: new Date().toISOString() };
    }
    const data = await Promise.resolve([...SCHOLARSHIPS]);
    return { data, error: null, timestamp: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load scholarship catalog';
    return { data: null, error: message, timestamp: new Date().toISOString() };
  }
}

/**
 * Queries and ranks scholarships asynchronously against a student profile and filter set.
 */
export async function queryScholarshipsAsync(
  filters: ScholarshipFilters,
  profile: StudentProfile,
  signal?: AbortSignal,
): Promise<ApiResponse<RankedScholarship[]>> {
  try {
    if (signal?.aborted) {
      return { data: null, error: 'Query aborted', timestamp: new Date().toISOString() };
    }
    const ranked = await Promise.resolve(filterScholarships(SCHOLARSHIPS, filters, profile));
    return { data: ranked, error: null, timestamp: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to query scholarships';
    return { data: null, error: message, timestamp: new Date().toISOString() };
  }
}

/**
 * Evaluates a single scholarship's eligibility match asynchronously by ID.
 */
export async function evaluateScholarshipByIdAsync(
  scholarshipId: string,
  profile: StudentProfile,
): Promise<ApiResponse<{ scholarship: Scholarship; match: MatchResult }>> {
  try {
    const scholarship = await Promise.resolve(getScholarshipById(scholarshipId));
    if (!scholarship) {
      return { data: null, error: `Scholarship "${scholarshipId}" not found`, timestamp: new Date().toISOString() };
    }
    const match = computeMatch(profile, scholarship);
    return { data: { scholarship, match }, error: null, timestamp: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to evaluate scholarship eligibility';
    return { data: null, error: message, timestamp: new Date().toISOString() };
  }
}

