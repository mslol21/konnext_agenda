'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Role } from '@/types';
import { User, ShieldAlert, Calendar, LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function RoleSwitcher() {
  const { role, setRole } = useApp();

  const rolesConfig: { role: Role; label: string; href: string; icon: React.ReactNode }[] = [
    { role: 'client', label: 'Área do Cliente', href: '/cliente', icon: <User className="w-3.5 h-3.5" /> },
    { role: 'professional', label: 'Área do Profissional', href: '/profissional', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { role: 'receptionist', label: 'Recepção', href: '/recepcao', icon: <Calendar className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Painel Admin', href: '/admin', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside aria-label="Ambiente de Demonstração" className="bg-[#050711]/95 border-b border-cyan-500/20 text-slate-300 py-1.5 px-4 text-xs z-50 relative backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Painéis de demonstração
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Dados locais neste navegador; sem login ou sincronização.
          </span>
        </div>

        <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-0.5 no-scrollbar">
          {rolesConfig.map((r) => {
            const isActive = role === r.role;
            return (
              <Link
                key={r.role}
                href={r.href}
                onClick={() => setRole(r.role)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
