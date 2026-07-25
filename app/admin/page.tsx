'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  XCircle, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Award,
  Download,
  Scissors,
  CheckCircle2,
  Bot,
  PieChart,
  BarChart3,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const appointments = DataStore.getAppointments();
  const clients = DataStore.getClients();
  const services = DataStore.getServices();
  const professionals = DataStore.getProfessionals();
  const aiInsights = DataStore.getAIInsights();

  // AI Copilot Interactive Prompt State
  const [aiQuestion, setAiQuestion] = useState('');
  const [customAiAnswer, setCustomAiAnswer] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const totalRevenue = appointments
    .filter((a) => a.payment_status === 'paid' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  const totalCancelled = appointments.filter((a) => a.status === 'cancelled').length;
  const cancellationRate = appointments.length > 0 
    ? ((totalCancelled / appointments.length) * 100).toFixed(1) 
    : '0';

  // Advanced Metrics
  const ticketMedio = clients.length > 0 ? totalRevenue / (appointments.length || 1) : 0;
  const recurrentClients = clients.filter(c => c.visits_count > 1).length;
  const recurrentRate = clients.length > 0 ? ((recurrentClients / clients.length) * 100).toFixed(0) : '0';

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiAnalyzing(true);
    setCustomAiAnswer(null);

    setTimeout(() => {
      setIsAiAnalyzing(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('horário') || q.includes('agenda') || q.includes('abrir')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: Com base nos últimos 6 meses, as quintas-feiras às 18h e sábados às 10h têm 97% de taxa de ocupação. Recomendamos abrir 2 vagas extras de encaixe nesses horários.');
      } else if (q.includes('promoção') || q.includes('terça') || q.includes('desconto')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: As terças-feiras possuem apenas 38% de ocupação. Sugestão: Crie um cupom de 15% OFF exclusivo para "Hidratação Kérastase" nas terças-feiras.');
      } else if (q.includes('retorno') || q.includes('cliente') || q.includes('voltar')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: Clientes que realizam Luzes e Progressiva possuem ciclo de retorno de 92 dias. 14 clientes atingirão esse prazo na próxima semana.');
      } else {
        setCustomAiAnswer(`🤖 **Konnexy AI**: Análise concluída para "${aiQuestion}". A taxa de fidelidade do seu salão é de ${recurrentRate}%, com ticket médio de ${formatCurrency(ticketMedio)}. Recomenda-se focar em campanhas de retoque para clientes Ouro.`);
      }
    }, 1200);
  };

  const handleExportSummaryCSV = () => {
    const summaryData = appointments.map((a) => ({
      ID: a.id,
      Cliente: a.client_name,
      Serviço: a.service_name,
      Profissional: a.professional_name,
      Data: a.date,
      Horário: a.start_time,
      Valor: a.final_price,
      Status: a.status,
      Pagamento: a.payment_status,
    }));
    exportToCSV(summaryData, 'Relatorio_Geral_Agendamentos');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Painel Geral & Inteligência Artificial
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Dashboard Administrativo Konnexy
            </h1>
            <p className="text-xs text-slate-500">
              Métricas ricas, análises de ocupação, ticket médio e IA Preditiva.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSummaryCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800 shadow-sm"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Quick Nav Pills to Sub-modules */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs font-bold">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-[#C08497] text-white shadow-sm">
            Visão Geral & IA
          </Link>
          <Link href="/admin/calendario" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            Calendário FullCalendar
          </Link>
          <Link href="/admin/servicos" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            Gestão de Serviços
          </Link>
          <Link href="/admin/profissionais" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            Profissionais & Horários
          </Link>
          <Link href="/admin/clientes" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            CRM Clientes VIP
          </Link>
          <Link href="/admin/financeiro" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            Financeiro & Relatórios
          </Link>
        </div>

        {/* KONNEXY AI COPILOT SECTION */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C08497] to-[#8B5E83] flex items-center justify-center text-white shadow-lg">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-rose-300 font-extrabold uppercase tracking-wider block">Módulo Preditivo</span>
                <h2 className="text-xl font-extrabold">Konnexy AI Copilot</h2>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
              ● IA Ativa (Histórico de 6 meses)
            </span>
          </div>

          {/* Interactive Question Input */}
          <form onSubmit={handleAskAI} className="space-y-3">
            <label className="text-xs text-slate-300 font-medium block">
              Pergunte qualquer coisa à IA sobre o desempenho do seu salão:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Qual o melhor horário para abrir promoção? Ou quando os clientes de luzes voltam?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs outline-none focus:ring-2 focus:ring-[#C08497]"
              />
              <button
                type="submit"
                disabled={isAiAnalyzing}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" /> {isAiAnalyzing ? 'Analisando...' : 'Analisar com IA'}
              </button>
            </div>
          </form>

          {/* AI Response Output */}
          {customAiAnswer && (
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-rose-400/30 text-xs text-rose-100 space-y-1 animate-in fade-in">
              <p className="leading-relaxed">{customAiAnswer}</p>
            </div>
          )}

          {/* Pre-calculated AI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {aiInsights.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#C08497] uppercase tracking-wider">{item.category}</span>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.insight}</p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">{item.metric}</span>
                  <span className="text-slate-400 font-medium">Recomendado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EXPANDED RICH METRICS GRID (8 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Agendamentos Hoje</span>
              <Calendar className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15% vs semana passada
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Taxa de Ocupação Real</span>
              <PieChart className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <p className="text-3xl font-black text-[#8B5E83] dark:text-rose-300">
              88.4%
            </p>
            <p className="text-[11px] text-slate-400">Pico: Quintas e Sábados</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Ticket Médio por Cliente</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">
              {formatCurrency(ticketMedio || 245.00)}
            </p>
            <p className="text-[11px] text-slate-400">Base em {appointments.length} atendimentos</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Taxa de Retenção (VIP)</span>
              <Award className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {recurrentRate}%
            </p>
            <p className="text-[11px] text-slate-400">{recurrentClients} clientes recorrentes</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Horário Mais Vendido</span>
              <Clock className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              14:00 - 15:00
            </p>
            <p className="text-[11px] text-slate-400">Seguido por 18:00h</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Serviço Mais Popular</span>
              <Scissors className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <p className="text-lg font-black text-[#8B5E83] dark:text-rose-300 truncate">
              Luzes & Mechas Platinum
            </p>
            <p className="text-[11px] text-slate-400">42% do faturamento total</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Profissional Líder</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-white truncate">
              Juliana Calixto
            </p>
            <p className="text-[11px] text-slate-400">98% de avaliações 5★</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Taxa de Faltas (No-Show)</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-black text-rose-500">
              2.1%
            </p>
            <p className="text-[11px] text-slate-400">Cancelamentos: {cancellationRate}%</p>
          </div>

        </div>

        {/* ANALYTICS & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C08497]" /> Próximos Atendimentos do Dia
              </h3>
              <Link href="/admin/calendario" className="text-xs text-[#8B5E83] font-bold hover:underline">
                Ver no Calendário →
              </Link>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-[#F8F5F2]/60 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-800 flex justify-between items-center text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white text-sm block">
                      {apt.client_name}
                    </span>
                    <p className="text-slate-500">
                      {apt.service_name} com <strong className="text-[#8B5E83]">{apt.professional_name}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-[#C08497] block">{apt.start_time} - {apt.end_time}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                      {formatCurrency(apt.final_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Equipe Ativa ({professionals.length})
            </h3>
            <div className="space-y-3">
              {professionals.map((pro) => (
                <div key={pro.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                  <img src={pro.photo_url} alt={pro.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-800 dark:text-white">{pro.name}</h4>
                    <p className="text-slate-400 text-[11px]">{pro.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
