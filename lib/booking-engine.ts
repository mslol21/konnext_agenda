import { prisma } from './db';
import { AppointmentStatus, PaymentStatus, TransactionStatus, Prisma } from '@prisma/client';
import { getDayAvailability } from './availability';

export class BookingConflictError extends Error {
  code = 'BOOKING_CONFLICT';
  constructor(message = 'O horário selecionado acabou de ser reservado por outro cliente.') {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export class BookingValidationError extends Error {
  code = 'BOOKING_VALIDATION';
  constructor(message: string) {
    super(message);
    this.name = 'BookingValidationError';
  }
}

export interface CreateHoldParams {
  tenantId: string;
  sessionToken: string;
  serviceId: string;
  professionalId: string;
  startAt: Date | string;
  endAt: Date | string;
  holdDurationMinutes?: number;
}

export interface ConfirmBookingParams {
  tenantId: string;
  sessionToken?: string;
  holdId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  serviceId: string;
  professionalId: string;
  startAt: Date | string;
  endAt: Date | string;
  price?: number;
  discount?: number;
  notes?: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'cash';
  paymentStatus?: PaymentStatus;
}

/** Validate the same catalog, schedule, buffers and policy used to display slots. */
async function validateSlot(params: CreateHoldParams | ConfirmBookingParams) {
  const startAt = new Date(params.startAt);
  const endAt = new Date(params.endAt);
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || startAt <= new Date() || endAt <= startAt) {
    throw new BookingValidationError('Intervalo de agendamento inválido ou no passado.');
  }
  const localDate = new Date(startAt.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const availability = await getDayAvailability({
    tenantId: params.tenantId,
    serviceIds: [params.serviceId],
    professionalId: params.professionalId,
    dateStr: localDate,
    excludeSessionToken: params.sessionToken,
  });
  if (!availability.slots.some(slot => slot.startAt === startAt.toISOString() && slot.endAt === endAt.toISOString())) {
    throw new BookingValidationError('Horário indisponível: verifique expediente, duração e antecedência.');
  }
}

/**
 * Cria ou renova um Hold de 5 minutos para prender a vaga enquanto o cliente digita seus dados.
 */
export async function createHold(params: CreateHoldParams) {
  const {
    tenantId,
    sessionToken,
    serviceId,
    professionalId,
    holdDurationMinutes = 5,
  } = params;

  const startAt = new Date(params.startAt);
  const endAt = new Date(params.endAt);
  const now = new Date();
  if (!Number.isInteger(holdDurationMinutes) || holdDurationMinutes < 1 || holdDurationMinutes > 5) {
    throw new BookingValidationError('A reserva temporária deve durar entre 1 e 5 minutos.');
  }
  await validateSlot(params);
  const expiresAt = new Date(now.getTime() + holdDurationMinutes * 60 * 1000);

  if (startAt <= now) {
    throw new BookingValidationError('Não é possível reservar um horário no passado.');
  }

  if (endAt <= startAt) {
    throw new BookingValidationError('Horário de término deve ser posterior ao horário de início.');
  }

  // Obter serviço para registrar preço base
  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId, isActive: true },
  });

  if (!service) {
    throw new BookingValidationError('Serviço não encontrado para este tenant.');
  }

  // Executar de forma atômica
  return await prisma.$transaction(async (tx) => {
    // 1. Limpar holds expirados desse profissional para não falsamente bloquear o horário
    await tx.appointment.deleteMany({
      where: { tenantId, professionalId, status: AppointmentStatus.held,
        OR: [{ holds: { is: { expiresAt: { lte: now } } } }, { holds: { is: null } }] },
    });

    // 2. Verificar se este mesmo sessionToken já tem um hold ativo
    const existingSessionHold = await tx.appointmentHold.findFirst({
      where: {
        sessionToken,
        appointment: { tenantId, status: AppointmentStatus.held },
        expiresAt: { gt: now },
      },
      include: { appointment: true },
    });

    if (existingSessionHold) {
      // Se for para o mesmo profissional e horário, apenas renovamos a expiração
      if (
        existingSessionHold.appointment.serviceId === serviceId &&
        existingSessionHold.appointment.professionalId === professionalId &&
        existingSessionHold.appointment.startAt.getTime() === startAt.getTime() &&
        existingSessionHold.appointment.endAt.getTime() === endAt.getTime()
      ) {
        return await tx.appointmentHold.update({
          where: { id: existingSessionHold.id },
          data: { expiresAt },
          include: { appointment: true },
        });
      } else {
        // Se mudou de horário ou profissional, remove o hold anterior desta sessão
        await tx.appointmentHold.delete({ where: { id: existingSessionHold.id } });
        await tx.appointment.delete({
          where: { id: existingSessionHold.appointmentId, status: AppointmentStatus.held },
        });
      }
    }

    // 3. Buscar agendamentos existentes que possam colidir com este horário
    const conflictingAppointments = await tx.appointment.findMany({
      where: {
        tenantId,
        professionalId,
        status: { in: [AppointmentStatus.confirmed, AppointmentStatus.in_progress, AppointmentStatus.held] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      include: { holds: true },
    });

    const activeConflicts = conflictingAppointments.filter((app) => {
      if (app.status === AppointmentStatus.held) {
        return app.holds && app.holds.expiresAt > now;
      }
      return true;
    });

    if (activeConflicts.length > 0) {
      throw new BookingConflictError(
        'Este horário acabou de ser bloqueado por outro cliente. Por favor, escolha outro horário.'
      );
    }

    // A single placeholder per tenant prevents unique-phone collisions between concurrent checkouts.
    const customer = await tx.customer.upsert({
      where: { tenantId_email: { tenantId, email: 'checkout@konnexy.internal' } },
      update: {},
      create: { tenantId, name: 'Reserva em Andamento', email: 'checkout@konnexy.internal', phone: 'hold-checkout' },
    });

    // 5. Criar Appointment com status 'held'
    let newAppointment;
    try {
      newAppointment = await tx.appointment.create({
        data: {
          tenantId,
          customerId: customer.id,
          professionalId,
          serviceId,
          startAt,
          endAt,
          status: AppointmentStatus.held,
          price: service.price,
          discount: 0,
          finalPrice: service.price,
        },
      });
    } catch (err: any) {
      // Captura colisão disparada pela constraint GiST no Postgres ou conflito único
      if (err.code === 'P2002' || err.code === 'P2034' || err.message?.includes('overlapping') || err.message?.includes('exclusion')) {
        throw new BookingConflictError('Este horário acabou de ser bloqueado por outro cliente. Por favor, escolha outro horário.');
      }
      throw err;
    }

    // 6. Criar AppointmentHold
    const hold = await tx.appointmentHold.create({
      data: {
        appointmentId: newAppointment.id,
        sessionToken,
        expiresAt,
      },
      include: {
        appointment: true,
      },
    });

    return hold;
  });
}

/**
 * Converte o Hold em agendamento confirmado (ou realiza o agendamento direto) de forma atômica.
 */
export async function confirmBooking(params: ConfirmBookingParams) {
  const {
    tenantId,
    sessionToken,
    customer: custData,
    serviceId,
    professionalId,
    notes,
    paymentMethod,
    paymentStatus = PaymentStatus.pending,
  } = params;

  const startAt = new Date(params.startAt);
  const endAt = new Date(params.endAt);
  const now = new Date();

  await validateSlot(params);
  return await prisma.$transaction(async (tx) => {
    // 1. Upsert do Customer real do negócio pelo e-mail ou telefone
    let customer = await tx.customer.findFirst({
      where: {
        tenantId,
        OR: [{ email: custData.email.trim().toLowerCase() }, { phone: custData.phone.trim() }],
      },
    });

    if (customer) {
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          name: custData.name.trim(),
          phone: custData.phone.trim(),
          email: custData.email.trim().toLowerCase(),
          notes: custData.notes ? `${customer.notes ?? ''}\n${custData.notes}`.trim() : customer.notes,
        },
      });
    } else {
      customer = await tx.customer.create({
        data: {
          tenantId,
          name: custData.name.trim(),
          email: custData.email.trim().toLowerCase(),
          phone: custData.phone.trim(),
          notes: custData.notes,
        },
      });
    }

    const service = await tx.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
    });

    if (!service) {
      throw new BookingValidationError('Serviço não encontrado.');
    }

    const finalPrice = Number(service.price);
    const discount = 0; // Public bookings always use the authoritative catalog price.

    // 2. Se temos uma sessão com hold ativo
    let existingHold = null;
    if (sessionToken) {
      existingHold = await tx.appointmentHold.findFirst({
        where: {
          sessionToken,
          appointment: {
            tenantId,
            professionalId,
            status: AppointmentStatus.held,
          },
        },
        include: { appointment: true },
      });
    }

    if (sessionToken && !existingHold) {
      throw new BookingValidationError('Reserva temporária não encontrada. Selecione o horário novamente.');
    }
    if (existingHold) {
      if (existingHold.expiresAt <= now ||
          existingHold.appointment.serviceId !== serviceId ||
          existingHold.appointment.startAt.getTime() !== startAt.getTime() ||
          existingHold.appointment.endAt.getTime() !== endAt.getTime()) {
        throw new BookingValidationError('Reserva expirada ou diferente do horário selecionado.');
      }
      // Remover o hold e atualizar o appointment existente para CONFIRMED
      await tx.appointmentHold.delete({ where: { id: existingHold.id } });

      const confirmedAppointment = await tx.appointment.update({
        where: { id: existingHold.appointmentId },
        data: {
          customerId: customer.id,
          status: AppointmentStatus.confirmed,
          paymentStatus,
          price: finalPrice,
          discount,
          finalPrice: finalPrice - discount,
          notes,
          startAt,
          endAt,
        },
        include: {
          customer: true,
          professional: true,
          service: true,
        },
      });

      // Se houver pagamento vinculado, registrar
      if (paymentMethod) {
        const txStatus = paymentStatus === PaymentStatus.fully_paid
          ? TransactionStatus.paid
          : paymentStatus === PaymentStatus.refunded
          ? TransactionStatus.refunded
          : TransactionStatus.pending;

        await tx.payment.create({
          data: {
            tenantId,
            appointmentId: confirmedAppointment.id,
            amount: confirmedAppointment.finalPrice,
            method: paymentMethod,
            status: txStatus,
          },
        });
      }


      return confirmedAppointment;
    }

    await tx.appointment.deleteMany({
      where: { tenantId, professionalId, status: AppointmentStatus.held,
        OR: [{ holds: { is: { expiresAt: { lte: now } } } }, { holds: { is: null } }] },
    });
    // 3. Caso não venha de um hold (ex: agendamento direto via recepção/admin)
    // Verificar colisão
    const conflicts = await tx.appointment.findMany({
      where: {
        tenantId,
        professionalId,
        status: { in: [AppointmentStatus.confirmed, AppointmentStatus.in_progress, AppointmentStatus.held] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      include: { holds: true },
    });

    const activeConflicts = conflicts.filter((app) => {
      if (app.status === AppointmentStatus.held) {
        return app.holds && app.holds.expiresAt > now;
      }
      return true;
    });

    if (activeConflicts.length > 0) {
      throw new BookingConflictError(
        'Este horário já está ocupado por outro atendimento. Por favor, escolha outro horário.'
      );
    }

    // 4. Criar Appointment com status CONFIRMED
    let appointment;
    try {
      appointment = await tx.appointment.create({
        data: {
          tenantId,
          customerId: customer.id,
          professionalId,
          serviceId,
          startAt,
          endAt,
          status: AppointmentStatus.confirmed,
          paymentStatus,
          price: finalPrice,
          discount,
          finalPrice: finalPrice - discount,
          notes,
        },
        include: {
          customer: true,
          professional: true,
          service: true,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002' || err.code === 'P2034' || err.message?.includes('overlapping') || err.message?.includes('exclusion')) {
        throw new BookingConflictError('Este horário já foi ocupado por outro atendimento. Por favor, escolha outro horário.');
      }
      throw err;
    }

    if (paymentMethod) {
      const txStatus = paymentStatus === PaymentStatus.fully_paid
        ? TransactionStatus.paid
        : paymentStatus === PaymentStatus.refunded
        ? TransactionStatus.refunded
        : TransactionStatus.pending;

      await tx.payment.create({
        data: {
          tenantId,
          appointmentId: appointment.id,
          amount: appointment.finalPrice,
          method: paymentMethod,
          status: txStatus,
        },
      });
    }


    return appointment;
  });
}

/**
 * Libera um hold imediatamente caso o usuário desista ou feche o modal de agendamento.
 */
export async function cancelHold(sessionToken: string) {
  return prisma.$transaction(async tx => {
    // Deleting the appointment cascades its hold; scope status in the same statement.
    const result = await tx.appointment.deleteMany({
      where: { status: AppointmentStatus.held, holds: { is: { sessionToken } } },
    });
    return result.count > 0;
  });
}

export async function cleanupExpiredHolds(): Promise<number> {
  const result = await prisma.appointment.deleteMany({
    where: { status: AppointmentStatus.held, holds: { is: { expiresAt: { lte: new Date() } } } },
  });
  return result.count;
}
