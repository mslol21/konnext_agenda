import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiAIResponse } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 });
    }

    const aiResponse = await generateGeminiAIResponse(message);

    return NextResponse.json({
      success: true,
      reply: aiResponse,
    });
  } catch (error) {
    console.error('Erro na rota de chat:', error);
    return NextResponse.json(
      { error: 'Falha ao processar solicitação de IA.' },
      { status: 500 }
    );
  }
}
