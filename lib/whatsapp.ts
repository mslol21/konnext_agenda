// Helper to retrieve Meta WhatsApp Cloud API credentials
export function getWhatsAppConfig() {
  const isEnvAvailable = typeof process !== 'undefined';
  
  let phoneNumberId = isEnvAvailable ? process.env.WHATSAPP_PHONE_NUMBER_ID || '' : '';
  let accessToken = isEnvAvailable ? process.env.WHATSAPP_ACCESS_TOKEN || '' : '';
  let verifyToken = isEnvAvailable ? process.env.WHATSAPP_VERIFY_TOKEN || 'konnexy_verify_token_2026' : 'konnexy_verify_token_2026';
  let autoReplyEnabled = true;

  if (typeof window !== 'undefined') {
    phoneNumberId = localStorage.getItem('konnexy_wa_phone_number_id') || phoneNumberId;
    accessToken = localStorage.getItem('konnexy_wa_access_token') || accessToken;
    verifyToken = localStorage.getItem('konnexy_wa_verify_token') || verifyToken;
    const autoReplySaved = localStorage.getItem('konnexy_wa_auto_reply');
    if (autoReplySaved !== null) {
      autoReplyEnabled = autoReplySaved === 'true';
    }
  }

  return {
    phoneNumberId,
    accessToken,
    verifyToken,
    autoReplyEnabled,
  };
}

// Generate formatted wa.me link for client to start WhatsApp conversation from site
export function generateWhatsAppBookingLink(phoneNumber: string, appointmentDetails: {
  id: string;
  client_name: string;
  service_name: string;
  professional_name: string;
  date: string;
  time: string;
  final_price: number;
}): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const targetPhone = cleanPhone.length >= 10 ? cleanPhone : '5511987654321';

  const messageText = `✨ *Olá! Gostaria de confirmar meu agendamento no Konnexy Agenda!*

📋 *Código*: #${appointmentDetails.id}
👤 *Cliente*: ${appointmentDetails.client_name}
✂️ *Serviço*: ${appointmentDetails.service_name}
🌟 *Profissional*: ${appointmentDetails.professional_name}
🗓️ *Data*: ${appointmentDetails.date} às ${appointmentDetails.time}
💰 *Valor*: R$ ${appointmentDetails.final_price.toFixed(2)}

Podem me confirmar os detalhes? Obrigado!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
}

// Send WhatsApp Cloud API message via Meta Graph API
export async function sendWhatsAppCloudMessage(toPhoneNumber: string, textMessage: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const { phoneNumberId, accessToken } = getWhatsAppConfig();

  if (!phoneNumberId || !accessToken) {
    console.warn('Meta WhatsApp Cloud API credentials not configured yet.');
    return { success: false, error: 'Credenciais da Meta WhatsApp Cloud API não configuradas.' };
  }

  const cleanRecipient = toPhoneNumber.replace(/\D/g, '');

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanRecipient,
        type: 'text',
        text: { preview_url: false, body: textMessage },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      console.error('Meta WhatsApp Cloud API error response:', data);
      return { success: false, error: data.error?.message || 'Erro ao enviar mensagem no WhatsApp' };
    }
  } catch (err: any) {
    console.error('Fetch error calling Meta WhatsApp API:', err);
    return { success: false, error: err.message || 'Erro de conexão com a Meta API' };
  }
}
