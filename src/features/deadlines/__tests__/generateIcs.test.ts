import { describe, expect, it } from 'vitest';
import { generateIcs } from '@/features/deadlines/generateIcs';
import { SCHOLARSHIPS } from '@/data/scholarships';

describe('generateIcs', () => {
  it('creates a valid VCALENDAR with VEVENT and VALARM blocks', () => {
    const sample = SCHOLARSHIPS.slice(0, 2);
    const ics = generateIcs(sample, new Date('2026-11-07T00:00:00Z'));
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain(`UID:${sample[0].id}@grantly.app`);
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('TRIGGER:-P1D');
    expect(ics).toContain('END:VCALENDAR');
  });
});

