'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Menu, X, Sparkles, PhoneCall, Clock, ArrowRight } from 'lucide-react';

export function Navbar() {
  const { salon, setBookingModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/#servicos' },
    { name: 'Equipe', href: '/#equipe' },
    { name: 'Depoimentos', href: '/#depoimentos' },
    { name: 'Galeria', href: '/#galeria' },
    { name: 'Contato', href: '/#contato' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050711]/90 backdrop-blur-xl border-b border-white/5 transition-all">
      {/* Top Banner Info */}
      <div className="bg-[#080b17] py-1.5 px-4 text-xs text-slate-400 border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Seg a Sáb: 08h às 20h
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              {salon.phone}
            </span>
          </div>
          <div className="flex items-center gap-4 text-cyan-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Agendamento Inteligente 100% Automático
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Ecosystem Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Konnexy<span className="text-cyan-400"> Agenda</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  v2.0
                </span>
              </div>
              <span className="block text-[10px] tracking-wider text-slate-400 font-medium uppercase">
                Parte do ecossistema Konnexy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-cyan-400 transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Button Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Agendar Agora</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu de navegação"
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080b17] border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setBookingModalOpen(true);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Calendar className="w-4 h-4" />
              Agendar Horário Online
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
