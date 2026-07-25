'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { Sparkles, Instagram, Calendar, Award } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function TeamSection() {
  const { setBookingModalOpen } = useApp();
  const professionals = DataStore.getProfessionals();

  return (
    <section id="equipe" className="py-24 bg-white dark:bg-slate-900 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5E83]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#8B5E83]" /> Nossos Talentos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Equipe de Especialistas
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Cada profissional possui agenda própria, trazendo o mais alto nível de especialização e personalização.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-[#F8F5F2]/50 dark:bg-slate-800/80 rounded-3xl p-6 border border-rose-100/80 dark:border-slate-700 text-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={pro.photo_url}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-[#C08497] transition-colors">
                    {pro.name}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-semibold">
                    {pro.specialty}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {pro.description}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#C08497]" />
                  {pro.experience_years} anos de experiência
                </div>
              </div>

              <div className="pt-4 border-t border-rose-100 dark:border-slate-700/60 space-y-2">
                <a
                  href={`https://instagram.com/${pro.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-[#C08497] font-semibold"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  {pro.instagram}
                </a>

                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Ver Agenda de {pro.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
