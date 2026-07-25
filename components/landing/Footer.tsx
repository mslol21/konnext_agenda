'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, Heart, Instagram, Facebook, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { salon, setRole } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C08497] to-[#8B5E83] flex items-center justify-center text-white font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {salon.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema de agendamento online de alto padrão para salões de beleza e estúdios de estética.
            </p>
            <div className="flex items-center gap-3 text-slate-300">
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:text-[#C08497]"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-slate-900 hover:text-[#C08497]"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#servicos" className="hover:text-white">Serviços</Link></li>
              <li><Link href="#equipe" className="hover:text-white">Profissionais</Link></li>
              <li><Link href="#depoimentos" className="hover:text-white">Depoimentos</Link></li>
              <li><Link href="#galeria" className="hover:text-white">Galeria de Fotos</Link></li>
            </ul>
          </div>

          {/* Access Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Portais do Sistema</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cliente" onClick={() => setRole('client')} className="hover:text-[#C08497]">
                  Área do Cliente
                </Link>
              </li>
              <li>
                <Link href="/profissional" onClick={() => setRole('professional')} className="hover:text-[#C08497]">
                  Área do Profissional
                </Link>
              </li>
              <li>
                <Link href="/recepcao" onClick={() => setRole('receptionist')} className="hover:text-[#C08497]">
                  Recepção & Check-in
                </Link>
              </li>
              <li>
                <Link href="/admin" onClick={() => setRole('admin')} className="hover:text-[#C08497]">
                  Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Atendimento</h4>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C08497]" /> {salon.phone}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C08497] shrink-0 mt-0.5" /> {salon.address}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {salon.name}. Todos os direitos reservados. White Label SaaS.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para o segmento de beleza.
          </p>
        </div>

      </div>
    </footer>
  );
}
