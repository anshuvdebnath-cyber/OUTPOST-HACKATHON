import { getScholarshipById, SCHOLARSHIPS } from '../data/scholarships';
import { computeMatch } from '../features/eligibility/matchEngine';
import { STATUS_META } from '../lib/constants';
import { daysUntil } from '../lib/date';
import { applicationProgress } from '../store/useApplicationStore';
import type { Application, Scholarship, StudentProfile } from '../types/scholarship';

export interface PortfolioAnalytics {
  totalScholarships: number;
  eligibleCount: number;
  likelyCount: number;
  eligiblePoolINR: number;
  trackedCount: number;
  trackedPoolINR: number;
  awardedCount: number;
  awardedPoolINR: number;
  averageMatchScore: number;
  closingSoonCount: number;
  averageChecklistCompletion: number;
}

/**
 * Computes comprehensive scholarship & application portfolio metrics for a student profile.
 */
export function computePortfolioAnalytics(
  scholarships: Scholarship[],
  applications: Application[],
  profile: StudentProfile,
): PortfolioAnalytics {
  let eligibleCount = 0;
  let likelyCount = 0;
  let eligiblePoolINR = 0;
  let totalScore = 0;
  let closingSoonCount = 0;

  for (const s of scholarships) {
    const match = computeMatch(profile, s);
    totalScore += match.score;
    if (match.verdict === 'eligible') {
      eligibleCount += 1;
      eligiblePoolINR += s.amount;
    } else if (match.verdict === 'likely') {
      likelyCount += 1;
      eligiblePoolINR += s.amount;
    }
    const remaining = daysUntil(s.deadline);
    if (remaining >= 0 && remaining <= 14) {
      closingSoonCount += 1;
    }
  }

  let trackedPoolINR = 0;
  let awardedCount = 0;
  let awardedPoolINR = 0;
  let totalProgress = 0;

  for (const app of applications) {
    const s = getScholarshipById(app.scholarshipId);
    totalProgress += applicationProgress(app);
    if (!s) continue;
    if (app.status !== 'rejected') {
      trackedPoolINR += s.amount;
    }
    if (app.status === 'awarded') {
      awardedCount += 1;
      awardedPoolINR += s.amount;
    }
  }

  return {
    totalScholarships: scholarships.length,
    eligibleCount,
    likelyCount,
    eligiblePoolINR,
    trackedCount: applications.length,
    trackedPoolINR,
    awardedCount,
    awardedPoolINR,
    averageMatchScore: scholarships.length > 0 ? Math.round(totalScore / scholarships.length) : 0,
    closingSoonCount,
    averageChecklistCompletion:
      applications.length > 0 ? Math.round(totalProgress / applications.length) : 0,
  };
}

/**
 * Serializes tracked scholarship applications into an RFC 4180 CSV string for spreadsheet export.
 */
export function serializeApplicationsToCsv(applications: Application[]): string {
  const headers = [
    'Scholarship ID',
    'Title',
    'Provider',
    'Award (INR)',
    'Frequency',
    'Deadline',
    'Status',
    'Progress (%)',
    'Notes',
  ];

  const escapeCsvCell = (value: string | number): string => {
    const raw = String(value ?? '');
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const rows = applications.map((app) => {
    const s = getScholarshipById(app.scholarshipId) ?? SCHOLARSHIPS.find((x) => x.id === app.scholarshipId);
    const progress = applicationProgress(app);
    return [
      app.scholarshipId,
      s?.title ?? app.scholarshipId,
      s?.provider ?? 'Unknown',
      s?.amount ?? 0,
      s?.frequency ?? 'one-time',
      s?.deadline ?? '',
      STATUS_META[app.status]?.label ?? app.status,
      progress,
      app.notes ?? '',
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the student's tracked applications as a `.csv` file.
 */
export function downloadApplicationsCsv(applications: Application[], filename = 'grantly-applications.csv'): void {
  const csv = serializeApplicationsToCsv(applications);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
