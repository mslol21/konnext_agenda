import { describe, expect, it } from 'vitest';
import { getDemoSlots } from '@/lib/demo-availability';
import { initialServices, initialProfessionals } from '@/lib/mock-data';
import { getLocalDate } from '@/lib/utils';

describe('Explicit local demonstration', () => {
  const service = { ...initialServices[0], duration_minutes: 60, buffer_minutes: 15 };
  const pro = { ...initialProfessionals[0], status: 'active' as const, services: [service.id], working_days: [2],
    working_hours: { start: '09:00', end: '12:00' }, break_hours: undefined };
  const now = new Date('2026-11-10T12:15:00Z');
  it('uses São Paulo calendar date after midnight UTC', () => {
    expect(getLocalDate(new Date('2026-11-11T01:00:00Z'))).toBe('2026-11-10');
  });
  it('excludes past slots and reserves the buffer before closing', () => {
    const slots = getDemoSlots(service, pro, '2026-11-10', () => true, now);
    expect(slots.map(s => s.time)).toEqual(['09:30', '10:00', '10:30']);
    expect(slots[0].endAt).toBe('2026-11-10T13:45:00.000Z');
  });
  it('excludes nonworking days, unqualified professionals and conflicts', () => {
    expect(getDemoSlots(service, pro, '2026-11-11', () => true, now)).toEqual([]);
    expect(getDemoSlots(service, { ...pro, services: [] }, '2026-11-10', () => true, now)).toEqual([]);
    expect(getDemoSlots(service, pro, '2026-11-10', () => false, now)).toEqual([]);
  });
});
