import type { Scholarship } from '../../types/scholarship';

/**
 * Generates an iCalendar (.ics) file so students can add scholarship deadlines
 * to Google Calendar, Outlook or Apple Calendar with a single click.
 * Each event is an all-day event with reminders 7 days and 1 day before.
 */
export function generateIcs(scholarships: Scholarship[], now: Date = new Date()): string {
  const stamp = toIcsDateTime(now);
  const events = scholarships.map((s) => {
    const date = s.deadline.replace(/-/g, '');
    return [
      'BEGIN:VEVENT',
      `UID:${s.id}@grantly.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${nextDay(s.deadline)}`,
      `SUMMARY:${escapeText(`Scholarship deadline: ${s.title}`)}`,
      `DESCRIPTION:${escapeText(`${s.provider} — ${s.summary}\\nApply: ${s.officialUrl}`)}`,
      `URL:${s.officialUrl}`,
      alarm('-P7D', `7 days left: ${s.title}`),
      alarm('-P1D', `Tomorrow: ${s.title}`),
      'END:VEVENT',
    ].join('\r\n');
  });

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grantly//Scholarship Deadlines//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join(
    '\r\n',
  );
}

/** Triggers a browser download of the generated calendar file. */
export function downloadIcs(scholarships: Scholarship[], filename = 'grantly-scholarship-deadlines.ics'): void {
  const blob = new Blob([generateIcs(scholarships)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function alarm(trigger: string, description: string): string {
  return ['BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${trigger}`, `DESCRIPTION:${escapeText(description)}`, 'END:VALARM'].join('\r\n');
}

function escapeText(text: string): string {
  return text.replace(/[,;]/g, (m) => `\\${m}`);
}

function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10).replace(/-/g, '');
}

function toIcsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

