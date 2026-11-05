'use client';

import React, { useState } from 'react';
import { DataStore } from '@/lib/store';
import { Appointment, WaitlistItem } from '@/types';
import { formatCurrency, formatDate, generateReceiptPDF } from '@/lib/utils';
import { 
  UserPlus, 
  Calendar, 
  Check, 
  CreditCard, 
  Printer, 
  Search, 
  Sparkles, 
  DollarSign, 
  Phone, 
  CheckCircle2,
  Clock,
  QrCode,
  Camera,
  Bell,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '@/contexts/AppContext';

export default function ReceptionDeskPage() {
  const { setBookingModalOpen } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>(DataStore.getAppointments());
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(DataStore.getWaitlist());
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Drawer Modal
  const [selectedAptForPayment, setSelectedAptForPayment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash'>('pix');

  // Before / After Photo Modal
  const [selectedAptForPhotos, setSelectedAptForPhotos] = useState<Appointment | null>(null);
  const [beforeUrl, setBeforeUrl] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [authorizedPublication, setAuthorizedPublication] = useState(true);

  // Waitlist Notification Simulation Modal
  const [activeWaitlistAlert, setActiveWaitlistAlert] = useState<WaitlistItem | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    return (
      apt.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.client_phone.includes(searchQuery) ||
      apt.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCheckIn = (aptId: string) => {
    const updated = DataStore.updateAppointmentStatus(aptId, 'confirmed');
    setAppointments(updated);
    toast.success('Check-in realizado! Presença do cliente confirmada.');
  };

  const handleConfirmPayment = () => {
    if (!selectedAptForPayment) return;
    const updated = DataStore.updateAppointmentStatus(
      selectedAptForPayment.id,
      selectedAptForPayment.status,
      'paid'
    );
    setAppointments(updated);
    toast.success(`Pagamento de ${formatCurrency(selectedAptForPayment.final_price)} confirmado via ${paymentMethod.toUpperCase()}!`);
    setSelectedAptForPayment(null);
  };

  const handleSavePhotos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForPhotos) return;

    const updated = DataStore.updateAppointmentPhotos(
      selectedAptForPhotos.id,
      beforeUrl,
      afterUrl,
      authorizedPublication
    );

    setAppointments(updated);
    setSelectedAptForPhotos(null);
    toast.success('Fotos Antes & Depois salvas com sucesso!');
  };

  const handleNotifyWaitlist = (item: WaitlistItem) => {
    setActiveWaitlistAlert(item);
    toast.success(`Notificação de vaga enviada para ${item.client_name}! Cronômetro ativo.`);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="konnexy-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Recepção & Concierge Konnexy
            </div>
            <h1 className="text-2xl font-black text-white">
              Painel de Recepção & Check-in
            </h1>
            <p className="text-xs text-slate-400">
              Confirmação presencial, emissão de recibos, pagamentos e gestão da lista de espera.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Novo Agendamento Balcão
            </button>
          </div>
        </div>

        {/* Live Waitlist Notification Alert Banner */}
        {waitlist.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-amber-300 text-sm">
                  Lista de Espera Inteligente ({waitlist.length} clientes aguardando)
                </h3>
                <p className="text-xs text-slate-300">
                  Próximo na fila: <strong>{waitlist[0].client_name}</strong> para {waitlist[0].service_name} ({waitlist[0].preferred_date})
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNotifyWaitlist(waitlist[0])}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
            >
              Disparar Vaga no WhatsApp
            </button>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#080b17] border border-white/10 max-w-md">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por cliente, WhatsApp ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent outline-none text-white placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Appointments Desk Table */}
        <div className="konnexy-card rounded-2xl overflow-hidden">
          <div className="p-5 bg-[#0b1022] border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white text-base">
              Atendimentos Registrados no Sistema
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Total: {filteredAppointments.length} agendamentos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080b17] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Procedimento & Profissional</th>
                  <th className="py-3.5 px-6">Data / Horário</th>
                  <th className="py-3.5 px-6">Valor</th>
                  <th className="py-3.5 px-6">Pagamento</th>
                  <th className="py-3.5 px-6 text-right">Ações da Recepção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{apt.client_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{apt.client_phone}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{apt.service_name}</div>
                      <div className="text-[11px] text-cyan-400">com {apt.professional_name}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-medium">
                      <div>{formatDate(apt.date)}</div>
                      <div className="text-[11px] text-cyan-400 font-bold">{apt.start_time} - {apt.end_time}</div>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-white">
                      {formatCurrency(apt.final_price)}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        apt.payment_status === 'paid' 
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400' 
                          : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                      }`}>
                        {apt.payment_status === 'paid' ? '✓ Pago' : '● Pendente'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition-all"
                        >
                          Check-in
                        </button>
                      )}

                      {apt.payment_status === 'pending' && (
                        <button
                          onClick={() => setSelectedAptForPayment(apt)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                        >
                          Cobrar
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAptForPhotos(apt)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#080b17] hover:bg-slate-800 text-cyan-400 border border-white/10 font-bold text-[11px] transition-all"
                        title="Anexar Fotos Antes e Depois"
                      >
                        <Camera className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => generateReceiptPDF(apt)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#080b17] hover:bg-slate-800 text-slate-300 border border-white/10 font-bold text-[11px] transition-all"
                        title="Imprimir Comprovante"
                      >
                        <Printer className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Before & After Photo Modal */}
        {selectedAptForPhotos && (
          <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSavePhotos} className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" /> Fotos Antes & Depois
                </h3>
                <button type="button" onClick={() => setSelectedAptForPhotos(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">URL Foto "Antes"</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/antes.jpg"
                    value={beforeUrl}
                    onChange={(e) => setBeforeUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">URL Foto "Depois"</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/depois.jpg"
                    value={afterUrl}
                    onChange={(e) => setAfterUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="authCheck"
                    checked={authorizedPublication}
                    onChange={(e) => setAuthorizedPublication(e.target.checked)}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-400 cursor-pointer"
                  />
                  <label htmlFor="authCheck" className="text-slate-300 font-semibold cursor-pointer">
                    Cliente autorizou a publicação no portfólio
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setSelectedAptForPhotos(null)} className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20">
                  Salvar Fotos
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Receive Payment Modal */}
        {selectedAptForPayment && (
          <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-5 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Receber Pagamento
              </h3>
              
              <div className="p-4 rounded-xl bg-[#0d1122] border border-white/5 space-y-1 text-xs">
                <p className="text-slate-300"><strong className="text-white">Cliente:</strong> {selectedAptForPayment.client_name}</p>
                <p className="text-slate-300"><strong className="text-white">Procedimento:</strong> {selectedAptForPayment.service_name}</p>
                <p className="text-base font-extrabold text-cyan-400 pt-1">
                  Valor a Cobrar: {formatCurrency(selectedAptForPayment.final_price)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      paymentMethod === 'pix' 
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' 
                        : 'border-white/10 bg-[#0d1122] text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> PIX Instantâneo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      paymentMethod === 'credit_card' 
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' 
                        : 'border-white/10 bg-[#0d1122] text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão
                  </button>
                </div>
              </div>

              {paymentMethod === 'pix' && (
                <div className="text-center py-4 bg-[#0d1122] rounded-xl border border-white/5 space-y-2">
                  <div className="w-28 h-28 bg-white text-slate-950 rounded-xl mx-auto flex items-center justify-center font-bold text-xs p-2">
                    <QrCode className="w-20 h-20 text-slate-950" />
                  </div>
                  <p className="text-[11px] text-slate-400">Chave PIX: financeiro@konnexyagenda.com.br</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedAptForPayment(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0d1122] text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
