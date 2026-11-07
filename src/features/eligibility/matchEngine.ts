import type { Scholarship, StudentProfile } from '@/types/scholarship';
import { CATEGORY_LABELS, EDUCATION_LEVEL_LABELS, FIELD_LABELS } from '@/lib/constants';
import { formatINR } from '@/lib/currency';

/**
 * Explainable Eligibility Match Engine
 * ------------------------------------
 * Compares a student profile against a scholarship's eligibility rules and returns:
 *  - a 0–100 match score,
 *  - an overall verdict (eligible / likely / ineligible),
 *  - a human-readable reason for every criterion.
 *
 * Pure function: no side effects, fully unit-tested (see matchEngine.test.ts).
 */

export type CheckOutcome = 'pass' | 'fail' | 'unknown';

export interface MatchCheck {
  key: 'level' | 'percentage' | 'income' | 'field' | 'state' | 'gender' | 'category';
  label: string;
  outcome: CheckOutcome;
  detail: string;
  weight: number;
}

export type MatchVerdict = 'eligible' | 'likely' | 'ineligible';

export interface MatchResult {
  score: number;
  verdict: MatchVerdict;
  checks: MatchCheck[];
}

/** Relative importance of each criterion. Sums to 100. */
export const CRITERIA_WEIGHTS: Record<MatchCheck['key'], number> = {
  level: 30,
  percentage: 20,
  income: 20,
  field: 15,
  state: 5,
  gender: 5,
  category: 5,
};

/** Unknown profile values earn half credit so incomplete profiles still get useful ranking. */
const UNKNOWN_CREDIT = 0.5;
/** Any failed criterion halves the score so ineligible scholarships sink in "best match" sort. */
const FAIL_PENALTY = 0.5;

export function computeMatch(profile: StudentProfile, scholarship: Scholarship): MatchResult {
  const e = scholarship.eligibility;

  const checks: MatchCheck[] = [
    check('level', 'Education level', profile.educationLevel, (lvl) => e.levels.includes(lvl), {
      pass: (lvl) => `${EDUCATION_LEVEL_LABELS[lvl]} is eligible`,
      fail: (lvl) =>
        `Open to ${e.levels.map((l) => EDUCATION_LEVEL_LABELS[l]).join(', ')} — you are ${EDUCATION_LEVEL_LABELS[lvl]}`,
      unknown: 'Add your education level to check',
    }),

    e.minPercentage === undefined
      ? open('percentage', 'Academic score', 'No minimum marks required')
      : check('percentage', 'Academic score', profile.percentage, (p) => p >= (e.minPercentage ?? 0), {
          pass: (p) => `Your ${p}% meets the ${e.minPercentage}% minimum`,
          fail: (p) => `Requires ${e.minPercentage}% — you have ${p}%`,
          unknown: `Requires at least ${e.minPercentage}% — add your marks`,
        }),

    e.maxFamilyIncome === undefined
      ? open('income', 'Family income', 'No income limit')
      : check('income', 'Family income', profile.familyIncome, (inc) => inc <= (e.maxFamilyIncome ?? Infinity), {
          pass: () => `Within the ${formatINR(e.maxFamilyIncome ?? 0)} income limit`,
          fail: (inc) => `Income limit is ${formatINR(e.maxFamilyIncome ?? 0)} — yours is ${formatINR(inc)}`,
          unknown: `Income must be under ${formatINR(e.maxFamilyIncome ?? 0)} — add your family income`,
        }),

    !e.fields?.length
      ? open('field', 'Field of study', 'Open to all fields of study')
      : check('field', 'Field of study', profile.fieldOfStudy, (f) => e.fields?.includes(f) ?? true, {
          pass: (f) => `${FIELD_LABELS[f]} is an eligible field`,
          fail: () => `Only for ${e.fields?.map((f) => FIELD_LABELS[f]).join(', ')}`,
          unknown: 'Add your field of study to check',
        }),

    !e.states?.length
      ? open('state', 'Location', 'Open to students across India')
      : check('state', 'Location', profile.state, (s) => e.states?.includes(s) ?? true, {
          pass: (s) => `Open to students from ${s}`,
          fail: () => `Only for students from ${e.states?.join(', ')}`,
          unknown: `Only for ${e.states?.join(', ')} — add your state`,
        }),

    !e.genders?.length
      ? open('gender', 'Gender', 'Open to all genders')
      : check('gender', 'Gender', profile.gender, (g) => e.genders?.includes(g) ?? true, {
          pass: () => 'You meet the gender criterion',
          fail: () => `Reserved for ${e.genders?.join(', ')} students`,
          unknown: `Reserved for ${e.genders?.join(', ')} students — add your gender`,
        }),

    !e.categories?.length
      ? open('category', 'Category', 'Open to all categories')
      : check('category', 'Category', profile.category, (c) => e.categories?.includes(c) ?? true, {
          pass: (c) => `${CATEGORY_LABELS[c]} category is eligible`,
          fail: () => `Reserved for ${e.categories?.map((c) => CATEGORY_LABELS[c]).join(', ')} students`,
          unknown: `For ${e.categories?.map((c) => CATEGORY_LABELS[c]).join(', ')} — add your category`,
        }),
  ];

  const earned = checks.reduce((sum, c) => {
    if (c.outcome === 'pass') return sum + c.weight;
    if (c.outcome === 'unknown') return sum + c.weight * UNKNOWN_CREDIT;
    return sum;
  }, 0);

  const hasFail = checks.some((c) => c.outcome === 'fail');
  const hasUnknown = checks.some((c) => c.outcome === 'unknown');
  const score = Math.round(hasFail ? earned * FAIL_PENALTY : earned);
  const verdict: MatchVerdict = hasFail ? 'ineligible' : hasUnknown ? 'likely' : 'eligible';

  return { score, verdict, checks };
}

/* ----------------------------- helpers ----------------------------- */

interface Messages<T> {
  pass: (value: T) => string;
  fail: (value: T) => string;
  unknown: string;
}

function check<T>(
  key: MatchCheck['key'],
  label: string,
  value: T | null,
  predicate: (value: T) => boolean,
  messages: Messages<T>,
): MatchCheck {
  const weight = CRITERIA_WEIGHTS[key];
  if (value === null || value === undefined) {
    return { key, label, outcome: 'unknown', detail: messages.unknown, weight };
  }
  const passed = predicate(value);
  return { key, label, outcome: passed ? 'pass' : 'fail', detail: passed ? messages.pass(value) : messages.fail(value), weight };
}

function open(key: MatchCheck['key'], label: string, detail: string): MatchCheck {
  return { key, label, outcome: 'pass', detail, weight: CRITERIA_WEIGHTS[key] };
}
