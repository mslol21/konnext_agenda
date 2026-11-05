'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  Scissors, 
  Bot, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/admin/calendario', label: 'Agenda Interativa', icon: Calendar },
    { href: '/admin/clientes', label: 'CRM & Clientes', icon: Users },
    { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/admin/profissionais', label: 'Equipe', icon: Users },
    { href: '/admin/servicos', label: 'Serviços', icon: Scissors },
    { href: '/admin/whatsapp', label: 'WhatsApp & IA', icon: Bot },
  ];

  return (
    <div className="bg-[#080b17] border-b border-white/5 py-2.5 px-4 mb-6 sticky top-20 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold mr-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-sm shadow-cyan-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 shrink-0 text-xs text-slate-400">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            <span>Ver Site Público</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
