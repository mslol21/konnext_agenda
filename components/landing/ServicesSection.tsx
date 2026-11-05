'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DataStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Clock, Calendar, ArrowRight, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';

export function ServicesSection() {
  const { setBookingModalOpen, setSelectedServiceId } = useApp();
  const services = DataStore.getServices();
  const categories = DataStore.getCategories();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter((srv) => {
    const matchesCat = activeCategory === 'all' || srv.category_id === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setBookingModalOpen(true);
  };

  return (
    <section id="servicos" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cardápio de Serviços & Procedimentos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Menu de Alta Performance
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Consulte a duração média e os valores de cada procedimento e selecione o horário ideal com confirmação instantânea.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto pt-3">
            <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-5" />
            <input
              type="text"
              placeholder="Buscar procedimento (ex: Mechas, Corte, Manicure)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-[#080b17] text-white placeholder-slate-500 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-[#080b17] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5'
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-[#080b17] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="konnexy-card rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Header with Subtle Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={srv.image_url}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#050711]/80 backdrop-blur-md border border-white/10 text-cyan-300 text-[11px] font-semibold">
                    {srv.category_name}
                  </span>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-[#050711]/80 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{srv.duration_minutes} min</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">A partir de</span>
                  <span className="text-xl font-extrabold text-cyan-400">
                    {formatCurrency(srv.price)}
                  </span>
                </div>

                <button
                  onClick={() => handleBookService(srv.id)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-slate-400 text-sm">Nenhum serviço encontrado com esse termo.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Limpar filtros e ver todos
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
