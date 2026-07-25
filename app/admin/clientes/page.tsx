'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Client } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Search, Calendar, Heart, Award, Phone, Mail, FileText, Sparkles, X, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientsCRMPage() {
  const [clients, setClients] = useState<Client[]>(DataStore.getClients());
  const [search, setSearch] = useState('');

  // Technical File Modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [colorFormula, setColorFormula] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferredBrands, setPreferredBrands] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleOpenFicha = (client: Client) => {
    setSelectedClient(client);
    setColorFormula(client.color_formula || '');
    setAllergies(client.allergies || '');
    setPreferredBrands(client.preferred_brands || '');
    setNotes(client.notes || '');
  };

  const handleSaveFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const updatedClient: Client = {
      ...selectedClient,
      color_formula: colorFormula,
      allergies,
      preferred_brands: preferredBrands,
      notes,
    };

    const updatedList = DataStore.saveClient(updatedClient);
    setClients(updatedList);
    setSelectedClient(null);
    toast.success('Ficha técnica do cliente atualizada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#C08497]" /> CRM & Ficha Técnica de Clientes VIP
            </h1>
            <p className="text-xs text-slate-500">
              Histórico de consumo, selos VIP, fórmulas de tintas, alergias e marcas preferidas.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, e-mail ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Cliente & Nível VIP</th>
                  <th className="py-3.5 px-6">Contato</th>
                  <th className="py-3.5 px-6">Visitas / Consumo</th>
                  <th className="py-3.5 px-6">Fórmula de Cor & Alergias</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredClients.map((cli) => (
                  <tr key={cli.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-white space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{cli.name}</span>
                        {cli.tier === 'vip_diamante' && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-extrabold text-[10px]">
                            💎 VIP Diamante
                          </span>
                        )}
                        {cli.tier === 'vip_ouro' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                            🥇 VIP Ouro
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">Aniversário: {cli.birthday || 'Não informado'}</p>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div>{cli.phone}</div>
                      <div className="text-[11px] text-slate-400">{cli.email}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">
                      <div className="font-extrabold text-[#8B5E83] dark:text-rose-300">{formatCurrency(cli.total_spent)}</div>
                      <div className="text-[11px] text-slate-400">{cli.visits_count} visitas totais</div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 max-w-xs">
                      {cli.color_formula ? (
                        <div className="font-mono text-[11px] text-purple-600 dark:text-purple-300 font-bold truncate">
                          🎨 {cli.color_formula}
                        </div>
                      ) : <span className="text-slate-400">Sem fórmula</span>}
                      {cli.allergies && (
                        <div className="text-[10px] text-rose-500 font-semibold truncate">
                          ⚠️ {cli.allergies}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenFicha(cli)}
                        className="px-3 py-1.5 rounded-xl bg-[#C08497] text-white font-bold text-xs hover:bg-[#b37588] flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ficha Técnica
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Ficha Técnica Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveFicha} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C08497]" />
                Ficha Técnica: {selectedClient.name}
              </h3>
              <button type="button" onClick={() => setSelectedClient(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200">Fórmula da Coloração / Tinta</label>
                <input
                  type="text"
                  placeholder="Ex: Igora Royal 7.77 + 20vol (30g)"
                  value={colorFormula}
                  onChange={(e) => setColorFormula(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-purple-600 dark:text-purple-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200">Alergias e Sensibilidades</label>
                <input
                  type="text"
                  placeholder="Ex: Alergia a amônia ou fragrância forte"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200">Marcas de Preferência</label>
                <input
                  type="text"
                  placeholder="Ex: Kérastase, Olaplex, L'Oréal"
                  value={preferredBrands}
                  onChange={(e) => setPreferredBrands(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200">Observações Gerais</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setSelectedClient(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold">Salvar Ficha Técnica</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
