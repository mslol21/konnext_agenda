import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createHold, confirmBooking, BookingValidationError } from '@/lib/booking-engine';
import { getDayAvailability } from '@/lib/availability';
import { prisma } from '@/lib/db';
import { bookingRequestSchema, confirmationRequestSchema } from '@/lib/booking-validation';

vi.mock('@/lib/db', () => ({ prisma: { $transaction: vi.fn(), service: { findFirst: vi.fn() } } }));
vi.mock('@/lib/availability', () => ({ getDayAvailability: vi.fn() }));
const params = {
  tenantId: 'tenant-a', sessionToken: 'unguessable-session-token-123', serviceId: 'service-a', professionalId: 'pro-a',
  startAt: '2026-11-10T12:00:00.000Z', endAt: '2026-11-10T13:00:00.000Z',
};
const customer = { name: 'Cliente Teste', phone: '11999999999', email: 'teste@example.com' };

describe('Booking validation regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    vi.mocked(getDayAvailability).mockResolvedValue({ slots: [{ startAt: params.startAt, endAt: params.endAt }] } as any);
  });
  afterEach(() => vi.useRealTimers());

  it.each(['invalid', '2026-10-01T12:00:00Z'])('rejects invalid/past start %s before touching the database', async startAt => {
    await expect(createHold({ ...params, startAt })).rejects.toBeInstanceOf(BookingValidationError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('rejects a slot outside schedule or with tampered duration', async () => {
    vi.mocked(getDayAvailability).mockResolvedValue({ slots: [] } as any);
    await expect(confirmBooking({ ...params, customer })).rejects.toBeInstanceOf(BookingValidationError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('rejects a hold longer than five minutes', async () => {
    await expect(createHold({ ...params, holdDurationMinutes: 100 })).rejects.toBeInstanceOf(BookingValidationError);
  });
  it.each(['expired', 'different-service', 'different-time', 'missing'])('rejects %s hold without confirming an appointment', async scenario => {
    const tx = {
      customer: { findFirst: vi.fn().mockResolvedValue({ id: 'customer-1' }), update: vi.fn().mockResolvedValue({ id: 'customer-1' }) },
      service: { findFirst: vi.fn().mockResolvedValue({ id: params.serviceId, price: 100 }) },
      appointmentHold: { findFirst: vi.fn().mockResolvedValue(scenario === 'missing' ? null : {
        id: 'hold-a', appointmentId: 'appointment-a',
        expiresAt: new Date(scenario === 'expired' ? '2026-11-05T11:59:00Z' : '2026-11-05T12:05:00Z'),
        appointment: { serviceId: scenario === 'different-service' ? 'service-b' : params.serviceId,
          startAt: new Date(scenario === 'different-time' ? '2026-11-10T12:30:00Z' : params.startAt), endAt: new Date(params.endAt) },
      }), delete: vi.fn() },
      appointment: { update: vi.fn() },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(tx));
    await expect(confirmBooking({ ...params, customer })).rejects.toBeInstanceOf(BookingValidationError);
    expect(tx.appointment.update).not.toHaveBeenCalled();
    expect(tx.appointmentHold.delete).not.toHaveBeenCalled();
    expect(tx.appointmentHold.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ appointment: expect.objectContaining({ tenantId: params.tenantId }) }) }));
  });
  it('requires strong session tokens and validates customer contact data', () => {
    expect(bookingRequestSchema.safeParse({ ...params, sessionToken: 'x' }).success).toBe(false);
    expect(confirmationRequestSchema.safeParse({ ...params, customer: { ...customer, email: 'invalid' } }).success).toBe(false);
    expect(confirmationRequestSchema.safeParse({ ...params, customer: { ...customer, phone: '123' } }).success).toBe(false);
    expect(confirmationRequestSchema.safeParse({ ...params, customer }).success).toBe(true);
  });
});
