import { NextRequest, NextResponse } from 'next/server';
import { getDayAvailability, getNextAvailableSuggestions } from '@/lib/availability';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    let tenantId = searchParams.get('tenantId');
    const tenantSlug = searchParams.get('tenantSlug') || request.headers.get('x-tenant-slug');
    const serviceIdsParam = searchParams.get('serviceIds') || searchParams.get('serviceId');
    const professionalId = searchParams.get('professionalId') || 'any';
    const dateStr = searchParams.get('date');

    if (!tenantId && tenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Parâmetro tenantId ou tenantSlug é obrigatório.' },
        { status: 400 }
      );
    }

    if (!serviceIdsParam) {
      return NextResponse.json(
        { error: 'Parâmetro serviceIds é obrigatório.' },
        { status: 400 }
      );
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: 'Data no formato YYYY-MM-DD é obrigatória.' },
        { status: 400 }
      );
    }

    const serviceIds = serviceIdsParam.split(',').map((s) => s.trim()).filter(Boolean);

    const queryOptions = {
      tenantId,
      serviceIds,
      professionalId,
      dateStr,
    };

    const availability = await getDayAvailability(queryOptions);

    // Se o dia não tiver horários livres, busca sugestões para os próximos dias
    if (!availability.isDayAvailable || availability.slots.length === 0) {
      const suggestions = await getNextAvailableSuggestions(queryOptions);
      availability.nextAvailableSuggestions = suggestions;
    }

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    console.error('Erro na API de disponibilidade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao calcular disponibilidade.' },
      { status: 500 }
    );
  }
}
