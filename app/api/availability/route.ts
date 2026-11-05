import { NextRequest, NextResponse } from 'next/server';
import { getDayAvailability, getNextAvailableSuggestions, isValidDateString } from '@/lib/availability';
import { resolveBookingTenant } from '@/lib/booking-tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    let tenantId = searchParams.get('tenantId');
    const tenantSlug = searchParams.get('tenantSlug') || request.headers.get('x-tenant-slug');
    const serviceIdsParam = searchParams.get('serviceIds') || searchParams.get('serviceId');
    const professionalId = searchParams.get('professionalId') || 'any';
    const dateStr = searchParams.get('date');

    tenantId = await resolveBookingTenant(request.headers, { tenantId, tenantSlug });

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

    if (!dateStr || !isValidDateString(dateStr)) {
      return NextResponse.json(
        { error: 'Data no formato YYYY-MM-DD é obrigatória.' },
        { status: 400 }
      );
    }

    const serviceIds = [...new Set(serviceIdsParam.split(',').map((s) => s.trim()).filter(Boolean))];
    if (!serviceIds.length || serviceIds.length > 10) return NextResponse.json({ error: 'Selecione de 1 a 10 serviços.' }, { status: 400 });

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
      { error: 'Não foi possível consultar a agenda. Tente novamente.' },
      { status: 500 }
    );
  }
}
