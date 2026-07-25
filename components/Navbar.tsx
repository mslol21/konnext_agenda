'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Menu, X, Sparkles, PhoneCall, Clock } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-rose-100/80 dark:border-slate-800 transition-all">
      {/* Top Banner Info */}
      <div className="bg-[#F8F5F2] dark:bg-slate-800/60 py-1 px-4 text-xs text-slate-600 dark:text-slate-300 border-b border-rose-100/40 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#C08497]" />
              Seg a Sáb: 08h às 20h
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-[#C08497]" />
              {salon.phone}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8B5E83] dark:text-rose-300 font-medium">
            <span>✨ Agendamento 100% Online sem fila no WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#C08497] to-[#8B5E83] flex items-center justify-center text-white shadow-md shadow-rose-200/50 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-[#8B5E83] to-[#C08497] dark:from-white dark:to-rose-300 bg-clip-text text-transparent">
                {salon.name}
              </span>
              <span className="block text-[10px] tracking-widest text-[#8B5E83] dark:text-rose-300 font-semibold uppercase">
                Sistema de Agendamento Online
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700 dark:text-slate-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-[#C08497] dark:hover:text-rose-300 transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C08497] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] hover:from-[#b37588] hover:to-[#7a5073] text-white font-semibold shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Agora
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="p-2 rounded-xl bg-[#C08497] text-white text-xs font-semibold flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Agendar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-[#C08497]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setBookingModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-[#C08497] text-white font-semibold text-center flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Agendar Horário Online
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
