'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { Star, Sparkles, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const reviews = DataStore.getReviews();

  return (
    <section id="depoimentos" className="py-24 bg-[#F8F5F2]/60 dark:bg-slate-950/60 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#C08497]" /> Experiência dos Nossos Clientes
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Avaliações 5 Estrelas
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Depoimentos reais enviados automaticamente após a conclusão de cada atendimento no salão.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-100 dark:border-slate-800 shadow-md space-y-4 relative flex flex-col justify-between"
            >
              <Quote className="w-10 h-10 text-[#C08497]/20 absolute top-6 right-6" />

              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {rev.client_name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {rev.service_name} com <strong className="text-[#8B5E83]">{rev.professional_name}</strong>
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full font-bold">
                  ✓ Verificado
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
