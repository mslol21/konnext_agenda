'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DataStore } from '@/lib/store';
import { Service, Professional, Coupon, Appointment } from '@/types';
import { formatCurrency, downloadICS, cn } from '@/lib/utils';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Sparkles, 
  Scissors, 
  Tag, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Download,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BookingWizardModal() {
  const { bookingModalOpen, setBookingModalOpen, selectedServiceId, setSelectedServiceId, triggerRefresh } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Coupon & discount
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Available Time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (bookingModalOpen) {
      const allServices = DataStore.getServices();
      const allCats = DataStore.getCategories();
      const allPros = DataStore.getProfessionals();

      setServices(allServices);
      setCategories(allCats);
      setProfessionals(allPros);

      // Preselect service if specified
      if (selectedServiceId) {
        const found = allServices.find(s => s.id === selectedServiceId);
        if (found) {
          setSelectedService(found);
          setStep(2);
        }
      }

      // Default date to today or tomorrow
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    } else {
      // Reset state when closed
      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedTime('');
      setCreatedAppointment(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
    }
  }, [bookingModalOpen, selectedServiceId]);

  // Compute Available Slots when Professional + Date + Service change
  useEffect(() => {
    if (!selectedService || !selectedDate || !selectedProfessional) {
      setAvailableTimeSlots([]);
      return;
    }

    const duration = selectedService.duration_minutes || 60;
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Check if professional works on this day
    if (!selectedProfessional.working_days.includes(dayOfWeek)) {
      setAvailableTimeSlots([]);
      return;
    }

    const slots: string[] = [];
    const startHour = parseInt(selectedProfessional.working_hours.start.split(':')[0], 10);
    const endHour = parseInt(selectedProfessional.working_hours.end.split(':')[0], 10);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of ['00', '30']) {
        const slotStart = `${hour.toString().padStart(2, '0')}:${min}`;
        
        // Calculate slot end time
        const totalMinutes = hour * 60 + parseInt(min, 10) + duration;
        const endH = Math.floor(totalMinutes / 60);
        const endM = totalMinutes % 60;
        const slotEnd = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        if (endH > endHour) continue; // exceed working hours

        // Check for break time overlap
        if (selectedProfessional.break_hours) {
          const bStart = selectedProfessional.break_hours.start;
          const bEnd = selectedProfessional.break_hours.end;
          if ((slotStart >= bStart && slotStart < bEnd) || (slotEnd > bStart && slotEnd <= bEnd)) {
            continue;
          }
        }

        // Check for double booking conflict in DataStore
        const isFree = DataStore.checkSlotAvailable(selectedProfessional.id, selectedDate, slotStart, slotEnd);
        if (isFree) {
          slots.push(slotStart);
        }
      }
    }

    setAvailableTimeSlots(slots);
  }, [selectedService, selectedProfessional, selectedDate]);

  if (!bookingModalOpen) return null;

  // Filtered Services
  const filteredServices = services.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category_id === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter Pros that can perform the selected service
  const filteredProfessionals = selectedService 
    ? professionals.filter(p => p.services.includes(selectedService.id) || p.services.length === 0)
    : professionals;

  // Validate & Apply Coupon
  const handleApplyCoupon = () => {
    if (!couponCode || !selectedService) return;
    const res = DataStore.validateCoupon(couponCode, selectedService.price);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discount);
      toast.success(`Cupom ${res.coupon.code} aplicado com sucesso! -${formatCurrency(res.discount)}`);
    } else {
      toast.error(res.message || 'Cupom inválido');
    }
  };

  // Submit Final Booking
  const handleFinalSubmit = () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clientName || !clientPhone || !clientEmail) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    // Calculate end time
    const [h, m] = selectedTime.split(':').map(Number);
    const totalM = h * 60 + m + selectedService.duration_minutes;
    const endH = Math.floor(totalM / 60).toString().padStart(2, '0');
    const endM = (totalM % 60).toString().padStart(2, '0');
    const endTimeStr = `${endH}:${endM}`;

    const finalPrice = Math.max(0, selectedService.price - discountAmount);

    const result = DataStore.createAppointment({
      salon_id: 'salon-1',
      client_id: `cli-${Date.now()}`,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      professional_id: selectedProfessional.id,
      professional_name: selectedProfessional.name,
      professional_photo: selectedProfessional.photo_url,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_price: selectedService.price,
      service_duration: selectedService.duration_minutes,
      service_color: selectedService.color,
      date: selectedDate,
      start_time: selectedTime,
      end_time: endTimeStr,
      price: selectedService.price,
      discount: discountAmount,
      final_price: finalPrice,
      status: 'confirmed',
      notes: notes,
      payment_status: 'pending',
    });

    setIsSubmitting(false);

    if (result.success && result.appointment) {
      setCreatedAppointment(result.appointment);
      setStep(6);
      triggerRefresh();
      toast.success('Agendamento realizado com sucesso!');
    } else {
      toast.error(result.message || 'Erro ao realizar agendamento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#F8F5F2] to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C08497]/15 text-[#C08497] flex items-center justify-center font-bold">
              {step < 6 ? `${step}/5` : <Check className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {step === 1 && '1. Escolha o Serviço'}
                {step === 2 && '2. Escolha o Profissional'}
                {step === 3 && '3. Escolha a Data'}
                {step === 4 && '4. Escolha o Horário'}
                {step === 5 && '5. Seus Dados & Confirmação'}
                {step === 6 && '✨ Agendamento Confirmado!'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 && 'Selecione o procedimento desejado'}
                {step === 2 && 'Escolha quem cuidará da sua beleza'}
                {step === 3 && 'Selecione o dia ideal'}
                {step === 4 && 'Horários livres atualizados em tempo real'}
                {step === 5 && 'Insira suas informações de contato'}
                {step === 6 && 'Tudo pronto! Te esperamos no salão.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div 
            className="bg-gradient-to-r from-[#C08497] to-[#8B5E83] h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Wizard Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                    selectedCategory === 'all'
                      ? "bg-[#C08497] text-white shadow-md shadow-rose-200"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  )}
                >
                  Todos os Serviços
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                      selectedCategory === cat.id
                        ? "bg-[#C08497] text-white shadow-md shadow-rose-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map(srv => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                        isSelected
                          ? "border-[#C08497] bg-rose-50/50 dark:bg-slate-800/90 ring-2 ring-[#C08497]/30 shadow-md"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-200 hover:shadow-md"
                      )}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={srv.image_url} 
                          alt={srv.name} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
                        />
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-[#C08497] transition-colors">
                            {srv.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {srv.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C08497]" />
                            {srv.duration_minutes} min
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-[#8B5E83] dark:text-rose-300">
                            {formatCurrency(srv.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT PROFESSIONAL */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Serviço selecionado: <strong className="text-[#8B5E83]">{selectedService?.name}</strong> ({selectedService?.duration_minutes} min - {formatCurrency(selectedService?.price || 0)})
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProfessionals.map(pro => {
                  const isSelected = selectedProfessional?.id === pro.id;
                  return (
                    <div
                      key={pro.id}
                      onClick={() => setSelectedProfessional(pro)}
                      className={cn(
                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                        isSelected
                          ? "border-[#C08497] bg-rose-50/60 dark:bg-slate-800 ring-2 ring-[#C08497]/30 shadow-md"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-200 hover:shadow-md"
                      )}
                    >
                      <img 
                        src={pro.photo_url} 
                        alt={pro.name} 
                        className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white dark:border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-[#8B5E83] dark:text-rose-300 font-medium">
                          {pro.specialty}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {pro.experience_years} anos de experiência
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE */}
          {step === 3 && (
            <div className="space-y-4 max-w-md mx-auto">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                Selecione a Data para o Atendimento
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-[#C08497] outline-none shadow-sm"
              />

              {selectedProfessional && (
                <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#8B5E83] dark:text-rose-300">
                    <CalendarIcon className="w-4 h-4" />
                    Horário de Atendimento de {selectedProfessional.name}:
                  </div>
                  <p>Segunda a Sábado: {selectedProfessional.working_hours.start} às {selectedProfessional.working_hours.end}</p>
                  <p className="text-slate-400">Intervalo de almoço: {selectedProfessional.break_hours?.start} - {selectedProfessional.break_hours?.end}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SELECT TIME SLOT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <span>Data: <strong className="text-slate-800 dark:text-white">{selectedDate}</strong></span>
                <span>Profissional: <strong className="text-[#8B5E83]">{selectedProfessional?.name}</strong></span>
              </div>

              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-rose-50/40 dark:bg-slate-800/40 rounded-2xl border border-dashed border-rose-200">
                  <AlertCircle className="w-10 h-10 text-[#C08497] mx-auto" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    Nenhum horário livre para este dia
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Todos os horários de {selectedProfessional?.name} para {selectedDate} foram preenchidos ou o salão estará fechado. Por favor, volte e escolha outra data.
                  </p>
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl bg-[#C08497] text-white text-xs font-semibold"
                  >
                    Escolher Outra Data
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Smart Recommendation Highlight */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#C08497]/15 to-[#8B5E83]/15 border border-[#C08497]/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B5E83] dark:text-rose-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C08497]" /> Sugestão Inteligente de Melhor Horário:
                    </span>
                    <button
                      onClick={() => setSelectedTime(availableTimeSlots[0])}
                      className="px-3 py-1 rounded-xl bg-[#C08497] text-white text-xs font-bold shadow-sm hover:bg-[#b37588]"
                    >
                      {availableTimeSlots[0]} (Recomendado)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availableTimeSlots.map((time, idx) => {
                      const isSelected = selectedTime === time;
                      const isRecommended = idx === 0;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-3 px-2 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 relative",
                            isSelected
                              ? "border-[#C08497] bg-gradient-to-br from-[#C08497] to-[#8B5E83] text-white shadow-md scale-105"
                              : isRecommended
                              ? "border-[#C08497] bg-rose-50/80 dark:bg-slate-800 text-slate-800 dark:text-white"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
                          )}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {time}
                          {isRecommended && !isSelected && (
                            <span className="text-[9px] text-[#8B5E83] dark:text-rose-300 font-extrabold">Recomendado</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: CLIENT DETAILS & CONFIRMATION */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#C08497]" /> Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda Silva"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-[#C08497] outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#C08497]" /> Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-[#C08497] outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#C08497]" /> E-mail para confirmação *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@exemplo.com.br"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-[#C08497] outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#C08497]" /> Observações (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Possuo sensibilidade no couro cabeludo ou preferência por café"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-[#C08497] outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Coupon Section */}
              <div className="p-4 rounded-2xl bg-[#F8F5F2] dark:bg-slate-800 space-y-3 border border-rose-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#C08497]" /> Possui Cupom de Desconto? (Tente: PRIMEIRA10 ou VIP50)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código do Cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm uppercase font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 rounded-xl bg-[#8B5E83] text-white text-xs font-bold hover:bg-[#744e6d]"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C08497]/15 to-[#8B5E83]/15 border border-[#C08497]/40 space-y-2 text-sm">
                <div className="flex justify-between text-slate-700 dark:text-slate-200 font-medium">
                  <span>Valor do Serviço ({selectedService?.name}):</span>
                  <span className="font-bold">{formatCurrency(selectedService?.price || 0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Desconto do Cupom ({appliedCoupon?.code}):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-rose-200 dark:border-slate-700 flex justify-between font-extrabold text-base text-[#8B5E83] dark:text-rose-300">
                  <span>Total Final:</span>
                  <span>{formatCurrency(Math.max(0, (selectedService?.price || 0) - discountAmount))}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION SUCCESS */}
          {step === 6 && createdAppointment && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  Agendamento Confirmado!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Sua vaga foi reservada com sucesso no sistema. Enviamos um e-mail de confirmação para <strong>{createdAppointment.client_email}</strong>.
                </p>
              </div>

              {/* Receipt Visual Ticket */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#F8F5F2] to-rose-50 dark:from-slate-800 dark:to-slate-800/90 border border-rose-200 dark:border-slate-700 text-left space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-rose-200/60 pb-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Konnexy Agenda</span>
                  <span className="text-xs bg-[#C08497] text-white px-2.5 py-0.5 rounded-full font-bold">
                    #{createdAppointment.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <p><strong className="text-slate-700 dark:text-slate-200">Cliente:</strong> {createdAppointment.client_name}</p>
                  <p><strong className="text-slate-700 dark:text-slate-200">Serviço:</strong> {createdAppointment.service_name}</p>
                  <p><strong className="text-slate-700 dark:text-slate-200">Profissional:</strong> {createdAppointment.professional_name}</p>
                  <p><strong className="text-slate-700 dark:text-slate-200">Data e Hora:</strong> {createdAppointment.date} às {createdAppointment.start_time}</p>
                  <p><strong className="text-[#8B5E83] dark:text-rose-300">Valor Total:</strong> {formatCurrency(createdAppointment.final_price)}</p>
                </div>
              </div>

              {/* Primary Action: Launch WhatsApp Cloud API Conversation */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Deseja atuar no atendimento automático via WhatsApp?
                </p>
                <a
                  href={`https://wa.me/5511987654321?text=${encodeURIComponent(`✨ *Olá! Gostaria de confirmar meu agendamento no Konnexy Agenda!*\n\n📋 *Código*: #${createdAppointment.id}\n👤 *Cliente*: ${createdAppointment.client_name}\n✂️ *Serviço*: ${createdAppointment.service_name}\n🌟 *Profissional*: ${createdAppointment.professional_name}\n🗓️ *Data*: ${createdAppointment.date} às ${createdAppointment.start_time}\n💰 *Valor*: R$ ${createdAppointment.final_price.toFixed(2)}\n\nPodem me confirmar os detalhes? Obrigado!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <MessageSquare className="w-4 h-4" /> 📲 Enviar Agendamento no WhatsApp Oficial
                </a>
              </div>

              {/* Sync Calendar Actions */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Adicionar ao seu Calendário:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(createdAppointment.service_name + ' - Konnexy Agenda')}&dates=${createdAppointment.date.replace(/-/g, '')}T${createdAppointment.start_time.replace(':', '')}00/${createdAppointment.date.replace(/-/g, '')}T${createdAppointment.end_time.replace(':', '')}00&details=${encodeURIComponent('Profissional: ' + createdAppointment.professional_name)}&location=${encodeURIComponent('Alameda Gabriel Monteiro da Silva, 1420 - Jardins')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm"
                  >
                    Google Calendar
                  </a>

                  <button
                    onClick={() => downloadICS(createdAppointment)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Apple / Outros (.ICS)
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#C08497] text-white text-xs font-bold hover:bg-[#b37588]"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Buttons */}
        {step < 6 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            ) : <div />}

            <div>
              {step === 1 && (
                <button
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md"
                >
                  Avançar Profissional <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  disabled={!selectedProfessional}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md"
                >
                  Avançar Data <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  disabled={!selectedDate}
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md"
                >
                  Ver Horários Livres <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  disabled={!selectedTime}
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C08497] to-[#8B5E83] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md"
                >
                  Confirmar Seus Dados <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 5 && (
                <button
                  disabled={isSubmitting || !clientName || !clientPhone || !clientEmail}
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {isSubmitting ? 'Reservando...' : 'Finalizar Agendamento'} <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
