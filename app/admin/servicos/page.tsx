'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Service } from '@/types';
import { formatCurrency } from '@/lib/utils';
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
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
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
      color: '#C08497',
      is_active: true,
    };

    const updated = DataStore.saveService(serviceObj);
    setServices(updated);
    setModalOpen(false);
    toast.success(editingService ? 'Serviço atualizado!' : 'Novo serviço cadastrado!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#C08497]" /> Gestão de Serviços
            </h1>
            <p className="text-xs text-slate-500">
              Cadastre e edite procedimentos, preços, tempo de execução e imagens.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Serviço
          </button>
        </div>

        {/* Services Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Imagem</th>
                  <th className="py-3.5 px-6">Nome do Serviço</th>
                  <th className="py-3.5 px-6">Categoria</th>
                  <th className="py-3.5 px-6">Duração</th>
                  <th className="py-3.5 px-6">Preço</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6">
                      <img src={srv.image_url} alt={srv.name} className="w-12 h-12 rounded-xl object-cover" />
                    </td>

                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-white">
                      {srv.name}
                      <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{srv.description}</p>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 font-semibold">
                      {srv.category_name}
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 inline text-[#C08497] mr-1" />
                      {srv.duration_minutes} min
                    </td>

                    <td className="py-3.5 px-6 font-extrabold text-[#8B5E83] dark:text-rose-300">
                      {formatCurrency(srv.price)}
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(srv)}
                        className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(srv.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveService} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Duração (minutos)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">URL da Imagem</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Descrição Detalhada</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold">Salvar Serviço</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
