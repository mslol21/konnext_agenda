import { prisma } from './db';
import { AppointmentStatus, PaymentStatus, TransactionStatus, Prisma } from '@prisma/client';
import { isOverlapping } from './availability';

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
  const expiresAt = new Date(now.getTime() + holdDurationMinutes * 60 * 1000);

  if (startAt <= now) {
    throw new BookingValidationError('Não é possível reservar um horário no passado.');
  }

  if (endAt <= startAt) {
    throw new BookingValidationError('Horário de término deve ser posterior ao horário de início.');
  }

  // Obter serviço para registrar preço base
  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId },
  });

  if (!service) {
    throw new BookingValidationError('Serviço não encontrado para este tenant.');
  }

  // Executar de forma atômica
  return await prisma.$transaction(async (tx) => {
    // 1. Limpar holds expirados desse profissional para não falsamente bloquear o horário
    const expiredHolds = await tx.appointmentHold.findMany({
      where: {
        expiresAt: { lt: now },
        appointment: {
          professionalId,
          status: AppointmentStatus.held,
        },
      },
      select: { appointmentId: true },
    });

    if (expiredHolds.length > 0) {
      const appIds = expiredHolds.map((h) => h.appointmentId);
      await tx.appointmentHold.deleteMany({
        where: { appointmentId: { in: appIds } },
      });
      await tx.appointment.deleteMany({
        where: { id: { in: appIds }, status: AppointmentStatus.held },
      });
    }

    // 2. Verificar se este mesmo sessionToken já tem um hold ativo
    const existingSessionHold = await tx.appointmentHold.findFirst({
      where: {
        sessionToken,
        expiresAt: { gt: now },
      },
      include: { appointment: true },
    });

    if (existingSessionHold) {
      // Se for para o mesmo profissional e horário, apenas renovamos a expiração
      if (
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

    // 4. Buscar cliente genérico de checkout temporário ou criar cliente fictício para o hold
    let customer = await tx.customer.findFirst({
      where: { tenantId, email: `temp_hold_${sessionToken}@konnexy.internal` },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          tenantId,
          name: 'Reserva em Andamento',
          email: `temp_hold_${sessionToken}@konnexy.internal`,
          phone: '00000000000',
        },
      });
    }

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
      where: { id: serviceId, tenantId },
    });

    if (!service) {
      throw new BookingValidationError('Serviço não encontrado.');
    }

    const finalPrice = params.price ?? Number(service.price);
    const discount = params.discount ?? 0;

    // 2. Se temos uma sessão com hold ativo
    let existingHold = null;
    if (sessionToken) {
      existingHold = await tx.appointmentHold.findFirst({
        where: {
          sessionToken,
          appointment: {
            professionalId,
            status: AppointmentStatus.held,
          },
        },
        include: { appointment: true },
      });
    }

    if (existingHold) {
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

      // Atualizar métricas do cliente
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          visitsCount: { increment: 1 },
          lastVisit: now,
          totalSpent: { increment: confirmedAppointment.finalPrice },
        },
      });

      return confirmedAppointment;
    }

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

    // Atualizar métricas do cliente
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        visitsCount: { increment: 1 },
        lastVisit: now,
        totalSpent: { increment: appointment.finalPrice },
      },
    });

    return appointment;
  });
}

/**
 * Libera um hold imediatamente caso o usuário desista ou feche o modal de agendamento.
 */
export async function cancelHold(sessionToken: string) {
  const holds = await prisma.appointmentHold.findMany({
    where: { sessionToken },
  });

  if (holds.length === 0) return false;

  const appIds = holds.map((h) => h.appointmentId);
  await prisma.appointmentHold.deleteMany({
    where: { sessionToken },
  });
  await prisma.appointment.deleteMany({
    where: { id: { in: appIds }, status: AppointmentStatus.held },
  });

  return true;
}

/**
 * Limpa periodicamente todos os holds expirados.
 */
export async function cleanupExpiredHolds(): Promise<number> {
  const now = new Date();
  const expired = await prisma.appointmentHold.findMany({
    where: { expiresAt: { lt: now } },
    select: { appointmentId: true },
  });

  if (expired.length === 0) return 0;

  const ids = expired.map((e) => e.appointmentId);
  await prisma.appointmentHold.deleteMany({
    where: { appointmentId: { in: ids } },
  });
  const deletedAppointments = await prisma.appointment.deleteMany({
    where: { id: { in: ids }, status: AppointmentStatus.held },
  });

  return deletedAppointments.count;
}
