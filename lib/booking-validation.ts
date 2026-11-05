import { z } from 'zod';

const id = z.string().trim().min(1).max(200);
const timestamp = z.string().datetime({ offset: true });
export const bookingRequestSchema = z.object({
  tenantId: id.optional(),
  tenantSlug: id.optional(),
  sessionToken: z.string().min(20).max(200),
  serviceId: id,
  professionalId: id,
  startAt: timestamp,
  endAt: timestamp,
});
export const confirmationRequestSchema = bookingRequestSchema.extend({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
    phone: z.string().transform(v => v.replace(/\D/g, '')).pipe(z.string().min(10).max(15)),
  }),
  notes: z.string().max(2000).optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'cash']).optional(),
});
