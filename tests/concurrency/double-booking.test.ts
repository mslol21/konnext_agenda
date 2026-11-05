import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHold, confirmBooking, BookingConflictError } from '../../lib/booking-engine';
import { getDayAvailability } from '../../lib/availability';
import { prisma } from '../../lib/db';

vi.mock('../../lib/availability', () => ({ getDayAvailability: vi.fn() }));

vi.mock('../../lib/db', () => {
  return {
    prisma: {
      $transaction: vi.fn(),
      service: {
        findFirst: vi.fn(),
      },
      appointmentHold: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      appointment: {
        deleteMany: vi.fn(),
      },
    },
  };
});

describe('Booking engine with a simulated exclusion constraint (not a real PostgreSQL concurrency test)', () => {
  afterEach(() => vi.useRealTimers());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    vi.mocked(getDayAvailability).mockResolvedValue({ slots: [{ startAt: '2026-11-15T14:00:00.000Z', endAt: '2026-11-15T15:00:00.000Z' }] } as any);
  });

  it('deve permitir apenas 1 reserva com sucesso e rejeitar 49 concorrentes para o mesmo slot', async () => {
    const tenantId = 'tenant-beauty-demo';
    const professionalId = 'prof-juliana-mendes';
    const serviceId = 'serv-corte-visagismo';
    const startAt = new Date('2026-11-15T14:00:00Z');
    const endAt = new Date('2026-11-15T15:00:00Z');

    // Simulação de banco de dados concorrente em memória com lock de transação serializável
    let slotIsOccupied = false;
    let successfulSessionToken: string | null = null;

    vi.mocked(prisma.service.findFirst).mockResolvedValue({
      id: serviceId,
      tenantId,
      name: 'Corte Visagista',
      price: 180.0,
      durationMinutes: 60,
      bufferMinutes: 0,
      isActive: true,
    } as any);

    // Mock atômico do $transaction simulando a restrição atômica / GiST do PostgreSQL
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      // Mock do tx interno
      const tx = {
        appointmentHold: {
          findMany: vi.fn().mockResolvedValue([]),
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation((args: any) => {
            return {
              id: `hold-${Math.random()}`,
              ...args.data,
            };
          }),
        },
        appointment: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          findMany: vi.fn().mockImplementation(() => {
            if (slotIsOccupied) {
              return [
                {
                  id: 'app-winner',
                  professionalId,
                  startAt,
                  endAt,
                  status: 'held',
                  holds: { expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
                },
              ];
            }
            return [];
          }),
          create: vi.fn().mockImplementation((args: any) => {
            if (slotIsOccupied) {
              const err: any = new Error('exclusion constraint "no_overlapping_appointments" violated');
              err.code = 'P2002';
              throw err;
            }
            slotIsOccupied = true; // Reserva o horário atomicamente
            return {
              id: `app-${Math.random()}`,
              ...args.data,
            };
          }),
        },
        customer: {
          upsert: vi.fn().mockResolvedValue({ id: 'temp-cust-1' }),
        },
      };

      return await callback(tx);
    });

    const CONCURRENT_ATTEMPTS = 50;
    const sessionTokens = Array.from({ length: CONCURRENT_ATTEMPTS }, (_, i) => `client-session-${i + 1}`);

    // Disparar 50 tentativas de reserva simultâneas via Promise.all
    const results = await Promise.allSettled(
      sessionTokens.map((sessionToken) =>
        createHold({
          tenantId,
          sessionToken,
          serviceId,
          professionalId,
          startAt,
          endAt,
          holdDurationMinutes: 5,
        })
      )
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // In this simulated DB, exactly one caller obtains the slot
    expect(fulfilled.length).toBe(1);

    // E exatamente 49 receberam erro de conflito
    expect(rejected.length).toBe(CONCURRENT_ATTEMPTS - 1);

    // Verificar se o erro lançado é especificamente BookingConflictError
    rejected.forEach((res: any) => {
      expect(res.reason).toBeInstanceOf(BookingConflictError);
      expect(res.reason.message).toContain('Este horário acabou de ser bloqueado por outro cliente');
    });
  });

  it('deve confirmar reserva atômica a partir do hold existente', async () => {
    const tenantId = 'tenant-beauty-demo';
    const professionalId = 'prof-juliana-mendes';
    const serviceId = 'serv-corte-visagismo';
    const sessionToken = 'winner-session-token';
    const startAt = new Date('2026-11-15T14:00:00Z');
    const endAt = new Date('2026-11-15T15:00:00Z');

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        customer: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'real-cust-1',
            name: 'Fernanda Lima',
            email: 'fernanda@gmail.com',
            phone: '11999998888',
          }),
          update: vi.fn().mockResolvedValue({}),
        },
        service: {
          findFirst: vi.fn().mockResolvedValue({
            id: serviceId,
            price: 180.0,
          }),
        },
        appointmentHold: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'hold-123',
            appointmentId: 'app-held-123',
            sessionToken,
            expiresAt: new Date('2026-11-05T12:05:00Z'),
            appointment: {
              id: 'app-held-123',
              tenantId,
              serviceId,
              startAt,
              endAt,
              professionalId,
              status: 'held',
            },
          }),
          delete: vi.fn().mockResolvedValue({}),
        },
        appointment: {
          update: vi.fn().mockResolvedValue({
            id: 'app-held-123',
            status: 'confirmed',
            startAt,
            endAt,
            finalPrice: 180.0,
          }),
        },
        payment: {
          create: vi.fn().mockResolvedValue({}),
        },
      };

      return await callback(tx);
    });

    const appointment = await confirmBooking({
      tenantId,
      sessionToken,
      customer: {
        name: 'Fernanda Lima',
        email: 'fernanda@gmail.com',
        phone: '11999998888',
      },
      serviceId,
      professionalId,
      startAt,
      endAt,
    });

    expect(appointment).toBeDefined();
    expect(appointment.status).toBe('confirmed');
  });
});
