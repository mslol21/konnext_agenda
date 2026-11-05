import { prisma } from './db';
import { AppointmentStatus } from '@prisma/client';

export interface AvailabilitySlot {
  time: string;           // "09:00" (no fuso local)
  startAt: string;        // ISO 8601 UTC
  endAt: string;          // ISO 8601 UTC
  available: boolean;
  professionalId: string;
  professionalName: string;
}

export interface DayAvailabilityResult {
  date: string;           // YYYY-MM-DD
  isDayAvailable: boolean;
  dayOfWeek: number;      // 0-6
  totalSlotsCount: number;
  availableSlotsCount: number;
  slots: AvailabilitySlot[];
  nextAvailableSuggestions?: Array<{
    date: string;
    firstSlotTime: string;
    professionalName: string;
  }>;
}

export interface AvailabilityQueryOptions {
  tenantId: string;
  serviceIds: string[];
  professionalId?: string | 'any';
  dateStr: string;        // "YYYY-MM-DD"
  slotIntervalMinutes?: number; // padrão: 30 minutos
  timezoneOffsetHours?: number; // padrão: -3 (America/Sao_Paulo UTC-3)
}

/**
 * Converte data "YYYY-MM-DD" e hora "HH:mm" no fuso especificado para um objeto Date em UTC.
 */
export function parseLocalToUtc(dateStr: string, timeStr: string, timezoneOffsetHours: number = -3): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // UTC = LocalTime - (offset) => ex: 09:00 no Brasil (-3) = 09 - (-3) = 12:00 UTC
  const utcMilliseconds = Date.UTC(year, month - 1, day, hours - timezoneOffsetHours, minutes, 0, 0);
  return new Date(utcMilliseconds);
}

/**
 * Converte Date UTC de volta para string "HH:mm" no fuso local.
 */
