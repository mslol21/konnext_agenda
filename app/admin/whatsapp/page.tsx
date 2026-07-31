'use client';

import React, { useState, useEffect } from 'react';
import { generateGeminiAIResponse, getGeminiApiKey } from '@/lib/gemini';
import { getWhatsAppConfig } from '@/lib/whatsapp';
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

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/whatsapp/webhook`
    : 'https://konnext-agenda.vercel.app/api/whatsapp/webhook';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL do Webhook copiada para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase mb-1">
              <Bot className="w-3.5 h-3.5" /> Atendimento Inteligente 100% Gratuito
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              WhatsApp & Gemini AI sem Custos Operacionais
            </h1>
            <p className="text-xs text-slate-500">
              Configure sua chave gratuita do Google AI Studio e franquia de 1.000 conversas grátis na Meta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoReply(!autoReply)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                autoReply 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Power className="w-4 h-4" />
              Resposta Automática IA: {autoReply ? 'LIGADA' : 'DESLIGADA'}
            </button>
          </div>
        </div>

        {/* ZERO OPERATIONAL COST GUIDE BANNER */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Como Manter Custo Operacional R$ 0,00 / Mês
              </h3>
              <p className="text-xs text-emerald-300">
                Aproveite as cotas 100% gratuitas do Google AI Studio e da Meta WhatsApp Cloud API.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 1. Google Gemini AI Grátis
              </div>
              <p className="text-slate-300 leading-relaxed">
                Obtenha sua API Key gratuita no <strong>Google AI Studio</strong> (`1.500 requisições/dia` grátis).
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#C08497] hover:underline pt-1"
              >
                Gerar Chave Grátis →
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 2. Meta WhatsApp 1.000 Conversas
              </div>
              <p className="text-slate-300 leading-relaxed">
                A Meta concede <strong>1.000 conversas de serviço gratuitas</strong> todos os meses por conta.
              </p>
              <a
                href="https://developers.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#C08497] hover:underline pt-1"
              >
                Painel Meta Developers →
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 3. Chat Flutuante no Site
              </div>
              <p className="text-slate-300 leading-relaxed">
                O widget no canto inferior do site já está ativo e responde aos clientes sem gastar saldo do WhatsApp!
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Settings & Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: API Settings Form */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-[#C08497]" /> Credenciais da Meta API & Google Gemini
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#C08497]" /> Google Gemini API Key (AI Studio - Gratuito)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400">Insira a chave obtida em aistudio.google.com</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Phone Number ID (Meta Cloud API)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 105928374650192"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Meta WhatsApp Access Token (Bearer)
                </label>
                <textarea
                  rows={2}
                  placeholder="EAAG..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Webhook Verify Token (Configurar na Meta)
                </label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 space-y-2 border border-rose-100 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">URL de Callback do Webhook (Para a Meta Vercel):</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    title="Copiar URL do Webhook"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white font-bold text-xs shadow-md hover:opacity-95"
              >
                Salvar Configurações
              </button>
            </form>
          </div>

          {/* Right Column: Live Chat Simulator */}
          <div className="lg:col-span-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Simulador WhatsApp + Gemini AI</h4>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    ● Atendente Virtual Online (Gratuito)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMessages([])}
                className="p-2 text-slate-400 hover:text-white"
                title="Limpar Conversa"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-1 ${
                      msg.sender === 'client'
                        ? 'bg-emerald-700 text-white rounded-br-none shadow-md'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                    <span className="block text-[9px] text-slate-300 text-right opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isAiResponding && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-300 rounded-2xl p-3 text-xs flex items-center gap-2 border border-slate-700">
                    <Sparkles className="w-4 h-4 text-[#C08497] animate-spin" />
                    <span>Gemini AI está digitando resposta...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendSimulatedMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Simular mensagem do cliente (ex: Olá, quero agendar)..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs outline-none focus:ring-2 focus:ring-[#C08497]"
              />
              <button
                type="submit"
                disabled={isAiResponding || !inputMsg.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-4 h-4" /> Enviar
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
