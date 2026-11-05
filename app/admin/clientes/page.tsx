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
    <div className="workspace-page">
      <div className="workspace-page-stack space-y-6">
        
        {/* Header */}
        <div className="workspace-page-heading flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" /> CRM & Ficha Técnica de Clientes
            </h1>
            <p className="text-xs text-slate-400">
              Histórico de consumo, selos VIP, fórmulas de coloração, restrições e preferências.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, e-mail ou WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-[#080b17] text-white placeholder:text-slate-500 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Client Table Card */}
        <div className="konnexy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b1022] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10 font-bold">
                <tr>
                  <th className="py-4 px-6">Cliente & Contato</th>
                  <th className="py-4 px-6">Nível VIP</th>
                  <th className="py-4 px-6">Total Gasto</th>
                  <th className="py-4 px-6">Visitas</th>
                  <th className="py-4 px-6">Última Visita</th>
                  <th className="py-4 px-6 text-right">Ficha Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-sm block">{client.name}</span>
                        <span className="text-slate-400 text-xs block">{client.phone} • {client.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {client.tier === 'vip_diamante' && (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                          💎 Diamante
                        </span>
                      )}
                      {client.tier === 'vip_ouro' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          🌟 Ouro
                        </span>
                      )}
                      {(!client.tier || client.tier === 'padrao') && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                          Padrão
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400">
                      {formatCurrency(client.total_spent)}
                    </td>
                    <td className="py-4 px-6 text-white font-semibold">
                      {client.visits_count} atendimentos
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {client.last_visit ? formatDate(client.last_visit) : 'Recente'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenFicha(client)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* TECHNICAL FILE MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveFicha} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-lg space-y-4 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Ficha Técnica: {selectedClient.name}
                </h3>
                <span className="text-[11px] text-slate-400">{selectedClient.email} • {selectedClient.phone}</span>
              </div>
              <button type="button" onClick={() => setSelectedClient(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Fórmula de Coloração / Mechas</label>
                <input
                  type="text"
                  placeholder="Ex: 50g Wella Illumina 8.69 + 20g 9.1 + Ox 20vol + Olaplex"
                  value={colorFormula}
                  onChange={(e) => setColorFormula(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Alergias ou Restrições Químicas</label>
                <input
                  type="text"
                  placeholder="Ex: Sensibilidade a formaldeído ou pó descolorante"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Marcas e Produtos Preferidos</label>
                <input
                  type="text"
                  placeholder="Ex: Kérastase Nutritive, Olaplex N°3, Wella"
                  value={preferredBrands}
                  onChange={(e) => setPreferredBrands(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Anotações do Profissional</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Prefere atendimento silencioso ou café expresso sem açúcar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Salvar Ficha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
