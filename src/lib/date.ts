import { differenceInCalendarDays, format, parseISO } from 'date-fns';

/** Returns an ISO date (YYYY-MM-DD) that is `days` after `from`. */
export function addDaysISO(from: Date, days: number): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return format(d, 'yyyy-MM-dd');
}

/** Whole calendar days from `today` until the ISO `deadline` (negative if passed). */
export function daysUntil(deadline: string, today: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(deadline), today);
}

export type Urgency = 'closed' | 'critical' | 'soon' | 'upcoming' | 'later';

/** Classifies a deadline into an urgency bucket used for colour-coding. */
export function getUrgency(deadline: string, today: Date = new Date()): Urgency {
  const d = daysUntil(deadline, today);
  if (d < 0) return 'closed';
  if (d <= 3) return 'critical';
  if (d <= 10) return 'soon';
  if (d <= 30) return 'upcoming';
  return 'later';
}

/** Friendly countdown label, e.g. "Due today", "3 days left", "Closed". */
export function formatCountdown(deadline: string, today: Date = new Date()): string {
  const d = daysUntil(deadline, today);
  if (d < 0) return 'Closed';
  if (d === 0) return 'Due today';
  if (d === 1) return '1 day left';
  return `${d} days left`;
}

/** Formats an ISO date for display, e.g. "14 Nov 2026". */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy');
}

