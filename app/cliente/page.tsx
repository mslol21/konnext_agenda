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
  MessageSquare
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C08497] to-[#8B5E83] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              FL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  Fernanda Lima
                </h1>
                <span className="bg-rose-100 text-[#8B5E83] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Cliente VIP
                </span>
              </div>
              <p className="text-xs text-slate-500">fernanda.lima@gmail.com • (11) 97123-4567</p>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-[#C08497] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" /> Próximos Horários ({upcomingAppointments.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#C08497] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" /> Histórico ({pastAppointments.length})
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'loyalty'
                ? 'bg-[#C08497] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" /> Programa Fidelidade
          </button>
        </div>

        {/* TAB 1: UPCOMING APPOINTMENTS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <Calendar className="w-12 h-12 text-[#C08497] mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum agendamento futuro</h3>
                <p className="text-xs text-slate-500">Agende seu horário online em segundos.</p>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold"
                >
                  Agendar Agora
                </button>
              </div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-slate-800 text-[#C08497] flex items-center justify-center font-bold">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-800 dark:text-white">
                          {apt.service_name}
                        </h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">
                          {apt.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Profissional: <strong className="text-slate-700 dark:text-slate-300">{apt.professional_name}</strong>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#C08497]" /> {formatDate(apt.date)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#C08497]" /> {apt.start_time}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                    <button
                      onClick={() => downloadICS(apt)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" /> ICS
                    </button>

                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {pastAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 dark:text-white">
                      {apt.service_name}
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Data: {formatDate(apt.date)} com {apt.professional_name}</p>
                  <p className="text-xs font-bold text-[#8B5E83] dark:text-rose-300">
                    Valor Pago: {formatCurrency(apt.final_price)}
                  </p>
                </div>

                {apt.status === 'completed' && (
                  <button
                    onClick={() => handleOpenReview(apt)}
                    className="px-4 py-2 rounded-xl bg-[#8B5E83] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#744e6d]"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Deixar Avaliação
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: LOYALTY CARD */}
        {activeTab === 'loyalty' && (
          <div className="bg-gradient-to-br from-white to-[#F8F5F2] dark:from-slate-900 dark:to-slate-800/90 rounded-3xl p-8 border border-rose-100 dark:border-slate-700 shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                  Cartão Fidelidade Calixto
                </h3>
                <p className="text-xs text-slate-500">Junte 10 carimbos e ganhe 1 Hidratação Profunda Kérastase Grátis!</p>
              </div>
              <span className="text-2xl font-black text-[#8B5E83] dark:text-rose-300">
                7 / 10
              </span>
            </div>

            {/* Stamps Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isStamped = idx < 7;
                return (
                  <div
                    key={idx}
                    className={`h-16 rounded-2xl border-2 flex items-center justify-center font-bold text-sm transition-all ${
                      isStamped
                        ? 'border-[#C08497] bg-gradient-to-tr from-[#C08497] to-[#8B5E83] text-white shadow-md scale-105'
                        : 'border-dashed border-slate-200 dark:border-slate-700 text-slate-300 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {isStamped ? <Sparkles className="w-6 h-6" /> : idx + 1}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 italic text-center">
              Faltam apenas 3 atendimentos para resgatar sua premiação grátis.
            </p>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Avaliar Atendimento
              </h3>
              <p className="text-xs text-slate-500">
                Como foi sua experiência no serviço <strong>{targetAppointment?.service_name}</strong>?
              </p>

              {/* Stars Selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Escreva seu comentário..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold"
                >
                  Enviar Avaliação
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
