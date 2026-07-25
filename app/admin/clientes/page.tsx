'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Client } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Search, Calendar, Heart, Award, Phone, Mail } from 'lucide-react';

export default function ClientsCRMPage() {
  const clients = DataStore.getClients();
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#C08497]" /> CRM de Clientes
            </h1>
            <p className="text-xs text-slate-500">
              Histórico de visitas, valor total gasto, notas preferências e datas de aniversário.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Nome do Cliente</th>
                  <th className="py-3.5 px-6">Contato</th>
                  <th className="py-3.5 px-6">Total de Visitas</th>
                  <th className="py-3.5 px-6">Valor Total Gasto</th>
                  <th className="py-3.5 px-6">Última Visita</th>
                  <th className="py-3.5 px-6">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredClients.map((cli) => (
                  <tr key={cli.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">
                      {cli.name}
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div>{cli.phone}</div>
                      <div className="text-[11px] text-slate-400">{cli.email}</div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">
                      {cli.visits_count} visitas
                    </td>

                    <td className="py-4 px-6 font-extrabold text-[#8B5E83] dark:text-rose-300">
                      {formatCurrency(cli.total_spent)}
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {cli.last_visit ? formatDate(cli.last_visit) : 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-slate-500 italic max-w-xs truncate">
                      {cli.notes || 'Sem observações'}
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
