'use client';

import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const appointments = DataStore.getAppointments();
  const clients = DataStore.getClients();
  const services = DataStore.getServices();
  const professionals = DataStore.getProfessionals();

  const totalRevenue = appointments
    .filter((a) => a.payment_status === 'paid' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  const totalCancelled = appointments.filter((a) => a.status === 'cancelled').length;
  const cancellationRate = appointments.length > 0 
    ? ((totalCancelled / appointments.length) * 100).toFixed(1) 
    : '0';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Painel Geral de Controle
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Dashboard Administrativo
            </h1>
            <p className="text-xs text-slate-500">
              Métricas comerciais, visão de agendamentos e controle financeiro do salão.
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
            Visão Geral
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
            CRM Clientes
          </Link>
          <Link href="/admin/financeiro" className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-rose-50">
            Financeiro & Relatórios
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Agendamentos Hoje</span>
              <Calendar className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {todayAppointments.length}
            </p>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15% em relação a ontem
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Total de Clientes</span>
              <Users className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {clients.length}
            </p>
            <p className="text-[11px] text-slate-400">Clientes cadastrados na base CRM</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Receita Acumulada</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-slate-400">Faturamento confirmado de agendamentos</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Taxa de Ocupação</span>
              <Award className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-[#8B5E83] dark:text-rose-300">
              88.4%
            </p>
            <p className="text-[11px] text-slate-400">Cancelamentos: {cancellationRate}%</p>
          </div>

        </div>

        {/* Grid Lists: Today's Appointments & Recent Activity */}
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
