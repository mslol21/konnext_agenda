'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { Star, Sparkles, Quote, CheckCircle2 } from 'lucide-react';

export function TestimonialsSection() {
  const reviews = DataStore.getReviews();

  return (
    <section id="depoimentos" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exemplos de Avaliações</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Como as avaliações aparecem
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Depoimentos fictícios para demonstrar a apresentação das avaliações no sistema.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="konnexy-card rounded-2xl p-7 space-y-4 relative flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-cyan-400/15 absolute top-6 right-6" />

              <div className="space-y-3">
                {/* Rating Stars Konnexy Gold #D6A84B */}
                <div className="flex items-center gap-1 text-[#D6A84B]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D6A84B] text-[#D6A84B]" />
                  ))}
                </div>

                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {rev.client_name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {rev.service_name} • <span className="text-cyan-400 font-medium">{rev.professional_name}</span>
                  </p>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Exemplo
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
