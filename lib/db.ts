import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Retorna uma interface escopada para o tenant especificado.
 * Toda operação de leitura e escrita é estritamente vinculada ao `tenant_id`.
 */
export function getTenantDb(tenantId: string) {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('MultiTenantSecurityException: tenantId obrigatório para operação de banco.');
  }

  return {
    tenantId,

    // Services
    services: {
      findMany: (args?: any) =>
        prisma.service.findMany({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      findFirst: (args: any) =>
        prisma.service.findFirst({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      create: (args: any) =>
        prisma.service.create({
          ...args,
          data: { ...args.data, tenantId },
        }),
      update: async (args: any) => {
        // Assegura que o registro pertence a este tenant antes de atualizar
        const existing = await prisma.service.findFirst({
          where: { id: args.where.id, tenantId },
        });
        if (!existing) {
          throw new Error('Acesso negado: registro não pertence a este tenant.');
        }
        return prisma.service.update(args);
      },
      delete: async (args: any) => {
        const existing = await prisma.service.findFirst({
          where: { id: args.where.id, tenantId },
        });
        if (!existing) {
          throw new Error('Acesso negado: registro não pertence a este tenant.');
        }
        return prisma.service.delete(args);
      },
    },

    // Professionals
    professionals: {
      findMany: (args?: any) =>
        prisma.professional.findMany({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      findFirst: (args: any) =>
        prisma.professional.findFirst({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      create: (args: any) =>
        prisma.professional.create({
          ...args,
          data: { ...args.data, tenantId },
        }),
    },

    // Customers
    customers: {
      findMany: (args?: any) =>
        prisma.customer.findMany({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      findFirst: (args: any) =>
        prisma.customer.findFirst({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      create: (args: any) =>
        prisma.customer.create({
          ...args,
          data: { ...args.data, tenantId },
        }),
    },

    // Appointments
    appointments: {
      findMany: (args?: any) =>
        prisma.appointment.findMany({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      findFirst: (args: any) =>
        prisma.appointment.findFirst({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
      create: (args: any) =>
        prisma.appointment.create({
          ...args,
          data: { ...args.data, tenantId },
        }),
    },

    // Subscriptions
    subscriptions: {
      findFirst: (args?: any) =>
        prisma.subscription.findFirst({
          ...args,
          where: { ...(args?.where || {}), tenantId },
        }),
    },
  };
}
