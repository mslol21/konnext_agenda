'use client';

import React from 'react';
import { DataStore } from '@/lib/store';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Download, CreditCard, QrCode, FileText, CheckCircle2 } from 'lucide-react';

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
    exportToCSV(data, 'Relatorio_Financeiro_Konnexy');
  };

  return (
    <div className="workspace-page">
      <div className="workspace-page-stack space-y-6">
        
        {/* Header */}
        <div className="workspace-page-heading flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" /> Gestão Financeira & Relatórios
            </h1>
            <p className="text-xs text-slate-400">
              Receita consolidada, despesas estimadas, repasse de comissões e conciliação por método de pagamento.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#080b17] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Exportar Relatório CSV
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Faturamento Bruto</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-slate-500">Total faturado no período</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Custos Operacionais</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">{formatCurrency(estimatedExpenses)}</p>
            <p className="text-[11px] text-slate-500">Insumos e infraestrutura (~25%)</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Repasse de Comissões</span>
              <DollarSign className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-violet-300">{formatCurrency(totalCommissions)}</p>
            <p className="text-[11px] text-slate-500">Média de 40% para os profissionais</p>
          </div>

          <div className="konnexy-card rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>Lucro Líquido Real</span>
              <PieChart className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white">{formatCurrency(netProfit)}</p>
            <p className="text-[11px] text-slate-500">Margem final líquida do negócio</p>
          </div>
        </div>

        {/* Methods Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="konnexy-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
              <QrCode className="w-4 h-4 text-cyan-400" /> Recebimentos via PIX Instantâneo
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-black text-white">{formatCurrency(pixTotal)}</p>
                <p className="text-xs text-slate-400">Liquidação imediata sem taxa de operadora</p>
              </div>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
                Taxa Zero
              </span>
            </div>
          </div>

          <div className="konnexy-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard className="w-4 h-4 text-violet-400" /> Recebimentos via Cartões de Crédito/Débito
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-black text-white">{formatCurrency(cardTotal)}</p>
                <p className="text-xs text-slate-400">Conciliação automática via Gateway</p>
              </div>
              <span className="text-xs font-bold text-violet-300 bg-violet-950/60 border border-violet-500/30 px-3 py-1 rounded-full">
                Crédito & Débito
              </span>
            </div>
          </div>
        </div>

        {/* Recent Financial Transactions Table */}
        <div className="konnexy-card rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#0b1022] border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Extrato de Movimentações Recentes</h3>
            <span className="text-xs text-slate-400">{appointments.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080b17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-bold">
                <tr>
                  <th className="py-3.5 px-6">Identificador</th>
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Procedimento</th>
                  <th className="py-3.5 px-6">Data</th>
                  <th className="py-3.5 px-6">Valor</th>
                  <th className="py-3.5 px-6">Método</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {appointments.slice(0, 8).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-cyan-400">#{apt.id}</td>
                    <td className="py-3.5 px-6 text-white font-bold">{apt.client_name}</td>
                    <td className="py-3.5 px-6">{apt.service_name}</td>
                    <td className="py-3.5 px-6 text-slate-400">{apt.date}</td>
                    <td className="py-3.5 px-6 font-bold text-white">{formatCurrency(apt.final_price)}</td>
                    <td className="py-3.5 px-6 uppercase text-slate-400">{apt.payment_method || 'PIX'}</td>
                    <td className="py-3.5 px-6 text-right">
                      {apt.payment_status === 'paid' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          ✓ Pago
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          ● Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
