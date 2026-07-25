'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Sparkles, Clock, CheckCircle2, ArrowRight, Scissors, Star } from 'lucide-react';

export function HeroSection() {
  const { setBookingModalOpen, setSelectedServiceId } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8F5F2] via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-10 sm:py-16">
      
      {/* Soft Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C08497]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
        
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#C08497]" />
          <span>Agendamento 100% Online & Instantâneo</span>
        </div>

        {/* Minimalist Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Agende seu horário em <span className="text-[#C08497]">1 minuto</span>.
        </h1>

        {/* Concise Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
          Escolha o serviço, a data e o horário desejado. Confirmação automática sem precisar enviar mensagens no WhatsApp.
        </p>

        {/* Primary Direct CTA */}
        <div className="pt-2 max-w-md mx-auto">
          <button
            onClick={() => setBookingModalOpen(true)}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] hover:from-[#b37588] hover:to-[#7a5073] text-white font-extrabold text-base shadow-lg shadow-rose-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Agendar Horário Agora
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Simple Intuitive Steps for Mobile */}
        <div className="pt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 max-w-lg mx-auto border-t border-rose-100/80 dark:border-slate-800">
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#C08497]/20 text-[#8B5E83] dark:text-rose-300 font-extrabold inline-flex items-center justify-center">1</span>
            <p className="block">1. Escolha o serviço</p>
          </div>
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#C08497]/20 text-[#8B5E83] dark:text-rose-300 font-extrabold inline-flex items-center justify-center">2</span>
            <p className="block">2. Escolha o dia e hora</p>
          </div>
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#C08497]/20 text-[#8B5E83] dark:text-rose-300 font-extrabold inline-flex items-center justify-center">3</span>
            <p className="block">3. Confirmação no ato</p>
          </div>
        </div>

      </div>
    </section>
  );
}
