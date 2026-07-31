import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiAIResponse } from '@/lib/gemini';

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
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    console.error('Erro na API de Chat com Gemini AI:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar resposta da Inteligência Artificial.' },
      { status: 500 }
    );
  }
}
