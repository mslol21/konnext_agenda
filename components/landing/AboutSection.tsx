'use client';

import React from 'react';
import { Award, Sparkles, Shield, Clock, CheckCircle2 } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="sobre" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images Collages with Dark Glass Frame */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80"
                alt="Atendimento Exclusivo Konnexy Agenda"
                className="h-64 sm:h-80 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050d] via-transparent to-transparent opacity-60" />
            </div>

            <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-xl mt-8">
              <img
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80"
                alt="Procedimentos de Alta Performance"
                className="h-64 sm:h-80 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050d] via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pontualidade & Sofisticação</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Excelência no atendimento com a tecnologia do ecossistema Konnexy.
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              O <strong>Konnexy Agenda</strong> foi desenvolvido para eliminar filas de espera, respostas demoradas em mensagens e falhas de comunicação na marcação de horários.
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              Com uma experiência phygital integrada, cada cliente tem acesso à sua própria área de acompanhamento com histórico, fichas técnicas e reagendamento facilitado.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[#080b17] border border-white/5 space-y-1.5 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Produtos & Padrão Premium</span>
                </div>
                <p className="text-xs text-slate-400">Linhas profissionais consagradas com protocolos de alta precisão.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#080b17] border border-white/5 space-y-1.5 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span>Biossegurança Total</span>
                </div>
                <p className="text-xs text-slate-400">Rigor em esterilização em autoclave e materiais de uso único.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
