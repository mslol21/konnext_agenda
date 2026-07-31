'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Bot, MessageSquare, X, Send, Sparkles, Calendar, PhoneCall, RefreshCw, Scissors, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

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
      text: `✨ Olá! Sou a Atendente Virtual de Inteligência Artificial do *${salon.name}*!\n\nComo posso te ajudar hoje? Você pode me perguntar sobre nossos serviços, preços, horários de atendimento ou agendar seu procedimento! 🥰`,
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
        headers: { 'Content-[#Type]': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent }),
      });

      const data = await response.json();

      const aiReplyText = data.reply || `✨ Olá! Agende direto no site em instantes clicando no botão "Agendar Agora" ou venha nos visitar em ${salon.address}! 🥰`;

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
        text: `✨ Estamos prontos para te atender! Clique em "Agendar Agora" acima ou nos chame no WhatsApp ${salon.phone}! 🥰`,
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
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#C08497] via-[#8B5E83] to-slate-900 text-white shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-rose-200/50 dark:ring-slate-800"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-black leading-tight">Atendimento IA</span>
            <span className="block text-[10px] text-rose-200 font-medium">Pergunte à Gemini AI</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-[#C08497] to-[#8B5E83] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                  {salon.name} AI <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[11px] text-rose-100 opacity-90">Atendente Virtual Gratuita</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2 bg-[#F8F5F2] dark:bg-slate-800/80 border-b border-rose-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-[11px] font-bold">
            <button
              onClick={() => handleSendMessage('Quais os serviços de cabelo e preços?')}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-[#C08497] shrink-0"
            >
              ✂️ Serviços & Preços
            </button>
            <button
              onClick={() => handleSendMessage('Qual o endereço e horário de funcionamento?')}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-[#C08497] shrink-0"
            >
              📍 Endereço & Horários
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setBookingModalOpen(true);
              }}
              className="px-3 py-1 rounded-xl bg-[#C08497] text-white hover:bg-[#b37588] shrink-0"
            >
              📅 Agendar Agora
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="block text-[9px] text-right opacity-70">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 text-slate-500 rounded-2xl p-3 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-4 h-4 text-[#C08497] animate-spin" />
                  <span>Konnexy AI está digitando...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Footer Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Pergunte sobre horários, serviços ou preços..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:ring-2 focus:ring-[#C08497]"
              />
              <button
                type="submit"
                disabled={isTyping || !inputMsg.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white hover:opacity-90 disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
              <span>Powered by Google Gemini AI (Gratuito)</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setBookingModalOpen(true);
                }}
                className="font-bold text-[#C08497] hover:underline"
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
