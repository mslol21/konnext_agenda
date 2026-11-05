'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { MapPin, Phone, Mail, Clock, MessageCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function MapContactSection() {
  const { salon } = useApp();

  return (
    <section id="contato" className="py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Localização & Atendimento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Venha nos Visitar
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Estamos em endereço nobre com manobrista e estrutura planejada para seu conforto e privacidade.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Card */}
          <div className="lg:col-span-5 konnexy-card rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">
              Informações do Estabelecimento
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Endereço Principal</strong>
                  <span className="text-slate-400 text-xs">{salon.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <strong className="block text-white font-semibold">Telefone Central</strong>
                  <span className="text-slate-400 text-xs">{salon.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <strong className="block text-white font-semibold">E-mail Corporativo</strong>
                  <span className="text-slate-400 text-xs">{salon.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Horários de Atendimento</strong>
                  <span className="text-slate-400 text-xs block">Segunda a Sábado: 08:00 às 20:00</span>
                  <span className="text-[11px] text-cyan-400 font-semibold mt-0.5 inline-block">Atendimento mediante agendamento prévio</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <a
                href={`https://wa.me/5511987654321?text=Olá,%20gostaria%20de%20informações%20sobre%20o%20Konnexy%20Agenda.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Falar no WhatsApp Oficial</span>
              </a>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-xl border border-white/10 h-[430px] bg-[#080b17] relative">
            <iframe
              title="Mapa de Localização"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1974794269095!2d-46.67123968439832!3d-23.56134958468202!2m3!1f0!1f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0b4a47%3A0x4a1805562725e2!2sAlameda%20Gabriel%20Monteiro%20da%20Silva%20-%20Jardins%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
