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
  const [waitlistTimer, setWaitlistTimer] = useState(600); // 10 minutes

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
    toast.success(`Notificação de vaga enviada para ${item.client_name}! Cronômetro de 10 min ativo.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C08497]/15 text-[#8B5E83] dark:text-rose-300 text-xs font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Recepção & Balcão Inteligente
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Painel do Recepcionista
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie atendimentos presenciais, fotos Antes/Depois e disparo de Lista de Espera.
            </p>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Novo Agendamento Manual
          </button>
        </div>

        {/* Waitlist Smart Banner */}
        {waitlist.length > 0 && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                  Lista de Espera Ativa ({waitlist.length} clientes aguardando vaga)
                </h4>
                <p className="text-xs text-slate-500">
                  Caso ocorra um cancelamento, dispare o alerta instantâneo com temporizador de 10 min.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNotifyWaitlist(waitlist[0])}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
            >
              Notificar {waitlist[0]?.client_name.split(' ')[0]} (Vaga 14:30)
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do cliente, telefone ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-white font-medium"
          />
        </div>

        {/* Appointments Desk Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Atendimentos Registrados
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Total: {filteredAppointments.length} agendamentos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Serviço & Profissional</th>
                  <th className="py-3.5 px-6">Data / Horário</th>
                  <th className="py-3.5 px-6">Valor</th>
                  <th className="py-3.5 px-6">Pagamento</th>
                  <th className="py-3.5 px-6 text-right">Ações Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">
                      <div>{apt.client_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{apt.client_phone}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">
                      <div className="font-semibold text-[#8B5E83] dark:text-rose-300">{apt.service_name}</div>
                      <div className="text-[11px] text-slate-500">com {apt.professional_name}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                      <div>{formatDate(apt.date)}</div>
                      <div className="text-[11px] text-[#C08497] font-bold">{apt.start_time} - {apt.end_time}</div>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">
                      {formatCurrency(apt.final_price)}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        apt.payment_status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Check-in
                        </button>
                      )}

                      {apt.payment_status === 'pending' && (
                        <button
                          onClick={() => setSelectedAptForPayment(apt)}
                          className="px-3 py-1.5 rounded-lg bg-[#8B5E83] hover:bg-[#744e6d] text-white font-bold text-[11px]"
                        >
                          Receber
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAptForPhotos(apt)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] hover:bg-purple-100"
                        title="Anexar Fotos Antes e Depois"
                      >
                        <Camera className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => generateReceiptPDF(apt)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-200"
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
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSavePhotos} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#C08497]" /> Fotos Antes & Depois
                </h3>
                <button type="button" onClick={() => setSelectedAptForPhotos(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200">URL Foto "Antes"</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/antes.jpg"
                    value={beforeUrl}
                    onChange={(e) => setBeforeUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200">URL Foto "Depois"</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/depois.jpg"
                    value={afterUrl}
                    onChange={(e) => setAfterUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="authCheck"
                    checked={authorizedPublication}
                    onChange={(e) => setAuthorizedPublication(e.target.checked)}
                    className="w-4 h-4 text-[#C08497] rounded"
                  />
                  <label htmlFor="authCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Cliente autorizou a publicação na galeria do site
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedAptForPhotos(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold">Salvar Fotos</button>
              </div>
            </form>
          </div>
        )}

        {/* Receive Payment Modal */}
        {selectedAptForPayment && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-5 border border-rose-100 dark:border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Receber Pagamento
              </h3>
              
              <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 space-y-1 text-xs">
                <p><strong>Cliente:</strong> {selectedAptForPayment.client_name}</p>
                <p><strong>Serviço:</strong> {selectedAptForPayment.service_name}</p>
                <p className="text-sm font-extrabold text-[#8B5E83] dark:text-rose-300 pt-1">
                  Valor a Cobrar: {formatCurrency(selectedAptForPayment.final_price)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      paymentMethod === 'pix' ? 'border-[#C08497] bg-rose-50 text-[#C08497]' : 'border-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> PIX Instantâneo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      paymentMethod === 'credit_card' ? 'border-[#C08497] bg-rose-50 text-[#C08497]' : 'border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Cartão de Crédito
                  </button>
                </div>
              </div>

              {paymentMethod === 'pix' && (
                <div className="text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                  <div className="w-32 h-32 bg-slate-900 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xs">
                    [QR CODE PIX]
                  </div>
                  <p className="text-[11px] text-slate-500">Chave PIX: financeiro@konnexyagenda.com.br</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptForPayment(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
