import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppConfig, sendWhatsAppCloudMessage } from '@/lib/whatsapp';
import { generateGeminiAIResponse } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

// GET: Meta Webhook Verification Endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const { verifyToken } = getWhatsAppConfig();

  if (verifyToken && mode === 'subscribe' && token === verifyToken) {
    console.log('Meta WhatsApp Webhook verificado com sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden: Verificação falhou' }, { status: 403 });
}

// POST: Recebe eventos e mensagens do WhatsApp Cloud API
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (!secret) return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 });
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || '';
    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
    }
    const body = JSON.parse(rawBody);

    // Valida estrutura básica do payload da Meta
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromNumber = message.from; // Número do cliente (ex: 5511999998888)
        const textBody = message.text.body;

        if (process.env.WHATSAPP_AUTO_REPLY_ENABLED !== 'true') {
          return NextResponse.json({ status: 'EVENT_RECEIVED' });
        }

        // Responde de forma inteligente usando a IA do Konnexy
        const aiAnswer = await generateGeminiAIResponse(textBody);

        // Envia resposta automática para o cliente
        await sendWhatsAppCloudMessage(fromNumber, aiAnswer);
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Erro no processamento do Webhook do WhatsApp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
