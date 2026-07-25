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
    toast.success('Configurações White-Label da marca salvas!');
  };

  const handleNotifyVipPush = () => {
    toast.success('Notificação PUSH enviada para 12 Clientes VIP Ouro/Diamante!');
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
        
        {/* Top Header Bar with Unit Selector */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase">
              <Building2 className="w-3.5 h-3.5" /> Multi-Unidade White-Label
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {salon.name} - Painel Geral
            </h1>
            <p className="text-xs text-slate-500">
              Gestão comercial completa: IA Preditiva, Estoque, Vendas, Gráficos e Notificações.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Unit Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {units.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedUnitId === u.id
                      ? 'bg-[#C08497] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {u.name.split(' ')[1] || u.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportSummaryCSV}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800 shadow-sm"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* Quick Nav Sub-modules Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs font-bold">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-[#C08497] text-white shadow-sm shrink-0">
            Visão Geral & IA
          </Link>
          <Link href="/admin/whatsapp" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 shrink-0">
            <Bot className="w-3.5 h-3.5" /> WhatsApp & Gemini AI
          </Link>
          <Link href="/admin/calendario" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 shrink-0">
            FullCalendar
          </Link>
          <Link href="/admin/servicos" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 shrink-0">
            Serviços
          </Link>
          <Link href="/admin/profissionais" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 shrink-0">
            Equipe
          </Link>
          <Link href="/admin/clientes" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 shrink-0">
            CRM VIP
          </Link>
          <Link href="/admin/financeiro" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 shrink-0">
            Financeiro
          </Link>
        </div>

        {/* ADMIN QUICK ACTIONS BAR */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#F8F5F2] to-rose-50 dark:from-slate-900 dark:to-slate-800/90 border border-rose-200 dark:border-slate-700 space-y-3">
          <span className="text-xs font-extrabold text-[#8B5E83] dark:text-rose-300 uppercase tracking-wider block">
            ⚡ Central de Ações Rápidas do Administrador
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:bg-rose-50/50 shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-500" /> Encaixe de Emergência
            </button>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:bg-rose-50/50 shadow-sm"
            >
              <Tag className="w-4 h-4 text-[#C08497]" /> Criar Cupom Express
            </button>

            <button
              onClick={handleNotifyVipPush}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:bg-rose-50/50 shadow-sm"
            >
              <Bell className="w-4 h-4 text-blue-500" /> Notificar Clientes VIP
            </button>

            <button
              onClick={() => setIsWhiteLabelModalOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:bg-rose-50/50 shadow-sm"
            >
              <Settings className="w-4 h-4 text-[#8B5E83]" /> Marca White-Label
            </button>
          </div>
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

          {customAiAnswer && (
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-rose-400/30 text-xs text-rose-100 space-y-1 animate-in fade-in">
              <p className="leading-relaxed">{customAiAnswer}</p>
            </div>
          )}

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

        {/* 8 RICH KPI METRIC CARDS */}
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

        {/* INTERACTIVE VISUAL CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Revenue & Profit Monthly Bar Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C08497]" /> Evolução Mensal de Faturamento & Lucro
                </h3>
                <p className="text-xs text-slate-500">Desempenho consolidado dos últimos 6 meses</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-200">
                +24% Crescimento Médio
              </span>
            </div>

            {/* Visual Bar Graph Representation */}
            <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-100 dark:border-slate-800">
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
                      className="w-1/2 bg-gradient-to-t from-[#C08497] to-[#8B5E83] rounded-t-xl group-hover:opacity-90 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded font-bold whitespace-nowrap shadow z-10">
                        {formatCurrency(bar.revenue)}
                      </span>
                    </div>
                    {/* Profit Bar */}
                    <div 
                      style={{ height: bar.heightProf }} 
                      className="w-1/2 bg-emerald-500 rounded-t-xl group-hover:opacity-90 transition-all relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded font-bold whitespace-nowrap shadow z-10">
                        {formatCurrency(bar.profit)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{bar.month}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-[#C08497]" /> Receita Bruta Total
              </span>
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Lucro Líquido
              </span>
            </div>
          </div>

          {/* Revenue Distribution Category Breakdown */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#8B5E83]" /> Faturamento por Categoria
            </h3>

            <div className="space-y-4">
              {[
                { cat: 'Coloração & Mechas', pct: 42, color: 'bg-[#8B5E83]', val: 'R$ 22.008' },
                { cat: 'Cabelos & Penteados', pct: 31, color: 'bg-[#C08497]', val: 'R$ 16.244' },
                { cat: 'Estética & Facial', pct: 15, color: 'bg-emerald-500', val: 'R$ 7.860' },
                { cat: 'Unhas & Sobrancelhas', pct: 12, color: 'bg-amber-500', val: 'R$ 6.288' },
              ].map((item) => (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>{item.cat}</span>
                    <span>{item.pct}% ({item.val})</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-800 dark:text-white">💡 Insight Estratégico:</p>
              <p>Coloração & Mechas representa 42% da receita total. Recomenda-se treinar mais 1 colaborador para atender a alta demanda.</p>
            </div>
          </div>

        </div>

        {/* INVENTORY & SUPPLIES TRACKER + SALÃO LIVE FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inventory Tracker */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C08497]" /> Controle de Estoque & Insumos
              </h3>
              <span className="text-xs text-slate-400 font-medium">5 produtos monitorados</span>
            </div>

            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white block">{item.name}</span>
                    <span className="text-slate-400 text-[11px]">{item.category} • Fornecedor: {item.supplier}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{item.quantity} {item.unit}</span>
                      <span className="text-[10px] text-slate-400">Mínimo: {item.min_quantity}</span>
                    </div>
                    {item.status === 'low' && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg">Baixo</span>
                    )}
                    {item.status === 'critical' && (
                      <span className="px-2 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-lg">Crítico</span>
                    )}
                    {item.status === 'ok' && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg">OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salão Live Activity Feed */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Feed de Atividades ao Vivo
            </h3>

            <div className="space-y-3">
              {[
                { time: '10:02', title: 'Agendamento Confirmado via WhatsApp', desc: 'Fernanda Lima confirmou Corte Feminino com Gemini AI', icon: Bot, color: 'text-emerald-500' },
                { time: '09:45', title: 'Pagamento PIX Recebido', desc: 'R$ 180,00 referente ao comprovante #apt-1', icon: DollarSign, color: 'text-emerald-600' },
                { time: '09:12', title: 'Cliente Atingiu VIP Diamante', desc: 'Mariana Mendonça realizou sua 12ª visita', icon: Award, color: 'text-cyan-500' },
                { time: '08:30', title: 'Alerta de Estoque Baixo', desc: 'Tintura Wella Illumina 8.69 restam 3 tubos', icon: AlertTriangle, color: 'text-amber-500' },
              ].map((feed, idx) => {
                const IconComponent = feed.icon;
                return (
                  <div key={idx} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${feed.color} shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 dark:text-white">{feed.title}</h4>
                        <span className="text-[10px] text-slate-400">{feed.time}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{feed.desc}</p>
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateExpressCoupon} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#C08497]" /> Criar Cupom Express
              </h3>
              <button type="button" onClick={() => setIsCouponModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BELEZA15 ou VERAO20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Valor do Desconto (%)</label>
                <input
                  type="number"
                  required
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsCouponModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold">Criar Cupom</button>
            </div>
          </form>
        </div>
      )}

      {/* WHITE-LABEL BRAND MODAL */}
      {isWhiteLabelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveWhiteLabel} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#8B5E83]" /> Marca White-Label
              </h3>
              <button type="button" onClick={() => setIsWhiteLabelModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Salão / Estabelecimento</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Telefone / WhatsApp Comercial</label>
                <input
                  type="text"
                  required
                  value={brandPhone}
                  onChange={(e) => setBrandPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={brandAddress}
                  onChange={(e) => setBrandAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsWhiteLabelModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#8B5E83] text-white text-xs font-bold">Salvar Configurações</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
