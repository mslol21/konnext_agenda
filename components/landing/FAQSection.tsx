'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export function FAQSection() {
  const faqs = [
    {
      q: 'Preciso enviar mensagem no WhatsApp para confirmar meu agendamento?',
      a: 'Na demonstração, os agendamentos ficam apenas no navegador e não reservam vagas reais. Em uma agenda conectada ao banco, a confirmação só aparece após o registro ser concluído.',
    },
    {
      q: 'Como funciona o cancelamento ou reagendamento de horário?',
      a: 'Os painéis permitem explorar o atendimento com dados de demonstração. Para uma reserva real, solicite cancelamento ou reagendamento à equipe do estabelecimento.',
    },
    {
      q: 'Quais formas de pagamento são aceitas?',
      a: 'A demonstração não realiza cobranças. Para atendimentos reais, consulte as formas de pagamento e as condições diretamente com o estabelecimento.',
    },
    {
      q: 'Posso selecionar um profissional específico de minha preferência?',
      a: 'Sim. Na etapa 2 são exibidos os profissionais ativos que atendem o serviço selecionado.',
    },
    {
      q: 'O que acontece se a data desejada estiver lotada?',
      a: 'Escolha outra data. A agenda conectada ao banco também pode sugerir os próximos dias com horários disponíveis. Avisos automáticos de lista de espera ainda não estão integrados.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tire suas Dúvidas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Entenda como funciona o agendamento inteligente e os diferenciais da tecnologia Konnexy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="konnexy-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-white text-base flex justify-between items-center gap-4 hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div id={`faq-answer-${idx}`} className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
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
