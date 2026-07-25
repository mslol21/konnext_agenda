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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Professional Switcher Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentPro.photo_url}
              alt={currentPro.name}
              className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-[#C08497]"
            />
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">
                Painel do Profissional: {currentPro.name}
              </h1>
              <p className="text-xs text-[#8B5E83] dark:text-rose-300 font-semibold">
                {currentPro.specialty} • Comissão: {currentPro.commission_rate}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Trocar Perfil:</span>
            <select
              value={selectedProId}
              onChange={(e) => setSelectedProId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
              <span>Atendimentos Hoje</span>
              <Calendar className="w-4 h-4 text-[#C08497]" />
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-white">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-slate-400">Clientes agendados para hoje</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
              <span>Comissão Acumulada</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">
              {formatCurrency(commissionEarned)}
            </p>
            <p className="text-[11px] text-slate-400">Baseado em {currentPro.commission_rate}% de comissão</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
              <span>Total Concluídos</span>
              <CheckCircle2 className="w-4 h-4 text-[#8B5E83]" />
            </div>
            <p className="text-3xl font-black text-[#8B5E83] dark:text-rose-300">
              {completedAppointments.length}
            </p>
            <p className="text-[11px] text-slate-400">Atendimentos finalizados com sucesso</p>
          </div>
        </div>

        {/* Schedule Timetable Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#C08497]" />
              Minha Agenda de Atendimentos
            </h2>
            <span className="text-xs bg-rose-50 text-[#8B5E83] px-3 py-1 rounded-full font-bold">
              Hoje: {formatDate(todayStr)}
            </span>
          </div>

          <div className="space-y-4">
            {proAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Nenhum agendamento encontrado para esta agenda.
              </div>
            ) : (
              proAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-[#F8F5F2]/40 dark:bg-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-[#C08497] text-white text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {apt.start_time} - {apt.end_time}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                        {apt.service_name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Cliente: <strong className="text-slate-800 dark:text-white">{apt.client_name}</strong> ({apt.client_phone})
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-amber-600 font-medium">Obs: {apt.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'in_progress')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar Atendimento
                      </button>
                    ) : null}

                    {apt.status === 'in_progress' ? (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar Atendimento
                      </button>
                    ) : null}

                    {apt.status === 'completed' && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
                        ✓ Concluído
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
