'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { Sparkles, Instagram, Calendar, Award } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function TeamSection() {
  const { setBookingModalOpen } = useApp();
  const professionals = DataStore.getProfessionals();

  return (
    <section id="equipe" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Equipe de Especialistas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Corpo Técnico de Alta Precisão
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Cada profissional gerencia sua própria escala e grade de atendimento, garantindo pontualidade e dedicação total ao seu procedimento.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="konnexy-card rounded-2xl p-6 text-center space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                  <img
                    src={pro.photo_url}
                    alt={pro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {pro.name}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                    {pro.specialty}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {pro.description}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{pro.experience_years} anos de experiência</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <a
                  href={`https://instagram.com/${pro.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-violet-400" />
                  <span>{pro.instagram}</span>
                </a>

                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#080b17] hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-slate-950 text-slate-200 border border-white/10 hover:border-transparent text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver Agenda de {pro.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
