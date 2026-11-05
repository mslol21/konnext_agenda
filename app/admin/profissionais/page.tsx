'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Professional } from '@/types';
import { AdminNav } from '@/components/admin/AdminNav';
import { Users, Plus, Award, Clock, DollarSign, Edit, CheckCircle2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfessionalsAdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(DataStore.getProfessionals());

  return (
    <div className="min-h-screen pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="konnexy-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" /> Gestão da Equipe de Especialistas
            </h1>
            <p className="text-xs text-slate-400">
              Gerencie a escala individual, repasses de comissão, jornadas de trabalho e status operacional.
            </p>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map((pro) => (
            <div 
              key={pro.id} 
              className="konnexy-card rounded-2xl p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400 transition-all">
                  <img 
                    src={pro.photo_url} 
                    alt={pro.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {pro.name}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                    {pro.specialty}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs space-y-2 text-slate-300">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Comissão:</span>
                    <strong className="text-emerald-400 font-bold">{pro.commission_rate}% por serviço</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Expediente:</span>
                    <span className="text-white font-medium">{pro.working_hours.start} às {pro.working_hours.end}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Experiência:</span>
                    <span className="text-slate-300">{pro.experience_years} anos</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                      Ativo
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
