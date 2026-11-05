import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, data: { mode: 'demo' } }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const slug = request.headers.get('x-tenant-slug') || process.env.NEXT_PUBLIC_TENANT_SLUG || 'konnexy-demo';
    if (!slug) return NextResponse.json({ error: 'Empresa de agendamento não configurada.' }, { status: 503 });
    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, slug: true, phone: true, isActive: true } });
    if (!tenant?.isActive) return NextResponse.json({ error: 'Agenda indisponível para esta empresa.' }, { status: 404 });
    const [services, professionals, categories] = await Promise.all([
      prisma.service.findMany({ where: { tenantId: tenant.id, isActive: true }, include: { category: true } }),
      prisma.professional.findMany({
        where: { tenantId: tenant.id, status: 'active' },
        select: { id: true, name: true, photoUrl: true, specialty: true, description: true, experienceYears: true, instagram: true,
          services: { where: { tenantId: tenant.id }, select: { serviceId: true } },
          workingHours: { where: { isWorking: true } } },
      }),
      prisma.serviceCategory.findMany({ where: { tenantId: tenant.id }, orderBy: { order: 'asc' } }),
    ]);
    return NextResponse.json({ success: true, data: {
      mode: 'live',
      tenantSlug: tenant.slug,
      phone: tenant.phone,
      services: services.map(s => ({ id: s.id, salon_id: tenant.id, category_id: s.categoryId || '', category_name: s.category?.name || '',
        name: s.name, slug: s.slug, description: s.description || '', price: Number(s.price), duration_minutes: s.durationMinutes,
        buffer_minutes: s.bufferMinutes, image_url: s.imageUrl || '', color: s.color || '#22d3ee', is_active: s.isActive })),
      professionals: professionals.map(p => ({ id: p.id, salon_id: tenant.id, name: p.name, email: '', phone: '', photo_url: p.photoUrl || '',
        specialty: p.specialty, description: p.description || '', experience_years: p.experienceYears, instagram: p.instagram || '',
        working_days: p.workingHours.map(h => h.dayOfWeek), working_hours: { start: '09:00', end: '18:00' },
        status: 'active', services: p.services.map(s => s.serviceId), commission_rate: 0 })),
      categories: categories.map(c => ({ id: c.id, salon_id: tenant.id, name: c.name, slug: c.slug, order: c.order })),
    } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Erro ao consultar catálogo:', error);
    return NextResponse.json({ error: 'Agenda temporariamente indisponível. Tente novamente.' }, { status: 503 });
  }
}
