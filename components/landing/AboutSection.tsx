'use client';

import React from 'react';
import { Award, Sparkles, Heart, Shield, Users } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="sobre" className="py-20 bg-white dark:bg-slate-900 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images Collages */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80"
              alt="Atendimento Salão de Beleza"
              className="rounded-3xl shadow-lg h-64 sm:h-80 w-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80"
              alt="Especialistas em Cabelo"
              className="rounded-3xl shadow-lg h-64 sm:h-80 w-full object-cover mt-8"
            />
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5E83]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Quem Somos
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Excelência, luxo e bem-estar em um só ambiente.
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Fundado com o propósito de elevar a experiência de autocuidado feminino, o <strong>Konnexy Agenda</strong> reúne os melhores profissionais visagistas, cosmetólogos e nail designers da região.
            </p>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Trabalhamos exclusivamente com atendimento agendado para garantir total atenção, privacidade e pontualidade em cada procedimento.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-[#C08497] font-bold">
                  <Award className="w-5 h-5" />
                  <span>Produtos Premium</span>
                </div>
                <p className="text-xs text-slate-500">Utilizamos somente marcas internacionais como Kérastase e Olaplex.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-[#8B5E83] dark:text-rose-300 font-bold">
                  <Shield className="w-5 h-5" />
                  <span>Biossegurança</span>
                </div>
                <p className="text-xs text-slate-500">Materiais esterilizados em autoclave e toalhas descartáveis.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
