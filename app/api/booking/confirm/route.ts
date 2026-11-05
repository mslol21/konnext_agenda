import { confirmationRequestSchema } from '@/lib/booking-validation';
import { NextRequest, NextResponse } from 'next/server';
import { confirmBooking, BookingConflictError, BookingValidationError } from '@/lib/booking-engine';
import { resolveBookingTenant } from '@/lib/booking-tenant';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const parsed = confirmationRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Dados de agendamento inválidos.' }, { status: 400 });
    const body = parsed.data;
    let {
      tenantId,
      sessionToken,
      customer,
      serviceId,
      professionalId,
      startAt,
      endAt,
      notes,
      paymentMethod,
    } = body;

    tenantId = await resolveBookingTenant(request.headers, body) || undefined;



    if (!tenantId || !customer?.name || !customer?.phone || !customer?.email || !serviceId || !professionalId || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'Dados incompletos para confirmação do agendamento.' },
        { status: 400 }
      );
    }

    const appointment = await confirmBooking({
      tenantId,
      sessionToken,
      customer,
      serviceId,
      professionalId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      notes,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Erro na confirmação do agendamento:', error);
    return NextResponse.json(
      { error: 'Não foi possível confirmar o agendamento. Tente novamente.' },
      { status: 500 }
    );
  }
}
