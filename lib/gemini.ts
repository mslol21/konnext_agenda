import { GoogleGenerativeAI } from '@google/generative-ai';
import { DataStore } from './store';
import { formatCurrency } from './utils';

// Helper to retrieve Gemini API Key from env or LocalStorage settings
export function getGeminiApiKey(): string {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('konnexy_gemini_api_key');
    if (saved) return saved;
  }
  return '';
}

// Build dynamic system context with salon services, professionals, and rules
export function buildSalonSystemPrompt(): string {
  const salon = DataStore.getSalon();
  const services = DataStore.getServices();
  const professionals = DataStore.getProfessionals();

  const servicesList = services
    .map(s => `- ${s.name} (${s.category_name}): ${formatCurrency(s.price)}, duração ${s.duration_minutes} min. ${s.description}`)
    .join('\n');

  const professionalsList = professionals
    .map(p => `- ${p.name} (${p.specialty}): ${p.description}`)
    .join('\n');

  return `Você é a Atendente Virtual de Inteligência Artificial do "${salon.name}", um salão de beleza e espaço de estética de luxo em São Paulo.

SEU OBJETIVO:
Atender os clientes que iniciam conversa pelo WhatsApp vindos do agendamento ou carrinho do site.
Seja sempre extremamente educada, sofisticada, acolhedora, objetiva e profissional em Português do Brasil (PT-BR).

INFORMAÇÕES DO SALÃO EM TEMPO REAL:
- Nome: ${salon.name}
- Endereço: ${salon.address}
- Horário de Funcionamento: Segunda a Sábado das 08h às 20h. Domingos e feriados: Fechado.
- Telefone / WhatsApp Oficial: ${salon.phone}

SERVIÇOS OFERECIDOS:
${servicesList}

EQUIPE DE PROFISSIONAIS:
${professionalsList}

REGRAS DE RESPOSTA AO CLIENTE:
1. Quando o cliente enviar uma mensagem inicial contendo um resumo de agendamento do site (com código #apt-xxx, serviço, profissional, data, horário e valor), CONFIRME O AGENDAMENTO com entusiasmo, informe o endereço do salão e pergunte se ele precisa de alguma orientação adicional.
2. Se o cliente perguntar sobre preços ou serviços, informe os valores exatos listados acima.
3. Se o cliente perguntar sobre formas de pagamento, informe que aceitamos PIX, cartões de crédito/débito e dinheiro.
4. Mantenha a resposta concisa e agradável (ideal para WhatsApp). Use emojis com moderação (✨, ✂️, 💅, 🗓️, 📍).
5. NUNCA invente horários ou serviços que não existam na lista.`;
}

// Main Gemini AI Answer Generator
export async function generateGeminiAIResponse(userMessage: string): Promise<string> {
  const apiKey = getGeminiApiKey();

  // If Gemini API Key is provided, use official GoogleGenerativeAI SDK
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = buildSalonSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nCLIENTE NO WHATSAPP: "${userMessage}"\n\nSUA RESPOSTA AUTOMÁTICA COMO ATENDENTE VIRTUAL:`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();
      if (responseText) return responseText.trim();
    } catch (err) {
      console.error('Erro ao chamar Google Gemini API SDK:', err);
    }
  }

  // Fallback Smart IA Engine (quando a chave de API ainda não foi inserida)
  const msgLower = userMessage.toLowerCase();
  const salon = DataStore.getSalon();

  if (msgLower.includes('agendamento') || msgLower.includes('#apt') || msgLower.includes('corte') || msgLower.includes('mechas') || msgLower.includes('limpeza')) {
    return `✨ Olá! Que maravilhoso ter você no *${salon.name}*!\n\nRecebi os detalhes do seu agendamento vindo do nosso site com sucesso! 🗓️\n\nSua reserva já está pré-confirmada em nosso sistema. Nosso endereço é:\n📍 *${salon.address}*\n\nPrecisa de alguma dúvida sobre como chegar ou sobre seu procedimento? Será um imenso prazer te atender! 🥰`;
  }

  if (msgLower.includes('preço') || msgLower.includes('quanto custa') || msgLower.includes('valor')) {
    return `✨ Nossos principais procedimentos no *${salon.name}*:\n- Corte Feminino: R$ 180,00\n- Luzes & Mechas Platinum: R$ 450,00\n- Progressiva Orgânica: R$ 320,00\n- Manicure & Pedicure Gel: R$ 130,00\n\nVocê pode agendar direto pelo nosso site sem pegar fila! Deseja o link? ✂️💅`;
  }

  if (msgLower.includes('endereço') || msgLower.includes('localização') || msgLower.includes('onde fica')) {
    return `📍 Estamos localizados em um espaço privilegiado no Jardins:\n*${salon.address}*\n\nContamos com manobrista e estacionamento no local. Te esperamos! ✨`;
  }

  return `✨ Olá! Sou a Atendente Virtual de Inteligência Artificial do *${salon.name}*.\n\nRecebi sua mensagem! Como posso te ajudar hoje? Você pode tirar dúvidas sobre serviços, valores ou confirmar seu agendamento realizado no site! 🥰`;
}
