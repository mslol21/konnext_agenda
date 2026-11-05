'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, Heart, Instagram, Facebook, Phone, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export function Footer() {
  const { salon, setRole } = useApp();

  return (
    <footer className="bg-[#050711] text-slate-400 py-16 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Konnexy<span className="text-cyan-400"> Agenda</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Parte do ecossistema Konnexy
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solução de agendamento online inteligente e gestão operacional de alta performance para salões, clínicas e estúdios.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" aria-label="Instagram" className="p-2 rounded-xl bg-[#080b17] hover:text-cyan-400 hover:bg-slate-800 border border-white/5 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-xl bg-[#080b17] hover:text-cyan-400 hover:bg-slate-800 border border-white/5 transition-all"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#servicos" className="hover:text-cyan-400 transition-colors">Serviços & Procedimentos</Link></li>
              <li><Link href="/#equipe" className="hover:text-cyan-400 transition-colors">Equipe de Especialistas</Link></li>
              <li><Link href="/#depoimentos" className="hover:text-cyan-400 transition-colors">Avaliações Verificadas</Link></li>
              <li><Link href="/#galeria" className="hover:text-cyan-400 transition-colors">Galeria de Resultados</Link></li>
              <li><Link href="/#contato" className="hover:text-cyan-400 transition-colors">Localização & Contato</Link></li>
            </ul>
          </div>

          {/* Access Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Portais do Ecossistema</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cliente" onClick={() => setRole('client')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Área do Cliente</span>
                </Link>
              </li>
              <li>
                <Link href="/profissional" onClick={() => setRole('professional')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Área do Profissional</span>
                </Link>
              </li>
              <li>
                <Link href="/recepcao" onClick={() => setRole('receptionist')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Recepção & Check-in</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" onClick={() => setRole('admin')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Painel Administrativo</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Atendimento</h4>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{salon.phone}</span>
            </p>
            <p className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{salon.address}</span>
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Sistema Ativo 24/7
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Konnexy Agenda • Um produto do ecossistema Konnexy. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Desenvolvido para máxima conversão e pontualidade</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
