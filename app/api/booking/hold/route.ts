import { bookingRequestSchema } from '@/lib/booking-validation';
import { NextRequest, NextResponse } from 'next/server';
import { createHold, cancelHold, BookingConflictError, BookingValidationError } from '@/lib/booking-engine';
import { resolveBookingTenant } from '@/lib/booking-tenant';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const parsed = bookingRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Dados de agendamento inválidos.' }, { status: 400 });
    const body = parsed.data;
    let { tenantId, sessionToken, serviceId, professionalId, startAt, endAt } = body;
    tenantId = await resolveBookingTenant(request.headers, body) || undefined;



    if (!tenantId || !sessionToken || !serviceId || !professionalId || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser fornecidos (tenantId, sessionToken, serviceId, professionalId, startAt, endAt).' },
        { status: 400 }
      );
    }

    const hold = await createHold({
      tenantId,
      sessionToken,
      serviceId,
      professionalId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    });

    return NextResponse.json({
      success: true,
      data: hold,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Erro na criação de hold:', error);
    return NextResponse.json(
      { error: 'Não foi possível reservar o horário. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json({ error: 'sessionToken é obrigatório.' }, { status: 400 });
    }

    const released = await cancelHold(sessionToken);
    return NextResponse.json({ success: true, released });
  } catch (error: any) {
    console.error('Erro ao cancelar hold:', error);
    return NextResponse.json(
      { error: 'Não foi possível liberar o horário.' },
      { status: 500 }
    );
  }
}
