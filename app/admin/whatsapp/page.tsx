'use client';

import React, { useState, useEffect } from 'react';
import { generateGeminiAIResponse, getGeminiApiKey } from '@/lib/gemini';
import { getWhatsAppConfig } from '@/lib/whatsapp';
import { AdminNav } from '@/components/admin/AdminNav';
import { 
  Bot, 
  Send, 
  Key, 
  Phone, 
  ShieldCheck, 
  Settings, 
  Copy, 
  Power,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Gift,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  sender: 'client' | 'gemini_ai';
  text: string;
  timestamp: string;
}

export default function WhatsAppAdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('konnexy_verify_token_2026');
  const [autoReply, setAutoReply] = useState(true);

  // Chat Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'client',
      text: '✨ Olá! Gostaria de confirmar meu agendamento no Konnexy Agenda!\n\n📋 Código: #apt-1721892\n👤 Cliente: Fernanda Lima\n✂️ Serviço: Corte Feminino Customizado\n🌟 Profissional: Juliana Calixto\n🗓️ Data: 2026-07-25 às 10:00\n💰 Valor: R$ 180.00\n\nPodem me confirmar os detalhes?',
      timestamp: '10:02',
    },
    {
      id: '2',
      sender: 'gemini_ai',
      text: '✨ Olá, Fernanda! Que maravilhoso ter você no *Konnexy Agenda*!\n\nRecebi a confirmação do seu agendamento de *Corte Feminino Customizado* com a profissional *Juliana Calixto* para hoje às 10:00! 🗓️\n\nSua vaga está 100% reservada. Nosso endereço é:\n📍 *Alameda Gabriel Monteiro da Silva, 1420 - Jardins*\n\nPrecisa de alguma dúvida sobre como chegar? Te esperamos com um café especial! 🥰',
      timestamp: '10:02',
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  useEffect(() => {
    setApiKey(getGeminiApiKey());
    const wa = getWhatsAppConfig();
    setPhoneId(wa.phoneNumberId);
    setAccessToken(wa.accessToken);
    setVerifyToken(wa.verifyToken);
    setAutoReply(wa.autoReplyEnabled);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('konnexy_gemini_api_key', apiKey);
      localStorage.setItem('konnexy_wa_phone_number_id', phoneId);
      localStorage.setItem('konnexy_wa_access_token', accessToken);
      localStorage.setItem('konnexy_wa_verify_token', verifyToken);
      localStorage.setItem('konnexy_wa_auto_reply', String(autoReply));
    }
    toast.success('Configurações do WhatsApp e Gemini AI salvas!');
  };

  const handleSendSimulatedMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isAiResponding) return;

    const userText = inputMsg;
    setInputMsg('');

    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsgObj: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'client',
      text: userText,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsAiResponding(true);

    const aiResponseText = await generateGeminiAIResponse(userText);

    const aiMsgObj: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'gemini_ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsgObj]);
    setIsAiResponding(false);
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="konnexy-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Meta Cloud API Oficial + Google Gemini AI
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-400" /> Automação de Atendimento WhatsApp & IA
            </h1>
            <p className="text-xs text-slate-400">
              Respostas inteligentes, confirmação instantânea de agendamentos e redução de esforço operacional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings Column */}
          <div className="lg:col-span-6 konnexy-card rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" /> Parâmetros de Integração
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Chave de API do Google Gemini (Gratuita)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none font-mono"
                  />
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-[#080b17] hover:bg-slate-800 text-cyan-400 border border-white/10 font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Obter Grátis
                  </a>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  ID do Número de Telefone (Meta Developer)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 104928475928374"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Token de Acesso Permanente (WhatsApp Cloud API)
                </label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Token de Verificação do Webhook
                </label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="autoReply"
                  checked={autoReply}
                  onChange={(e) => setAutoReply(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-cyan-400 cursor-pointer"
                />
                <label htmlFor="autoReply" className="font-semibold text-white cursor-pointer">
                  Habilitar Respostas Automáticas via Inteligência Artificial
                </label>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
                >
                  Salvar Parâmetros de Integração
                </button>
              </div>
            </form>
          </div>

          {/* Chat Simulator Column */}
          <div className="lg:col-span-6 konnexy-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#25D366]" /> Simulador de Conversa em Tempo Real
              </h3>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                WhatsApp Live
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#050711] rounded-xl border border-white/5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                      m.sender === 'client'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-br-none shadow-sm'
                        : 'bg-[#0d1122] text-slate-200 border border-white/10 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    <span className={`block text-[9px] text-right ${m.sender === 'client' ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isAiResponding && (
                <div className="flex justify-start">
                  <div className="bg-[#0d1122] text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2 border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>Gemini AI está elaborando a resposta...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Input */}
            <form onSubmit={handleSendSimulatedMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Simular mensagem do cliente (ex: Vocês abrem no sábado?)..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080b17] text-white placeholder:text-slate-500 text-xs focus:border-cyan-400 outline-none"
              />
              <button
                type="submit"
                disabled={isAiResponding || !inputMsg.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simular</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
