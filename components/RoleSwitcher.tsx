'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Role } from '@/types';
import { User, ShieldAlert, Calendar, LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function RoleSwitcher() {
  const { role, setRole } = useApp();

  const rolesConfig: { role: Role; label: string; href: string; icon: React.ReactNode }[] = [
    { role: 'client', label: 'Área Cliente', href: '/cliente', icon: <User className="w-3.5 h-3.5" /> },
    { role: 'professional', label: 'Área Profissional', href: '/profissional', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { role: 'receptionist', label: 'Recepção', href: '/recepcao', icon: <Calendar className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Painel Admin', href: '/admin', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-slate-900 text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 z-50 relative">
      <div className="flex items-center gap-2 font-medium text-slate-300">
        <span className="inline-flex items-center gap-1 text-[#C08497] font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" /> Modos de Teste (SaaS White Label):
        </span>
        <span className="hidden sm:inline text-slate-400">Alterne os perfis do sistema em tempo real:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {rolesConfig.map((r) => {
          const isActive = role === r.role;
          return (
            <Link
              key={r.role}
              href={r.href}
              onClick={() => setRole(r.role)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#C08497] text-white shadow-sm ring-2 ring-[#C08497]/40 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
