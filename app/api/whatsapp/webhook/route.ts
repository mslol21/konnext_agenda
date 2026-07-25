import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppConfig, sendWhatsAppCloudMessage } from '@/lib/whatsapp';
import { generateGeminiAIResponse } from '@/lib/gemini';

// GET: Meta Webhook Verification Endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const { verifyToken } = getWhatsAppConfig();

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Meta WhatsApp Webhook verificado com sucesso!');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Token de verificação do Webhook inválido.' }, { status: 403 });
  }
}

// POST: Incoming WhatsApp Messages Webhook Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { autoReplyEnabled } = getWhatsAppConfig();

    // Verify if message is a WhatsApp inbound message
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const incomingMsg = messages[0];
      const fromPhone = incomingMsg.from; // Customer phone number
      const msgType = incomingMsg.type;

      let userText = '';
      if (msgType === 'text') {
        userText = incomingMsg.text?.body || '';
      } else if (msgType === 'interactive') {
        userText = incomingMsg.interactive?.button_reply?.title || '';
      }

      console.log(`[WHATSAPP WEBHOOK] Mensagem recebida de ${fromPhone}: "${userText}"`);

      // Auto-reply using Google Gemini AI if enabled
      if (userText && autoReplyEnabled) {
        const aiReply = await generateGeminiAIResponse(userText);
        await sendWhatsAppCloudMessage(fromPhone, aiReply);
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err) {
    console.error('Erro no processamento do Webhook do WhatsApp:', err);
    return NextResponse.json({ error: 'Erro interno no Webhook.' }, { status: 500 });
  }
}
