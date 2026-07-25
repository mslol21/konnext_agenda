'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function MapContactSection() {
  const { salon } = useApp();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mensagem enviada com sucesso! Responderemos em breve.');
  };

  return (
    <section id="contato" className="py-24 bg-[#F8F5F2]/60 dark:bg-slate-950/60 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Venha nos Visitar & Contato
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Estamos localizados no coração de São Paulo. Agende seu horário ou tire suas dúvidas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-100 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-rose-100 dark:border-slate-800 pb-4">
              Informações do Salão
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C08497] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">Endereço</strong>
                  <span className="text-slate-600 dark:text-slate-400">{salon.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C08497] shrink-0" />
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">Telefone / WhatsApp</strong>
                  <span className="text-slate-600 dark:text-slate-400">{salon.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C08497] shrink-0" />
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">E-mail</strong>
                  <span className="text-slate-600 dark:text-slate-400">{salon.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#8B5E83] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">Horário de Funcionamento</strong>
                  <span className="text-slate-600 dark:text-slate-400">Segunda a Sábado: 08:00 às 20:00</span>
                  <span className="block text-xs text-[#C08497] font-semibold mt-0.5">Domingo e Feriados: Fechado</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`https://wa.me/5511987654321?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com a Recepção no WhatsApp
              </a>
            </div>
          </div>

          {/* Interactive Map Simulation */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-lg border border-rose-100 dark:border-slate-800 h-[420px] bg-slate-200 relative">
            <iframe
              title="Mapa de Localização Salão Calixto"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1974794269095!2d-46.67123968439832!3d-23.56134958468202!2m3!1f0!1f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0b4a47%3A0x4a1805562725e2!2sAlameda%20Gabriel%20Monteiro%20da%20Silva%20-%20Jardins%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
