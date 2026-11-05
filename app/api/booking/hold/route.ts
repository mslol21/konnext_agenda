import { NextRequest, NextResponse } from 'next/server';
import { createHold, cancelHold, BookingConflictError, BookingValidationError } from '@/lib/booking-engine';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { tenantId, sessionToken, serviceId, professionalId, startAt, endAt } = body;
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
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error('Erro na criação de hold:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao reter horário temporariamente.' },
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
      { error: error.message || 'Erro ao liberar horário.' },
      { status: 500 }
    );
  }
}
