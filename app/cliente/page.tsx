'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Appointment } from '@/types';
import { formatCurrency, formatDate, downloadICS } from '@/lib/utils';
import { 
  User, 
  Calendar, 
  Clock, 
  History, 
  Award, 
  Star, 
  XCircle, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  Download,
  MessageSquare,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '@/contexts/AppContext';

export default function ClientPortalPage() {
  const { setBookingModalOpen } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>(DataStore.getAppointments());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'loyalty' | 'reviews'>('upcoming');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const handleCancelAppointment = (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      const updated = DataStore.updateAppointmentStatus(id, 'cancelled');
      setAppointments(updated);
      toast.success('Agendamento cancelado com sucesso.');
    }
  };

  const handleOpenReview = (apt: Appointment) => {
    setTargetAppointment(apt);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppointment) return;

    DataStore.addReview({
      appointment_id: targetAppointment.id,
      client_name: targetAppointment.client_name,
      professional_name: targetAppointment.professional_name || 'Profissional',
      service_name: targetAppointment.service_name || 'Serviço',
      rating: rating,
      comment: reviewComment,
      is_featured: rating === 5,
    });

    setReviewModalOpen(false);
    setReviewComment('');
    toast.success('Avaliação enviada! Obrigado pelo feedback.');
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'in_progress'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Profile Card */}
        <div className="konnexy-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shadow-cyan-500/20">
              FL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Fernanda Lima
                </h1>
                <span className="bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  💎 Cliente VIP Diamante
                </span>
              </div>
              <p className="text-xs text-slate-400">fernanda.lima@gmail.com • (11) 97123-4567</p>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Próximos Agendamentos ({upcomingAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Procedimentos ({pastAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'loyalty'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Programa de Fidelidade</span>
          </button>
        </div>

        {/* TAB 1: UPCOMING APPOINTMENTS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="konnexy-card rounded-2xl p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhum agendamento futuro</h3>
                <p className="text-xs text-slate-400">Garanta seu procedimento com antecedência.</p>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs"
                >
                  Agendar Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="konnexy-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-cyan-400">Confirmado</span>
                          <h3 className="text-lg font-bold text-white">{apt.service_name}</h3>
                        </div>
                        <span className="text-base font-black text-cyan-400">{formatCurrency(apt.final_price)}</span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <p className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Profissional: <strong className="text-white">{apt.professional_name}</strong></span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Data e Horário: <strong className="text-white">{apt.date} às {apt.start_time}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => downloadICS(apt)}
                        className="flex-1 py-2 rounded-xl bg-[#080b17] hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" /> Calendário (.ICS)
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastAppointments.map((apt) => (
                <div key={apt.id} className="konnexy-card rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] uppercase font-bold ${apt.status === 'completed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                      </span>
                      <h3 className="text-base font-bold text-white">{apt.service_name}</h3>
                      <p className="text-xs text-slate-400">{apt.date} • {apt.professional_name}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-300">{formatCurrency(apt.final_price)}</span>
                  </div>

                  {apt.status === 'completed' && (
                    <button
                      onClick={() => handleOpenReview(apt)}
                      className="w-full py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Avaliar Atendimento
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LOYALTY */}
        {activeTab === 'loyalty' && (
          <div className="konnexy-card rounded-2xl p-8 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Programa de Vantagens Konnexy</h3>
              <p className="text-xs text-slate-400">Acumule pontos em cada visita e troque por procedimentos exclusivos.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#080b17] border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Saldo Atual</span>
                <span className="text-cyan-400 font-extrabold text-sm">340 Pontos</span>
              </div>
              <div className="w-full h-2.5 bg-[#0d1122] rounded-full overflow-hidden">
                <div className="w-[68%] h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
              </div>
              <p className="text-[11px] text-slate-500 text-left">Faltam 160 pontos para resgatar uma Hidratação Kérastase gratuita.</p>
            </div>
          </div>
        )}

      </div>

      {/* REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReview} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Avaliar Experiência
              </h3>
              <button type="button" onClick={() => setReviewModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Como foi seu procedimento de <strong>{targetAppointment?.service_name}</strong> com <strong>{targetAppointment?.professional_name}</strong>?
              </p>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nota (1 a 5 estrelas)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRating(st)}
                      className={`p-2 rounded-xl text-sm font-bold flex-1 border transition-all ${
                        rating >= st
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                          : 'bg-[#0d1122] border-white/5 text-slate-500'
                      }`}
                    >
                      ★ {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Seu Comentário</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Conte o que achou do atendimento..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
