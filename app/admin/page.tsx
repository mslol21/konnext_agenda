'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Coupon, InventoryItem, Salon } from '@/types';
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
  Send,
  Building2,
  Zap,
  Tag,
  Bell,
  Settings,
  Package,
  AlertTriangle,
  Plus,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useApp } from '@/contexts/AppContext';

export default function AdminDashboardPage() {
  const { setBookingModalOpen } = useApp();
  
  const [salon, setSalon] = useState<Salon>(DataStore.getSalon());
  const units = DataStore.getUnits();
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || 'unit-1');
  
  const appointments = DataStore.getAppointments();
  const clients = DataStore.getClients();
  const services = DataStore.getServices();
  const professionals = DataStore.getProfessionals();
  const aiInsights = DataStore.getAIInsights();
  const [inventory, setInventory] = useState<InventoryItem[]>(DataStore.getInventory());

  // AI Copilot State
  const [aiQuestion, setAiQuestion] = useState('');
  const [customAiAnswer, setCustomAiAnswer] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Modals State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15');

  const [isWhiteLabelModalOpen, setIsWhiteLabelModalOpen] = useState(false);
  const [brandName, setBrandName] = useState(salon.name);
  const [brandPhone, setBrandPhone] = useState(salon.phone);
  const [brandAddress, setBrandAddress] = useState(salon.address);

  // Financial Summary
  const totalRevenue = appointments
    .filter((a) => a.payment_status === 'paid' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  const totalCancelled = appointments.filter((a) => a.status === 'cancelled').length;
  const cancellationRate = appointments.length > 0 
    ? ((totalCancelled / appointments.length) * 100).toFixed(1) 
    : '0';

  const ticketMedio = clients.length > 0 ? totalRevenue / (appointments.length || 1) : 0;
  const recurrentClients = clients.filter(c => c.visits_count > 1).length;
  const recurrentRate = clients.length > 0 ? ((recurrentClients / clients.length) * 100).toFixed(0) : '0';

  // Handlers
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiAnalyzing(true);
    setCustomAiAnswer(null);

    setTimeout(() => {
      setIsAiAnalyzing(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('horário') || q.includes('agenda') || q.includes('abrir')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: Com base nos últimos 6 meses, as quintas-feiras às 18h e sábados às 10h têm 97% de taxa de ocupação. Recomendamos abrir 2 vagas extras nesses horários.');
      } else if (q.includes('promoção') || q.includes('terça') || q.includes('desconto')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: As terças-feiras possuem apenas 38% de ocupação. Sugestão: Crie um cupom de 15% OFF exclusivo para "Hidratação Kérastase" nas terças-feiras.');
      } else if (q.includes('retorno') || q.includes('cliente') || q.includes('voltar')) {
        setCustomAiAnswer('🤖 **Konnexy AI**: Clientes que realizam Luzes e Progressiva possuem ciclo de retorno de 92 dias. 14 clientes atingirão esse prazo na próxima semana.');
      } else {
        setCustomAiAnswer(`🤖 **Konnexy AI**: Análise concluída para "${aiQuestion}". A taxa de fidelidade do seu salão é de ${recurrentRate}%, com ticket médio de ${formatCurrency(ticketMedio)}. Recomenda-se focar em campanhas de retoque para clientes Ouro.`);
      }
    }, 1200);
  };

  const handleCreateExpressCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      salon_id: salon.id,
      code: newCouponCode.toUpperCase(),
      discount_type: 'percentage',
      discount_value: parseFloat(newCouponDiscount) || 15,
      used_count: 0,
      is_active: true,
    };

    DataStore.saveCoupon(newCoupon);
    setIsCouponModalOpen(false);
    setNewCouponCode('');
    toast.success(`Cupom ${newCoupon.code} criado com sucesso!`);
  };

  const handleSaveWhiteLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...salon,
      name: brandName,
      phone: brandPhone,
      address: brandAddress,
    };
    DataStore.updateSalon(updated);
    setSalon(updated);
    setIsWhiteLabelModalOpen(false);
    toast.success('Configurações salvas!');
  };

  const handleNotifyVipPush = () => {
    toast.success('Notificação enviada para 12 Clientes VIP Ouro/Diamante!');
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
    <div className="workspace-page">
      <div className="workspace-page-stack space-y-6">
        
        {/* Top Header Bar with Unit Selector */}
        <div className="workspace-page-heading flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resumo do negócio</span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Visão geral
            </h1>
            <p className="text-xs text-slate-400">
              Acompanhe os indicadores e organize a operação do seu negócio.
            </p>
          </div>

          <div className="flex w-full xl:w-auto flex-wrap items-center gap-3">
            {/* Unit Selector */}
            <div className="flex items-center gap-1 bg-[#080b17] p-1 rounded-xl border border-white/10 text-xs font-bold max-w-full overflow-x-auto">
              {units.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`shrink-0 px-3 py-2 rounded-lg transition-all ${
                    selectedUnitId === u.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u.name.split(' ')[1] || u.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportSummaryCSV}
              className="px-3.5 py-2 rounded-xl bg-[#080b17] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* 8 KPI METRIC CARDS */}
        <div className="workspace-metrics grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Agendamentos Hoje</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15% vs média
            </p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Taxa de Ocupação</span>
              <PieChart className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-white">
              88.4%
            </p>
            <p className="text-[11px] text-slate-400">Pico: Quintas e Sábados</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Ticket Médio por Atendimento</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">
              {formatCurrency(ticketMedio || 245.00)}
            </p>
            <p className="text-[11px] text-slate-400">Base em {appointments.length} procedimentos</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Taxa de Retenção de Clientes</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {recurrentRate}%
            </p>
            <p className="text-[11px] text-slate-400">{recurrentClients} clientes com 2+ visitas</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Horário de Maior Procura</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-black text-white">
              14:00 - 15:00
            </p>
            <p className="text-[11px] text-slate-400">Seguido por 18:00h</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Procedimento Mais Vendido</span>
              <Scissors className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-base font-black text-white truncate">
              Luzes & Mechas Platinum
            </p>
            <p className="text-[11px] text-slate-400">42% da receita bruta</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Profissional Destaque</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-black text-white truncate">
              Juliana Calixto
            </p>
            <p className="text-[11px] text-slate-400">98% avaliações positivas</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Taxa de Cancelamento</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">
              {cancellationRate}%
            </p>
            <p className="text-[11px] text-slate-400">Abaixo da média de mercado (5%)</p>
          </div>
        </div>


        {/* ADMIN QUICK ACTIONS BAR */}
        <div className="p-4 rounded-2xl bg-[#0b1022] border border-white/10 space-y-3">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
            ⚡ Ações Rápidas de Gestão
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="p-3 rounded-xl bg-[#080b17] hover:bg-slate-800 border border-white/10 text-white font-semibold flex items-center gap-2 transition-all hover:border-cyan-500/30"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Encaixe de Agenda</span>
            </button>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="p-3 rounded-xl bg-[#080b17] hover:bg-slate-800 border border-white/10 text-white font-semibold flex items-center gap-2 transition-all hover:border-violet-500/30"
            >
              <Tag className="w-4 h-4 text-violet-400" />
              <span>Criar Cupom Express</span>
            </button>

            <button
              onClick={handleNotifyVipPush}
              className="p-3 rounded-xl bg-[#080b17] hover:bg-slate-800 border border-white/10 text-white font-semibold flex items-center gap-2 transition-all hover:border-blue-500/30"
            >
              <Bell className="w-4 h-4 text-blue-400" />
              <span>Notificar Clientes VIP</span>
            </button>

            <button
              onClick={() => setIsWhiteLabelModalOpen(true)}
              className="p-3 rounded-xl bg-[#080b17] hover:bg-slate-800 border border-white/10 text-white font-semibold flex items-center gap-2 transition-all hover:border-cyan-500/30"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Dados do Estabelecimento</span>
            </button>
          </div>
        </div>

        {/* KONNEXY AI COPILOT SECTION */}
        <div className="konnexy-card rounded-2xl p-6 sm:p-8 text-white space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Inteligência Estratégica</span>
                <h2 className="text-lg font-extrabold text-white">Konnexy AI Copilot</h2>
              </div>
            </div>
            <span className="text-xs bg-emerald-950/60 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              IA Ativa • Dados Consolidados
            </span>
          </div>

          <form onSubmit={handleAskAI} className="space-y-3">
            <label className="text-xs text-slate-300 font-medium block">
              Consulte a IA sobre taxas de retorno, horários de pico ou sugestões de receita:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Qual o melhor horário para abrir encaixes? Ou quando clientes de mechas costumam voltar?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-[#080b17] border border-white/10 text-white placeholder:text-slate-500 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={isAiAnalyzing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAiAnalyzing ? 'Processando...' : 'Consultar IA'}</span>
              </button>
            </div>
          </form>

          {customAiAnswer && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-100 space-y-1 animate-in fade-in">
              <p className="leading-relaxed whitespace-pre-line">{customAiAnswer}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {aiInsights.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-[#080b17] border border-white/5 space-y-2 flex flex-col justify-between hover:border-cyan-500/20 transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.insight}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">{item.metric}</span>
                  <span className="text-slate-500 font-medium">Recomendação</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* VISUAL CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Revenue Bar Representation */}
          <div className="lg:col-span-8 konnexy-card rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" /> Faturamento & Lucratividade Consolidada
                </h3>
                <p className="text-xs text-slate-400">Evolução dos últimos 6 meses</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                +24% Crescimento Médio
              </span>
            </div>

            {/* Visual Bar Graph */}
            <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 border-b border-white/5">
              {[
                { month: 'Fev', revenue: 34000, profit: 14000, heightRev: '55%', heightProf: '30%' },
                { month: 'Mar', revenue: 38000, profit: 16500, heightRev: '65%', heightProf: '35%' },
                { month: 'Abr', revenue: 42000, profit: 19000, heightRev: '75%', heightProf: '42%' },
                { month: 'Mai', revenue: 45000, profit: 21000, heightRev: '82%', heightProf: '48%' },
                { month: 'Jun', revenue: 48000, profit: 23500, heightRev: '90%', heightProf: '55%' },
                { month: 'Jul', revenue: 52400, profit: 26800, heightRev: '100%', heightProf: '62%' },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex justify-center items-end gap-1.5 h-full">
                    {/* Revenue Bar */}
                    <div 
                      style={{ height: bar.heightRev }} 
                      className="w-1/2 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-lg group-hover:brightness-110 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#03050d] text-white text-[10px] py-0.5 px-1.5 rounded font-bold whitespace-nowrap shadow border border-cyan-500/30 z-10">
                        {formatCurrency(bar.revenue)}
                      </span>
                    </div>
                    {/* Profit Bar */}
                    <div 
                      style={{ height: bar.heightProf }} 
                      className="w-1/2 bg-[#25D366] rounded-t-lg group-hover:brightness-110 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#03050d] text-white text-[10px] py-0.5 px-1.5 rounded font-bold whitespace-nowrap shadow border border-emerald-500/30 z-10">
                        {formatCurrency(bar.profit)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{bar.month}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-cyan-500" /> Faturamento Bruto
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#25D366]" /> Lucro Líquido
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-4 konnexy-card rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-400" /> Receita por Categoria
            </h3>

            <div className="space-y-4">
              {[
                { cat: 'Coloração & Mechas', pct: 42, color: 'bg-violet-500', val: 'R$ 22.008' },
                { cat: 'Cabelos & Penteados', pct: 31, color: 'bg-cyan-500', val: 'R$ 16.244' },
                { cat: 'Estética & Facial', pct: 15, color: 'bg-blue-500', val: 'R$ 7.860' },
                { cat: 'Unhas & Sobrancelhas', pct: 12, color: 'bg-emerald-500', val: 'R$ 6.288' },
              ].map((item) => (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{item.cat}</span>
                    <span>{item.pct}% ({item.val})</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#080b17] rounded-full overflow-hidden border border-white/5">
                    <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-violet-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Oportunidade de Otimização:
              </p>
              <p className="text-slate-400 leading-relaxed">
                Coloração representa 42% da receita total. Abertura de vagas extras nas sextas-feiras tem potencial de elevar o faturamento mensal em 12%.
              </p>
            </div>
          </div>

        </div>

        {/* INVENTORY TRACKER + LIVE FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Inventory Tracker */}
          <div className="lg:col-span-7 konnexy-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" /> Controle de Insumos & Estoque
              </h3>
              <span className="text-xs text-slate-400">5 itens monitorados</span>
            </div>

            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-[#080b17] border border-white/5 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-slate-400 text-[11px]">{item.category} • {item.supplier}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-extrabold text-white block">{item.quantity} {item.unit}</span>
                      <span className="text-[10px] text-slate-500">Mínimo: {item.min_quantity}</span>
                    </div>
                    {item.status === 'low' && (
                      <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-lg">Atenção</span>
                    )}
                    {item.status === 'critical' && (
                      <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-[10px] rounded-lg">Crítico</span>
                    )}
                    {item.status === 'ok' && (
                      <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] rounded-lg">OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-5 konnexy-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Atividades Recentes
            </h3>

            <div className="space-y-3">
              {[
                { time: '10:02', title: 'Agendamento Confirmado via WhatsApp', desc: 'Fernanda Lima confirmou Corte Feminino', icon: Bot, color: 'text-emerald-400' },
                { time: '09:45', title: 'Pagamento Confirmado', desc: 'R$ 180,00 referente ao comprovante #apt-1', icon: DollarSign, color: 'text-cyan-400' },
                { time: '09:12', title: 'Cliente Promovida a VIP', desc: 'Mariana Mendonça realizou sua 12ª visita', icon: Award, color: 'text-amber-400' },
                { time: '08:30', title: 'Alerta de Insumo Baixo', desc: 'Tintura Wella Illumina 8.69 restam 3 tubos', icon: AlertTriangle, color: 'text-rose-400' },
              ].map((feed, idx) => {
                const IconComponent = feed.icon;
                return (
                  <div key={idx} className="flex gap-3 p-2.5 rounded-xl hover:bg-[#080b17] text-xs transition-colors">
                    <div className={`p-2 rounded-xl bg-[#080b17] border border-white/5 ${feed.color} shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white">{feed.title}</h4>
                        <span className="text-[10px] text-slate-500">{feed.time}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{feed.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* EXPRESS COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateExpressCoupon} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" /> Cadastrar Cupom de Desconto
              </h3>
              <button type="button" onClick={() => setIsCouponModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PROMO20 ou VIP30"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white font-mono uppercase font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Percentual de Desconto (%)</label>
                <input
                  type="number"
                  required
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white font-bold focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsCouponModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20">
                Criar Cupom
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WHITE-LABEL BRAND MODAL */}
      {isWhiteLabelModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveWhiteLabel} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" /> Dados do Estabelecimento
              </h3>
              <button type="button" onClick={() => setIsWhiteLabelModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome Comercial</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={brandPhone}
                  onChange={(e) => setBrandPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={brandAddress}
                  onChange={(e) => setBrandAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsWhiteLabelModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
