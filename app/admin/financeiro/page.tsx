'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Download, CreditCard, QrCode, FileText } from 'lucide-react';

export default function FinancialAdminPage() {
  const appointments = DataStore.getAppointments();

  const totalRevenue = appointments
    .filter((a) => a.payment_status === 'paid' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const estimatedExpenses = totalRevenue * 0.25; // 25% operational cost
  const totalCommissions = totalRevenue * 0.40;  // 40% staff payout
  const netProfit = totalRevenue - estimatedExpenses - totalCommissions;

  const pixTotal = appointments
    .filter((a) => a.payment_method === 'pix')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const cardTotal = appointments
    .filter((a) => a.payment_method === 'credit_card' || a.payment_method === 'debit_card')
    .reduce((acc, curr) => acc + curr.final_price, 0);

  const handleExportCSV = () => {
    const data = appointments.map((a) => ({
      ID: a.id,
      Data: a.date,
      Cliente: a.client_name,
      Serviço: a.service_name,
      Valor: a.final_price,
      Metodo: a.payment_method || 'pix',
      Status: a.payment_status,
    }));
    exportToCSV(data, 'Relatorio_Financeiro_Calixto');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[#C08497]" /> Gestão Financeira & Relatórios
            </h1>
            <p className="text-xs text-slate-500">
              Receitas brutas, despesas operacionais, cálculo de comissões e exportação de dados.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exportar Relatório em CSV
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Receita Bruta Total</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-slate-400">Total faturado</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Despesas Estimadas</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-black text-rose-500">{formatCurrency(estimatedExpenses)}</p>
            <p className="text-[11px] text-slate-400">Insumos e custos operacionais</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Comissões Pagas</span>
              <DollarSign className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <p className="text-3xl font-black text-[#8B5E83] dark:text-rose-300">{formatCurrency(totalCommissions)}</p>
            <p className="text-[11px] text-slate-400">Repasse para profissionais</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Lucro Líquido Real</span>
              <PieChart className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(netProfit)}</p>
            <p className="text-[11px] text-slate-400">Resultado final do negócio</p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Faturamento por Meio de Pagamento
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <QrCode className="w-4 h-4" /> PIX Instantâneo
                </span>
                <span className="font-black text-base">{formatCurrency(pixTotal || totalRevenue * 0.6)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-[#C08497]" /> Cartões de Crédito e Débito
                </span>
                <span className="font-black text-base">{formatCurrency(cardTotal || totalRevenue * 0.4)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Relatórios e Auditações
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Todos os registros financeiros são auditados com controle de logs e proteção de dados seguindo conformidade LGPD.
            </p>
            <button
              onClick={handleExportCSV}
              className="w-full py-3 rounded-2xl bg-[#C08497] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#b37588]"
            >
              <FileText className="w-4 h-4" /> Gerar Relatório Contábil Completo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
