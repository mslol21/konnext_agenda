import type { Professional, Service } from '@/types';
import { getLocalDate } from './utils';

/** Local demonstration only; never used as a fallback after a real API failure. */
export function getDemoSlots(service: Service, professional: Professional, date: string,
  isAvailable: (start: string, end: string) => boolean, now = new Date()) {
  if (!professional.working_days.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) ||
      professional.status !== 'active' || !professional.services.includes(service.id) || date < getLocalDate(now)) return [];
  const minutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const time = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  const duration = service.duration_minutes + (service.buffer_minutes || 0);
  if (duration <= 0) return [];
  const slots = [];
  for (let start = minutes(professional.working_hours.start); start + duration <= minutes(professional.working_hours.end); start += 30) {
    const end = start + duration;
    if (professional.break_hours && start < minutes(professional.break_hours.end) && end > minutes(professional.break_hours.start)) continue;
    const startAt = new Date(`${date}T${time(start)}:00-03:00`);
    if (startAt <= now || !isAvailable(time(start), time(end))) continue;
    slots.push({ time: time(start), startAt: startAt.toISOString(), endAt: new Date(startAt.getTime() + duration * 60000).toISOString() });
  }
  return slots;
}