export function formatUtcToLocalTime(utcDate: Date, timezoneOffsetHours: number = -3): string {
  const localDate = new Date(utcDate.getTime() + timezoneOffsetHours * 60 * 60 * 1000);
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Verifica se dois intervalos [startA, endA) e [startB, endB) colidem.
 */
export function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

/**
 * Converte string "HH:mm" para minutos desde o início do dia.
 */
export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converte minutos desde o início do dia para "HH:mm".
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Motor central de cálculo de disponibilidade do Konnexy Agenda.
 */
export async function getDayAvailability(options: AvailabilityQueryOptions): Promise<DayAvailabilityResult> {
  const {
    tenantId,
    serviceIds,
    professionalId = 'any',
    dateStr,
    slotIntervalMinutes = 30,
    timezoneOffsetHours = -3,
  } = options;

  if (!tenantId || !serviceIds || serviceIds.length === 0 || !dateStr) {
    throw new Error('Parâmetros obrigatórios ausentes para cálculo de disponibilidade.');
  }

  // 1. Obter tenant e suas configurações de política de agendamento
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error(`Tenant não encontrado com ID: ${tenantId}`);
  }

  const settings = (tenant.businessSettings as Record<string, any>) || {};
  const minAdvanceMinutes = settings.minAdvanceMinutes ?? 60;
  const maxAdvanceDays = settings.maxAdvanceDays ?? 45;

  // 2. Obter os serviços solicitados para somar durações e buffers
  const services = await prisma.service.findMany({
    where: {
      tenantId,
      id: { in: serviceIds },
      isActive: true,
    },
  });

  if (services.length !== serviceIds.length) {
    throw new Error('Um ou mais serviços solicitados não foram encontrados ou estão inativos.');
  }

  const totalDurationMinutes = services.reduce(
    (acc, s) => acc + s.durationMinutes + s.bufferMinutes,
    0
  );

  // 3. Determinar o dia da semana
  const [year, month, day] = dateStr.split('-').map(Number);
  const localTargetDate = new Date(year, month - 1, day);
  const dayOfWeek = localTargetDate.getDay(); // 0 = Domingo, 1 = Segunda...

  // Validação de janela máxima de antecedência
  const now = new Date();
  const maxBookingDate = new Date(now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000);
  const targetDayStartUtc = parseLocalToUtc(dateStr, '00:00', timezoneOffsetHours);
  const targetDayEndUtc = parseLocalToUtc(dateStr, '23:59', timezoneOffsetHours);

  if (targetDayStartUtc > maxBookingDate) {
    return {
      date: dateStr,
      isDayAvailable: false,
      dayOfWeek,
      totalSlotsCount: 0,
      availableSlotsCount: 0,
      slots: [],
    };
  }

  // 4. Buscar profissionais elegíveis
  // Profissionais que prestam TODOS os serviços solicitados
  let candidateProfessionals: Array<{ id: string; name: string }>;

  if (professionalId && professionalId !== 'any') {
    const prof = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId,
        status: 'active',
        services: {
          some: {
            serviceId: { in: serviceIds },
          },
        },
      },
      select: { id: true, name: true },
    });

    if (!prof) {
      return {
        date: dateStr,
        isDayAvailable: false,
        dayOfWeek,
        totalSlotsCount: 0,
        availableSlotsCount: 0,
        slots: [],
      };
    }
    candidateProfessionals = [prof];
  } else {
    // Buscar profissionais ativos que prestam ao menos um dos serviços
    // (ou todos no caso de agendamento com mesmo profissional)
    const profs = await prisma.professional.findMany({
      where: {
        tenantId,
        status: 'active',
        services: {
          some: {
            serviceId: { in: serviceIds },
          },
        },
      },
      select: { id: true, name: true },
    });

    candidateProfessionals = profs;
  }

  if (candidateProfessionals.length === 0) {
    return {
      date: dateStr,
      isDayAvailable: false,
      dayOfWeek,
      totalSlotsCount: 0,
      availableSlotsCount: 0,
      slots: [],
    };
  }

  const profIds = candidateProfessionals.map((p) => p.id);

  // 5. Buscar Escala (WorkingHours) para o dia da semana dos profissionais
  const workingHoursList = await prisma.workingHours.findMany({
    where: {
      professionalId: { in: profIds },
      dayOfWeek,
      isWorking: true,
    },
  });

  if (workingHoursList.length === 0) {
    return {
      date: dateStr,
      isDayAvailable: false,
      dayOfWeek,
      totalSlotsCount: 0,
      availableSlotsCount: 0,
      slots: [],
    };
  }

  // 6. Buscar bloqueios (TimeOff) que intersectem o dia
  const timeOffs = await prisma.timeOff.findMany({
    where: {
      tenantId,
      OR: [
        { professionalId: { in: profIds } },
        { professionalId: null }, // Bloqueio do tenant inteiro (ex: feriado)
      ],
      startAt: { lt: targetDayEndUtc },
      endAt: { gt: targetDayStartUtc },
    },
  });

  // 7. Buscar agendamentos existentes no dia
  // Ativos: confirmed, in_progress, ou held (que não estejam expirados)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      professionalId: { in: profIds },
      status: {
        in: [AppointmentStatus.confirmed, AppointmentStatus.in_progress, AppointmentStatus.held],
      },
      startAt: { lt: targetDayEndUtc },
      endAt: { gt: targetDayStartUtc },
    },
    include: {
      holds: true,
    },
  });

  // Filtrar holds expirados
  const activeAppointments = existingAppointments.filter((app) => {
    if (app.status === AppointmentStatus.held) {
      if (app.holds && app.holds.expiresAt <= now) {
        return false; // Hold expirado, não bloqueia
      }
    }
    return true;
  });

  // 8. Gerar e testar slots por profissional
  const slotsMap = new Map<string, AvailabilitySlot>();
  const minAllowedStartTime = new Date(now.getTime() + minAdvanceMinutes * 60 * 1000);

  for (const prof of candidateProfessionals) {
    const schedule = workingHoursList.find((wh) => wh.professionalId === prof.id);
    if (!schedule) continue;

    const startMinute = timeStringToMinutes(schedule.startTime);
    const endMinute = timeStringToMinutes(schedule.endTime);
    const breakStartMinute = schedule.breakStart ? timeStringToMinutes(schedule.breakStart) : null;
    const breakEndMinute = schedule.breakEnd ? timeStringToMinutes(schedule.breakEnd) : null;

    // Iterar ao longo do expediente
    for (
      let currentMinute = startMinute;
      currentMinute + totalDurationMinutes <= endMinute;
      currentMinute += slotIntervalMinutes
    ) {
      const slotEndMinute = currentMinute + totalDurationMinutes;

      // Não pode invadir o horário de almoço
      if (breakStartMinute !== null && breakEndMinute !== null) {
        const slotOverlapsBreak =
          currentMinute < breakEndMinute && slotEndMinute > breakStartMinute;
        if (slotOverlapsBreak) {
          continue;
        }
      }

      const slotTimeStr = minutesToTimeString(currentMinute);
      const slotStartUtc = parseLocalToUtc(dateStr, slotTimeStr, timezoneOffsetHours);
      const slotEndUtc = new Date(slotStartUtc.getTime() + totalDurationMinutes * 60 * 1000);

      // Regra de antecedência mínima
      if (slotStartUtc < minAllowedStartTime) {
        continue;
      }

      // Checar se bate com TimeOff
      const hasTimeOff = timeOffs.some((to) => {
        const matchesProf = !to.professionalId || to.professionalId === prof.id;
        return matchesProf && isOverlapping(slotStartUtc, slotEndUtc, to.startAt, to.endAt);
      });

      if (hasTimeOff) {
        continue;
      }

      // Checar se bate com Appointment ativo
      const hasConflict = activeAppointments.some((app) => {
        return (
          app.professionalId === prof.id &&
          isOverlapping(slotStartUtc, slotEndUtc, app.startAt, app.endAt)
        );
      });

      if (hasConflict) {
        continue;
      }

      // Slot livre! Se já existir para outro profissional, mantemos a melhor opção ou registramos
      if (!slotsMap.has(slotTimeStr)) {
        slotsMap.set(slotTimeStr, {
          time: slotTimeStr,
          startAt: slotStartUtc.toISOString(),
          endAt: slotEndUtc.toISOString(),
          available: true,
          professionalId: prof.id,
          professionalName: prof.name,
        });
      }
    }
  }

  // Ordenar slots por horário crescente
  const slots = Array.from(slotsMap.values()).sort(
    (a, b) => timeStringToMinutes(a.time) - timeStringToMinutes(b.time)
  );

  const availableCount = slots.filter((s) => s.available).length;

  return {
    date: dateStr,
    isDayAvailable: availableCount > 0,
    dayOfWeek,
    totalSlotsCount: slots.length,
    availableSlotsCount: availableCount,
    slots,
  };
}

/**
 * Busca sugestões de próximos dias livres quando a data solicitada estiver sem horários.
 */
export async function getNextAvailableSuggestions(
  options: AvailabilityQueryOptions,
  maxSearchDays = 7,
  maxSuggestions = 3
): Promise<Array<{ date: string; firstSlotTime: string; professionalName: string }>> {
  const suggestions: Array<{ date: string; firstSlotTime: string; professionalName: string }> = [];

  const [year, month, day] = options.dateStr.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);

  for (let i = 1; i <= maxSearchDays; i++) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + i);

    const nextDateStr = nextDate.toISOString().split('T')[0];
    const dayResult = await getDayAvailability({
      ...options,
      dateStr: nextDateStr,
    });

    if (dayResult.isDayAvailable && dayResult.slots.length > 0) {
      const firstSlot = dayResult.slots[0];
      suggestions.push({
        date: nextDateStr,
        firstSlotTime: firstSlot.time,
        professionalName: firstSlot.professionalName,
      });

      if (suggestions.length >= maxSuggestions) {
        break;
      }
    }
  }

  return suggestions;
}
