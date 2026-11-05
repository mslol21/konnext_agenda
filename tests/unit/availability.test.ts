import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseLocalToUtc,
  formatUtcToLocalTime,
  isOverlapping,
  timeStringToMinutes,
  minutesToTimeString,
  getDayAvailability,
  getNextAvailableSuggestions,
} from '../../lib/availability';
import { prisma } from '../../lib/db';

vi.mock('../../lib/db', () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
    },
    professional: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    workingHours: {
      findMany: vi.fn(),
    },
    timeOff: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
  },
}));

describe('Motor de Disponibilidade - Funções Auxiliares', () => {
  it('deve converter corretamente horário local (UTC-3) para UTC', () => {
    // 09:00 em SP (-3) deve ser 12:00 UTC
    const utcDate = parseLocalToUtc('2026-11-10', '09:00', -3);
    expect(utcDate.toISOString()).toBe('2026-11-10T12:00:00.000Z');
  });

  it('deve formatar corretamente data UTC para string de hora local', () => {
    const utcDate = new Date('2026-11-10T12:00:00.000Z');
    const localTime = formatUtcToLocalTime(utcDate, -3);
    expect(localTime).toBe('09:00');
  });

  it('deve converter minutos e strings de hora bidirecionalmente', () => {
    expect(timeStringToMinutes('09:30')).toBe(570);
    expect(minutesToTimeString(570)).toBe('09:30');
    expect(timeStringToMinutes('18:45')).toBe(1125);
    expect(minutesToTimeString(1125)).toBe('18:45');
  });

  it('deve detectar sobreposição de intervalos de horários', () => {
    const t0900 = new Date('2026-11-10T12:00:00Z');
    const t1000 = new Date('2026-11-10T13:00:00Z');
    const t0930 = new Date('2026-11-10T12:30:00Z');
    const t1030 = new Date('2026-11-10T13:30:00Z');
    const t1100 = new Date('2026-11-10T14:00:00Z');

    // 09:00-10:00 colide com 09:30-10:30
    expect(isOverlapping(t0900, t1000, t0930, t1030)).toBe(true);

    // 09:00-10:00 NÃO colide com 10:00-11:00 (contíguo, fim do primeiro é início do segundo)
    expect(isOverlapping(t0900, t1000, t1000, t1100)).toBe(false);

    // 10:30-11:00 NÃO colide com 09:00-10:00
    expect(isOverlapping(t1030, t1100, t0900, t1000)).toBe(false);
  });
});

describe('Motor de Disponibilidade - Cálculo de Slots do Dia', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.tenant.findUnique).mockResolvedValue({
      id: 'tenant-1',
      name: 'Konnexy Beauty Studio',
      minAdvanceMinutes: 0, // Para permitir testes com qualquer horário futuro
      maxAdvanceDays: 60,
    } as any);

    vi.mocked(prisma.service.findMany).mockResolvedValue([
      {
        id: 'serv-corte',
        tenantId: 'tenant-1',
        name: 'Corte Visagista',
        durationMinutes: 45,
        bufferMinutes: 15, // Duração total = 60 minutos
        isActive: true,
      },
    ] as any);

    vi.mocked(prisma.professional.findMany).mockResolvedValue([
      { id: 'prof-juliana', name: 'Juliana Mendes' },
    ] as any);

    // 2026-11-10 é uma terça-feira (dayOfWeek = 2)
    // Horário: 09:00 às 18:00, Almoço: 12:00 às 13:00
    vi.mocked(prisma.workingHours.findMany).mockResolvedValue([
      {
        id: 'wh-1',
        professionalId: 'prof-juliana',
        dayOfWeek: 2,
        isWorking: true,
        startTime: '09:00',
        endTime: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
      },
    ] as any);

    vi.mocked(prisma.timeOff.findMany).mockResolvedValue([]);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
  });

  it('deve gerar slots respeitando expediente e excluindo horário de almoço', async () => {
    const result = await getDayAvailability({
      tenantId: 'tenant-1',
      serviceIds: ['serv-corte'],
      dateStr: '2026-11-10',
      slotIntervalMinutes: 60,
    });

    expect(result.isDayAvailable).toBe(true);
    expect(result.slots.length).toBeGreaterThan(0);

    const slotTimes = result.slots.map((s) => s.time);

    // Turno da manhã: 09:00, 10:00, 11:00 (termina às 12:00)
    expect(slotTimes).toContain('09:00');
    expect(slotTimes).toContain('10:00');
    expect(slotTimes).toContain('11:00');

    // Almoço das 12:00 às 13:00 -> NÃO pode haver slot às 12:00
    expect(slotTimes).not.toContain('12:00');

    // Turno da tarde: 13:00, 14:00, 15:00, 16:00, 17:00 (termina às 18:00)
    expect(slotTimes).toContain('13:00');
    expect(slotTimes).toContain('17:00');
    // 18:00 não pode porque o serviço leva 60min e passaria do fim do expediente
    expect(slotTimes).not.toContain('18:00');
  });

  it('deve remover slot que conflita com agendamento confirmado existente', async () => {
    // Simular que Juliana tem agendamento das 10:00 às 11:00 (13:00 às 14:00 UTC)
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: 'app-existente',
        tenantId: 'tenant-1',
        professionalId: 'prof-juliana',
        startAt: new Date('2026-11-10T13:00:00Z'), // 10:00 SP
        endAt: new Date('2026-11-10T14:00:00Z'),   // 11:00 SP
        status: 'confirmed',
        holds: null,
      },
    ] as any);

    const result = await getDayAvailability({
      tenantId: 'tenant-1',
      serviceIds: ['serv-corte'],
      dateStr: '2026-11-10',
      slotIntervalMinutes: 60,
    });

    const slotTimes = result.slots.map((s) => s.time);
    expect(slotTimes).toContain('09:00');
    expect(slotTimes).not.toContain('10:00'); // Ocupado pelo agendamento!
    expect(slotTimes).toContain('11:00');
  });

  it('deve respeitar bloqueio (TimeOff) do profissional', async () => {
    // Folga ou médico das 14:00 às 16:00 (17:00 às 19:00 UTC)
    vi.mocked(prisma.timeOff.findMany).mockResolvedValue([
      {
        id: 'to-1',
        tenantId: 'tenant-1',
        professionalId: 'prof-juliana',
        startAt: new Date('2026-11-10T17:00:00Z'), // 14:00 SP
        endAt: new Date('2026-11-10T19:00:00Z'),   // 16:00 SP
        reason: 'Consulta médica',
      },
    ] as any);

    const result = await getDayAvailability({
      tenantId: 'tenant-1',
      serviceIds: ['serv-corte'],
      dateStr: '2026-11-10',
      slotIntervalMinutes: 60,
    });

    const slotTimes = result.slots.map((s) => s.time);
    expect(slotTimes).toContain('13:00');
    expect(slotTimes).not.toContain('14:00'); // Bloqueado por TimeOff
    expect(slotTimes).not.toContain('15:00'); // Bloqueado por TimeOff
    expect(slotTimes).toContain('16:00');
  });

  it('deve retornar isDayAvailable: false se o profissional não trabalhar no dia', async () => {
    vi.mocked(prisma.workingHours.findMany).mockResolvedValue([]);

    const result = await getDayAvailability({
      tenantId: 'tenant-1',
      serviceIds: ['serv-corte'],
      dateStr: '2026-11-10',
    });

    expect(result.isDayAvailable).toBe(false);
    expect(result.slots.length).toBe(0);
  });
});
