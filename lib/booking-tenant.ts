import { prisma } from './db';

/** Resolve public booking context. A tenant subdomain takes precedence over caller input. */
export async function resolveBookingTenant(headers: Headers, input: { tenantId?: string | null; tenantSlug?: string | null }) {
  const hostSlug = headers.get('x-tenant-slug');
  const slug = hostSlug || input.tenantSlug;
  if (!slug && !input.tenantId) return null;
  const tenant = await prisma.tenant.findUnique({
    where: slug ? { slug } : { id: input.tenantId! },
    select: { id: true, isActive: true },
  });
  return tenant?.isActive ? tenant.id : null;
}
