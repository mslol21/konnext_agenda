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
    <section id="servicos" className="py-24 bg-[#F8F5F2]/60 dark:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#C08497]" /> Nossos Serviços & Tratamentos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Menu de Beleza Exclusivo
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Selecione um dos nossos procedimentos de alta performance e garanta seu horário de forma imediata.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
            <input
              type="text"
              placeholder="Buscar serviço (ex: Mechas, Corte, Manicure)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm shadow-sm focus:ring-2 focus:ring-[#C08497] outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50'
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
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-rose-100/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Header */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={srv.image_url}
                  alt={srv.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#8B5E83] dark:text-rose-300 shadow-md">
                  {formatCurrency(srv.price)}
                </div>
                <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-[#C08497]" />
                  {srv.duration_minutes} minutos
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C08497]">
                    {srv.category_name}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-[#C08497] transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/servicos/${srv.slug}`}
                    className="text-xs font-bold text-[#8B5E83] dark:text-rose-300 hover:underline flex items-center gap-1"
                  >
                    Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleBookService(srv.id)}
                    className="px-4 py-2 rounded-xl bg-[#C08497] hover:bg-[#b37588] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Agendar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
