import { NextRequest, NextResponse } from 'next/server';
import { confirmBooking, BookingConflictError, BookingValidationError } from '@/lib/booking-engine';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const tenantSlug = body.tenantSlug || request.headers.get('x-tenant-slug');

    if (!tenantId && tenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }

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
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Erro na confirmação do agendamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao confirmar agendamento.' },
      { status: 500 }
    );
  }
}
