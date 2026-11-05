'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Sparkles, Clock, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  const { setBookingModalOpen } = useApp();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Konnexy Atmospheric Backlight Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-violet-600/10 rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[90px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Brand Tag Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1122] border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Konnexy Agenda • Agendamento Inteligente Online</span>
        </div>

        {/* Hero Title with Konnexy Copy Guidelines */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Agendamentos organizados sem depender de{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            mensagens o dia inteiro.
          </span>
        </h1>

        {/* Clear, Benefit-Driven Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Clientes escolhem o serviço, profissional e horário com confirmação automática imediata. Gestão de agenda, recebimentos e atendimento por IA em um só fluxo.
        </p>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => setBookingModalOpen(true)}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group"
          >
            <Calendar className="w-4 h-4 text-slate-950 group-hover:rotate-6 transition-transform" />
            <span>Agendar Horário Online</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0d1122] hover:bg-[#12182e] border border-white/10 hover:border-cyan-500/30 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Ver Demonstração</span>
          </Link>
        </div>

        {/* 3 Intuitive Functional Steps */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto border-t border-white/10">
          <div className="p-4 rounded-2xl bg-[#080b17]/80 border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h2 className="text-sm font-bold text-white">Escolha o serviço</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consulte duração, valores e detalhes de cada procedimento sem surpresas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080b17]/80 border border-white/5 space-y-2 hover:border-cyan-500/20 transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h2 className="text-sm font-bold text-white">Dia e horário em tempo real</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grade sincronizada que impede choques de horário ou agendas duplicadas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080b17]/80 border border-white/5 space-y-2 hover:border-violet-500/20 transition-all">
            <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-400 font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h2 className="text-sm font-bold text-white">Confirmação no ato</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lembretes automáticos, sincronização com Google Calendar e WhatsApp oficial.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
