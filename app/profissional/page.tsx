'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Appointment, Professional } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  DollarSign, 
  UserCheck, 
  Lock, 
  Filter,
  Sparkles,
  Scissors
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfessionalPortalPage() {
  const professionals = DataStore.getProfessionals();
  const [selectedProId, setSelectedProId] = useState<string>(professionals[0]?.id || 'pro-1');
  const [appointments, setAppointments] = useState<Appointment[]>(DataStore.getAppointments());

  const currentPro = professionals.find((p) => p.id === selectedProId) || professionals[0];

  // Filter appointments for this professional
  const proAppointments = appointments.filter((a) => a.professional_id === currentPro.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = proAppointments.filter((a) => a.date === todayStr);

  // Status transitions
  const handleUpdateStatus = (aptId: string, status: Appointment['status']) => {
    const updated = DataStore.updateAppointmentStatus(aptId, status);
    setAppointments(updated);
    toast.success(`Status atualizado para: ${status}`);
  };

  // Commission calculations
  const completedAppointments = proAppointments.filter((a) => a.status === 'completed');
  const totalRevenueGenerated = completedAppointments.reduce((acc, curr) => acc + curr.final_price, 0);
  const commissionEarned = (totalRevenueGenerated * currentPro.commission_rate) / 100;

  return (
    <div className="workspace-page">
      <div className="workspace-page-stack space-y-6">
        
        {/* Top Professional Switcher Bar */}
        <div className="workspace-page-heading flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentPro.photo_url}
                alt={currentPro.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/40 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#080b17]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                Painel do Especialista: {currentPro.name}
              </h1>
              <p className="text-xs text-cyan-300 font-semibold">
                {currentPro.specialty} • Comissão: {currentPro.commission_rate}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Trocar Especialista:</span>
            <select
              value={selectedProId}
              onChange={(e) => setSelectedProId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#080b17] text-white text-xs font-bold shadow-sm focus:border-cyan-400 outline-none cursor-pointer"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#080b17] text-white">
                  {p.name} ({p.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="konnexy-card rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>Atendimentos Hoje</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-slate-500">Agendados para a data de hoje</p>
          </div>

          <div className="konnexy-card rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>Comissão Acumulada</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">
              {formatCurrency(commissionEarned)}
            </p>
            <p className="text-[11px] text-slate-500">Com base em {completedAppointments.length} serviços realizados</p>
          </div>

          <div className="konnexy-card rounded-2xl p-6 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>Jornada de Trabalho</span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {currentPro.working_hours.start} às {currentPro.working_hours.end}
            </p>
            <p className="text-[11px] text-slate-500">Intervalo de almoço às 12:00</p>
          </div>
        </div>

        {/* Today's Appointments Schedule */}
        <div className="konnexy-card rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-cyan-400" /> Fila de Atendimento do Dia
              </h2>
              <p className="text-xs text-slate-400">Atualize o status dos clientes à medida que forem atendidos.</p>
            </div>
            <span className="text-xs bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded-full">
              {todayAppointments.length} Clientes Hoje
            </span>
          </div>

          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm">Sem atendimentos agendados para hoje.</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl bg-[#080b17] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-cyan-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-sm text-center">
                      {apt.start_time}
                      <span className="block text-[10px] text-slate-500 font-normal">{apt.end_time}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{apt.client_name}</h4>
                        <span className="text-xs text-slate-400">({apt.client_phone})</span>
                      </div>
                      <p className="text-xs text-slate-300">{apt.service_name}</p>
                      {apt.notes && (
                        <p className="text-[11px] text-amber-300/80 italic font-medium">Nota: "{apt.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-emerald-400 block">{formatCurrency(apt.final_price)}</span>
                      <span className="text-[10px] text-slate-500">Comissão: {formatCurrency((apt.final_price * currentPro.commission_rate) / 100)}</span>
                    </div>

                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                        className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
                      >
                        Confirmar Presença
                      </button>
                    )}

                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'in_progress')}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar Procedimento
                      </button>
                    )}

                    {apt.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concluir Atendimento
                      </button>
                    )}

                    {apt.status === 'completed' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Finalizado
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
