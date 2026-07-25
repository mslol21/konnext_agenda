'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DataStore } from '@/lib/store';
import { Appointment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar as CalendarIcon, Filter, Lock, Plus, RefreshCw, X } from 'lucide-react';
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
    backgroundColor: apt.service_color || '#C08497',
    borderColor: apt.service_color || '#8B5E83',
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-[#C08497]" /> Agenda FullCalendar
            </h1>
            <p className="text-xs text-slate-500">
              Visualize, arraste e solte atendimentos para reagendar em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filtrar Profissional:</span>
              <select
                value={selectedProFilter}
                onChange={(e) => setSelectedProFilter(e.target.value)}
                className="bg-transparent font-bold outline-none text-slate-800 dark:text-white"
              >
                <option value="all">Todos os Profissionais</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C08497] text-white text-xs font-bold flex items-center gap-1 shadow-md hover:bg-[#b37588]"
            >
              <Plus className="w-4 h-4" /> Novo Encaixe
            </button>
          </div>
        </div>

        {/* FullCalendar Container */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            editable={true}
            selectable={true}
            events={calendarEvents}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="auto"
            locale="pt-br"
          />
        </div>

      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-rose-100 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Detalhes do Agendamento
              </h3>
              <button onClick={() => setSelectedEvent(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Cliente:</strong> {selectedEvent.client_name} ({selectedEvent.client_phone})</p>
              <p><strong>Serviço:</strong> {selectedEvent.service_name}</p>
              <p><strong>Profissional:</strong> {selectedEvent.professional_name}</p>
              <p><strong>Data & Horário:</strong> {formatDate(selectedEvent.date)} às {selectedEvent.start_time}</p>
              <p><strong>Valor:</strong> {formatCurrency(selectedEvent.final_price)}</p>
              <p><strong>Status:</strong> {selectedEvent.status}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelSelected}
                className="flex-1 py-2.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200"
              >
                Cancelar Agendamento
              </button>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold"
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
