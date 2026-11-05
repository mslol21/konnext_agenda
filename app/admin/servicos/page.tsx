'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Service } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { AdminNav } from '@/components/admin/AdminNav';
import { Scissors, Plus, Edit, Trash2, Clock, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>(DataStore.getServices());
  const categories = DataStore.getCategories();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [price, setPrice] = useState('180');
  const [duration, setDuration] = useState('60');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600');
  const [description, setDescription] = useState('');

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setName('');
    setPrice('180');
    setDuration('60');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setCategoryId(srv.category_id);
    setPrice(srv.price.toString());
    setDuration(srv.duration_minutes.toString());
    setImageUrl(srv.image_url);
    setDescription(srv.description);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      const updated = DataStore.deleteService(id);
      setServices(updated);
      toast.success('Serviço removido com sucesso.');
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === categoryId);

    const serviceObj: Service = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      salon_id: 'salon-1',
      category_id: categoryId,
      category_name: cat?.name || 'Geral',
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description,
      price: parseFloat(price) || 0,
      duration_minutes: parseInt(duration, 10) || 30,
      image_url: imageUrl,
      color: '#22d3ee',
      is_active: true,
    };

    const updated = DataStore.saveService(serviceObj);
    setServices(updated);
    setModalOpen(false);
    toast.success(editingService ? 'Serviço atualizado!' : 'Novo serviço cadastrado!');
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="konnexy-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-cyan-400" /> Gestão de Serviços & Cardápio
            </h1>
            <p className="text-xs text-slate-400">
              Cadastre e gerencie procedimentos, tempo de execução na grade e valores.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Serviço
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="konnexy-card rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img src={srv.image_url} alt={srv.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/30 to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-[#050711]/80 backdrop-blur-md border border-white/10 text-cyan-300 text-[10px] font-semibold">
                    {srv.category_name}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">{srv.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex justify-between items-center border-t border-white/5 pt-3 pb-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {srv.duration_minutes} min
                  </span>
                  <span className="text-base font-extrabold text-cyan-400">{formatCurrency(srv.price)}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleOpenEditModal(srv)}
                    className="flex-1 py-2 rounded-xl bg-[#080b17] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-cyan-400" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(srv.id)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveService} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-400" />
                {editingService ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte e Visagismo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#080b17] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white font-bold focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duração (min) *</label>
                  <input
                    type="number"
                    required
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white font-bold focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">URL da Fotografia</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Explique os benefícios e produtos utilizados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Salvar Procedimento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
