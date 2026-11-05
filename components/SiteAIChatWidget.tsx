'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Bot, MessageSquare, X, Send, Sparkles, Calendar, PhoneCall, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'gemini_ai';
  text: string;
  timestamp: string;
}

export function SiteAIChatWidget() {
  const { salon, setBookingModalOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'gemini_ai',
      text: `✨ Olá! Sou a Atendente Virtual de Inteligência Artificial do *${salon.name}*!\n\nComo posso te ajudar hoje? Você pode me perguntar sobre nossos procedimentos, profissionais, horários de atendimento ou agendar seu horário diretamente aqui! 😊`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputMsg;
    if (!messageContent.trim() || isTyping) return;

    if (!textToSend) setInputMsg('');

    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsgObj: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent }),
      });

      const data = await response.json();

      const aiReplyText = data.reply || `✨ Olá! Agende direto no site em instantes clicando no botão "Agendar Agora" ou venha nos visitar em ${salon.address}!`;

      const aiMsgObj: Message = {
        id: `ai-${Date.now()}`,
        sender: 'gemini_ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error('Erro no Chat do Site:', err);
      const fallbackMsgObj: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'gemini_ai',
        text: `✨ Estamos prontos para te atender! Clique em "Agendar Agora" acima ou nos chame no WhatsApp ${salon.phone}!`,
        timestamp: timeNow,
      };
      setMessages((prev) => [...prev, fallbackMsgObj]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Widget Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-slate-950 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 ring-2 ring-cyan-400/50"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ring-[#03050d]" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-black leading-tight text-slate-950">Atendente IA</span>
            <span className="block text-[10px] text-slate-900 font-semibold">Tire dúvidas em tempo real</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl border border-white/10 bg-[#080b17] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-xl">
          
          {/* Header */}
          <div className="bg-[#0b1022] p-4 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-sm">
                <Bot className="w-5 h-5 text-slate-950" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ring-[#080b17]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Konnexy AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Atendimento Inteligente 24h</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Minimizar chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Pills */}
          <div className="px-3 py-2 bg-[#050711] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage('Quais são os principais serviços e procedimentos?')}
              className="px-2.5 py-1 rounded-lg bg-[#0d1122] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] font-medium whitespace-nowrap border border-white/5 transition-all"
            >
              ✨ Serviços
            </button>
            <button
              onClick={() => handleSendMessage('Qual é o horário de funcionamento do salão?')}
              className="px-2.5 py-1 rounded-lg bg-[#0d1122] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] font-medium whitespace-nowrap border border-white/5 transition-all"
            >
              🕒 Horários
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setBookingModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-bold whitespace-nowrap border border-cyan-500/30 transition-all flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Agendar
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080b17] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-br-none shadow-sm'
                      : 'bg-[#0d1122] text-slate-200 border border-white/10 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className={`block text-[9px] text-right ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#0d1122] text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Konnexy AI está digitando...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Footer Input */}
          <div className="p-3 bg-[#0b1022] border-t border-white/10 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Pergunte sobre horários, serviços ou valores..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080b17] text-white placeholder:text-slate-500 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={isTyping || !inputMsg.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:opacity-90 disabled:opacity-40 shrink-0 font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
              <span>IA Google Gemini Integrada</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setBookingModalOpen(true);
                }}
                className="font-bold text-cyan-400 hover:underline"
              >
                Abrir Agendamento →
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
