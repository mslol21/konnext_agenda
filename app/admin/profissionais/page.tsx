'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Professional } from '@/types';
import { Users, Plus, Award, Clock, DollarSign, Edit, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfessionalsAdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(DataStore.getProfessionals());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#C08497]" /> Gestão da Equipe de Profissionais
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie a agenda individual, folgas, férias e taxas de comissão da equipe.
            </p>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map((pro) => (
            <div key={pro.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <img src={pro.photo_url} alt={pro.name} className="w-20 h-20 rounded-full object-cover mx-auto shadow-md border-2 border-[#C08497]" />
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">{pro.name}</h3>
                  <span className="text-xs text-[#8B5E83] font-semibold">{pro.specialty}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p><strong>Comissão:</strong> {pro.commission_rate}% por atendimento</p>
                  <p><strong>Horário:</strong> {pro.working_hours.start} às {pro.working_hours.end}</p>
                  <p><strong>Experiência:</strong> {pro.experience_years} anos</p>
                  <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">Ativo</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
