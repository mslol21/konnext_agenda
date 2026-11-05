'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DataStore } from '@/lib/store';
import { Appointment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar as CalendarIcon, Filter, Lock, Plus, RefreshCw, X, Clock, User, Scissors, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '@/contexts/AppContext';

export default function AdminCalendarPage() {
  const { setBookingModalOpen } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>(DataStore.getAppointments());
  const [selectedProFilter, setSelectedProFilter] = useState<string>('all');
  const professionals = DataStore.getProfessionals();

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  const filteredAppointments = selectedProFilter === 'all'
    ? appointments
    : appointments.filter((a) => a.professional_id === selectedProFilter);

  // Map appointments to FullCalendar format
  const calendarEvents = filteredAppointments.map((apt) => ({
    id: apt.id,
    title: `${apt.client_name} - ${apt.service_name}`,
    start: `${apt.date}T${apt.start_time}:00`,
    end: `${apt.date}T${apt.end_time}:00`,
    backgroundColor: '#0d1122',
    borderColor: '#22d3ee',
    textColor: '#ffffff',
    extendedProps: apt,
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleEventDrop = (info: any) => {
    const aptId = info.event.id;
    const newStartStr = info.event.startStr;
    const newDate = newStartStr.split('T')[0];
    const newTime = newStartStr.split('T')[1].substring(0, 5);

    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) return;

    // Check slot availability
    const isFree = DataStore.checkSlotAvailable(apt.professional_id, newDate, newTime, apt.end_time, aptId);
    if (!isFree) {
      info.revert();
      toast.error('Este horário já está ocupado por outro atendimento!');
      return;
    }

    const updated = appointments.map((a) => {
      if (a.id === aptId) {
        return { ...a, date: newDate, start_time: newTime };
      }
      return a;
    });

    setAppointments(updated);
    toast.success(`Agendamento de ${apt.client_name} reagendado para ${newDate} às ${newTime}!`);
  };

  const handleCancelSelected = () => {
    if (!selectedEvent) return;
    const updated = DataStore.updateAppointmentStatus(selectedEvent.id, 'cancelled');
    setAppointments(updated);
    setSelectedEvent(null);
    toast.success('Agendamento cancelado com sucesso.');
  };

  return (
    <div className="workspace-page">
      <div className="workspace-page-stack space-y-6">
        
        {/* Header */}
        <div className="workspace-page-heading flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-cyan-400" /> Agenda de atendimentos
            </h1>
            <p className="text-xs text-slate-400">
              Visualize a grade de horários, arraste e solte atendimentos para reagendar em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#080b17] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filtrar:</span>
              <select
                value={selectedProFilter}
                onChange={(e) => setSelectedProFilter(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#080b17] text-white">Todos os Profissionais</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#080b17] text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Horário
            </button>
          </div>
        </div>

        {/* FullCalendar Card */}
        <div className="konnexy-card rounded-2xl p-6 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            editable={true}
            selectable={true}
            events={calendarEvents}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            locale="pt-br"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            height="auto"
          />
        </div>

      </div>

      {/* Selected Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-[#03050d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080b17] rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" /> Detalhes do Atendimento
              </h3>
              <button onClick={() => setSelectedEvent(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#0d1122] border border-white/5 space-y-1.5">
                <p className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-white">Cliente:</strong> {selectedEvent.client_name} ({selectedEvent.client_phone})
                </p>
                <p className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-violet-400" />
                  <strong className="text-white">Procedimento:</strong> {selectedEvent.service_name}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-white">Horário:</strong> {selectedEvent.date} das {selectedEvent.start_time} às {selectedEvent.end_time}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-white">Valor:</strong> <span className="text-emerald-400 font-bold">{formatCurrency(selectedEvent.final_price)}</span>
                </p>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400">Status atual:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold uppercase text-[10px]">
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleCancelSelected}
                className="flex-1 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold"
              >
                Cancelar Vaga
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0d1122] hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
