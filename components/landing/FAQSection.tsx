'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const faqs = [
    {
      q: 'Preciso enviar mensagem no WhatsApp para confirmar meu agendamento?',
      a: 'Não! Todo o processo é 100% automático pelo nosso site. Ao finalizar o agendamento, sua vaga é reservada em tempo real no sistema.',
    },
    {
      q: 'Como funciona o cancelamento ou reagendamento de horário?',
      a: 'Você pode cancelar ou reagendar com até 24 horas de antecedência acessando a sua Área do Cliente com seu e-mail ou telefone.',
    },
    {
      q: 'Quais formas de pagamento são aceitas no salão?',
      a: 'Aceitamos PIX, cartões de crédito e débito, dinheiro e cupons promocionais.',
    },
    {
      q: 'Posso escolher um profissional específico?',
      a: 'Sim! No momento do agendamento você pode selecionar o profissional de sua preferência ou optar por qualquer profissional disponível.',
    },
    {
      q: 'E se não houver horário livre na data que desejo?',
      a: 'Você pode entrar na nossa Lista de Espera automática. Se algum cliente cancelar ou vagar um horário, você será notificada imediatamente.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-t border-rose-100/60 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#C08497]" /> Dúvidas Frequentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Perguntas Frequentes (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#F8F5F2]/50 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-700 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-slate-800 dark:text-white text-base flex justify-between items-center gap-4 hover:text-[#C08497] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C08497] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-rose-100/50 dark:border-slate-700/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
