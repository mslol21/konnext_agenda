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

  // Concurrency & Hold state
  const [sessionToken, setSessionToken] = useState<string>('');
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [holdTimeLeft, setHoldTimeLeft] = useState<number>(300); // 5 min em segundos
  const [isHolding, setIsHolding] = useState(false);
  const [nextSuggestions, setNextSuggestions] = useState<Array<{ date: string; firstSlotTime: string }>>([]);

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

      // Gerar sessionToken único para esta tentativa de reserva
      const token = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      setSessionToken(token);
    } else {
      // Liberar hold se usuário fechar o modal
      if (sessionToken) {
        fetch(`/api/booking/hold?sessionToken=${sessionToken}`, { method: 'DELETE' }).catch(() => {});
      }

      // Reset state when closed
      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedTime('');
      setCreatedAppointment(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
      setHoldExpiresAt(null);
      setHoldTimeLeft(300);
    }
  }, [bookingModalOpen, selectedServiceId]);

  // Timer regressivo do Hold de 5 minutos
  useEffect(() => {
    if (!holdExpiresAt || step !== 5) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diffSeconds = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setHoldTimeLeft(diffSeconds);

      if (diffSeconds === 0) {
        clearInterval(interval);
        toast.error('O tempo de reserva de 5 minutos expirou. Por favor, revalide seu horário.');
        setStep(4);
        setHoldExpiresAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, step]);

  // Compute Available Slots when Professional + Date + Service change
  useEffect(() => {
    if (!selectedService || !selectedDate || !selectedProfessional) {
      setAvailableTimeSlots([]);
      setNextSuggestions([]);
      return;
    }

    let isCancelled = false;

    // Tentar consultar a API de disponibilidade com anti-conflito
    fetch(
      `/api/availability?tenantSlug=konnexy-demo&serviceId=${selectedService.id}&professionalId=${selectedProfessional.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success && data.data) {
          const apiSlots: string[] = data.data.slots.map((s: any) => s.time);
          setAvailableTimeSlots(apiSlots);
          if (data.data.nextAvailableSuggestions) {
            setNextSuggestions(data.data.nextAvailableSuggestions);
          } else {
            setNextSuggestions([]);
          }
          return;
        }
        // Fallback local se a API retornar erro de conexão
        computeLocalSlots();
      })
      .catch(() => {
        if (!isCancelled) {
          computeLocalSlots();
        }
      });

    function computeLocalSlots() {
      const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay();
      if (dayOfWeek === 0) {
        setAvailableTimeSlots([]);
        return;
      }

      const appointments = DataStore.getAppointments().filter(
        (a) => a.professional_id === selectedProfessional?.id && a.date === selectedDate && a.status !== 'cancelled'
      );

      const proStart = selectedProfessional?.working_hours?.start || '09:00';
      const proEnd = selectedProfessional?.working_hours?.end || '19:00';
      const [startH, startM] = proStart.split(':').map(Number);
      const [endH, endM] = proEnd.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const stepMin = 30;
      const duration = selectedService?.duration_minutes || 60;

      const slots: string[] = [];
      for (let time = startMinutes; time + duration <= endMinutes; time += stepMin) {
        if (selectedProfessional?.break_hours) {
          const [bStartH, bStartM] = selectedProfessional.break_hours.start.split(':').map(Number);
          const [bEndH, bEndM] = selectedProfessional.break_hours.end.split(':').map(Number);
          const bStart = bStartH * 60 + bStartM;
          const bEnd = bEndH * 60 + bEndM;
          if (time < bEnd && time + duration > bStart) {
            continue;
          }
        }

        const slotStartH = Math.floor(time / 60).toString().padStart(2, '0');
        const slotStartM = (time % 60).toString().padStart(2, '0');
        const slotTimeStr = `${slotStartH}:${slotStartM}`;
        const slotEndTotal = time + duration;
        const slotEndH = Math.floor(slotEndTotal / 60).toString().padStart(2, '0');
        const slotEndM = (slotEndTotal % 60).toString().padStart(2, '0');
        const slotEndTimeStr = `${slotEndH}:${slotEndM}`;

        const hasConflict = appointments.some((apt) => {
          return slotTimeStr < apt.end_time && slotEndTimeStr > apt.start_time;
        });

        if (!hasConflict) {
          slots.push(slotTimeStr);
        }
      }

      setAvailableTimeSlots(slots);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedService, selectedDate, selectedProfessional]);

  // Avançar para tela de dados criando o HOLD de 5 minutos
  const handleProceedToStep5WithHold = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) return;

    setIsHolding(true);

    const [h, m] = selectedTime.split(':').map(Number);
    const duration = selectedService.duration_minutes;
    const startIso = new Date(`${selectedDate}T${selectedTime}:00-03:00`).toISOString();
    const endTotalM = h * 60 + m + duration;
    const endH = Math.floor(endTotalM / 60).toString().padStart(2, '0');
    const endM = (endTotalM % 60).toString().padStart(2, '0');
    const endIso = new Date(`${selectedDate}T${endH}:${endM}:00-03:00`).toISOString();

    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: 'konnexy-demo',
          sessionToken,
          serviceId: selectedService.id,
          professionalId: selectedProfessional.id,
          startAt: startIso,
          endAt: endIso,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro.');
          // Atualiza lista de slots
          setAvailableTimeSlots((prev) => prev.filter((t) => t !== selectedTime));
          setSelectedTime('');
          return;
        }
      }

      // Hold confirmado por 5 minutos
      setHoldExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
      setHoldTimeLeft(300);
      setStep(5);
    } catch {
      // Se a rota falhar por estar offline, avança graciosamente
      setHoldExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
      setStep(5);
    } finally {
      setIsHolding(false);
    }
  };

  // Filter Services
  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category_id === selectedCategory;
    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter Professionals
  const filteredProfessionals = professionals;

  // Apply Coupon
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
  const handleFinalSubmit = async () => {
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

    const startIso = new Date(`${selectedDate}T${selectedTime}:00-03:00`).toISOString();
    const endIso = new Date(`${selectedDate}T${endTimeStr}:00-03:00`).toISOString();

    try {
      // 1. Chamar API de confirmação no banco Postgres
      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: 'konnexy-demo',
          sessionToken,
          customer: {
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            notes,
          },
          serviceId: selectedService.id,
          professionalId: selectedProfessional.id,
          startAt: startIso,
          endAt: endIso,
          notes,
          paymentMethod: 'pix',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(data.error || 'Conflito de horário detectado. Por favor, selecione outro horário.');
          setStep(4);
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallback em caso de offline
    }

    // 2. Registrar no DataStore local para manter reatividade dos portais da demo
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
      service_color: '#22d3ee',
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
      toast.success('Agendamento confirmado com sucesso!');
    } else {
      toast.error(result.message || 'Erro ao realizar agendamento.');
    }
  };

  if (!bookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#03050d]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#080b17] rounded-2xl shadow-2xl border border-white/10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0b1022] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {step < 6 ? `${step}/5` : <Check className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {step === 1 && '1. Selecione o Procedimento'}
                {step === 2 && '2. Selecione o Profissional'}
                {step === 3 && '3. Selecione a Data'}
                {step === 4 && '4. Selecione o Horário'}
                {step === 5 && '5. Seus Dados & Confirmação'}
                {step === 6 && '✨ Agendamento Confirmado!'}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1 && 'Escolha o serviço desejado com duração e valor transparentes'}
                {step === 2 && 'Selecione quem cuidará do seu atendimento'}
                {step === 3 && 'Selecione o melhor dia no calendário'}
                {step === 4 && 'Grade de horários sincronizada em tempo real'}
                {step === 5 && 'Preencha seus dados para receber o comprovante'}
                {step === 6 && 'Sua vaga está garantida no sistema!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(false)}
            aria-label="Fechar"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#050711] h-1">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Wizard Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                    selectedCategory === 'all'
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                      : "bg-[#0d1122] text-slate-400 hover:text-white border border-white/5"
                  )}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                        : "bg-[#0d1122] text-slate-400 hover:text-white border border-white/5"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredServices.map(srv => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group",
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-500/10"
                          : "border-white/5 bg-[#0b1022] hover:border-cyan-500/30"
                      )}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={srv.image_url} 
                          alt={srv.name} 
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                            {srv.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {srv.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {srv.duration_minutes} min
                        </span>
                        <span className="text-base font-extrabold text-cyan-400">
                          {formatCurrency(srv.price)}
                        </span>
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
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300">
                Procedimento: <strong className="text-cyan-300">{selectedService?.name}</strong> • {selectedService?.duration_minutes} min • {formatCurrency(selectedService?.price || 0)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredProfessionals.map(pro => {
                  const isSelected = selectedProfessional?.id === pro.id;
                  return (
                    <div
                      key={pro.id}
                      onClick={() => setSelectedProfessional(pro)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4",
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-500/10"
                          : "border-white/5 bg-[#0b1022] hover:border-cyan-500/30"
                      )}
                    >
                      <img 
                        src={pro.photo_url} 
                        alt={pro.name} 
                        className="w-14 h-14 rounded-full object-cover border border-cyan-500/30"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-cyan-300 font-medium">
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
              <label className="block text-sm font-bold text-white">
                Selecione a Data Desejada
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0d1122] text-white font-semibold focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none shadow-sm"
              />

              {selectedProfessional && (
                <div className="p-4 rounded-xl bg-[#0d1122] border border-white/5 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-cyan-300">
                    <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    Horário de Atendimento de {selectedProfessional.name}:
                  </div>
                  <p className="text-slate-400">Segunda a Sábado: {selectedProfessional.working_hours.start} às {selectedProfessional.working_hours.end}</p>
                  <p className="text-slate-500">Intervalo de almoço: {selectedProfessional.break_hours?.start} - {selectedProfessional.break_hours?.end}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SELECT TIME SLOT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex justify-between items-center bg-[#0d1122] p-3 rounded-xl border border-white/5">
                <span>Data: <strong className="text-white">{selectedDate}</strong></span>
                <span>Profissional: <strong className="text-cyan-300">{selectedProfessional?.name}</strong></span>
              </div>

              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-10 space-y-4 bg-[#0d1122] rounded-xl border border-dashed border-white/10 p-5">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">
                    Nenhum horário livre para este dia
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Os horários de {selectedProfessional?.name} para {selectedDate} foram preenchidos ou o estabelecimento estará fechado.
                  </p>

                  {nextSuggestions.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-white/5">
                      <p className="text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Próximas vagas disponíveis encontradas:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {nextSuggestions.map((sug) => (
                          <button
                            key={sug.date}
                            onClick={() => setSelectedDate(sug.date)}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <CalendarIcon className="w-3 h-3 text-cyan-400" />
                            <span>{sug.date} às {sug.firstSlotTime}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/50"
                    >
                      Escolher Outra Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Smart Recommendation Highlight */}
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Horário mais próximo recomendado:
                    </span>
                    <button
                      onClick={() => setSelectedTime(availableTimeSlots[0])}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-sm"
                    >
                      {availableTimeSlots[0]} (Recomendado)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {availableTimeSlots.map((time, idx) => {
                      const isSelected = selectedTime === time;
                      const isRecommended = idx === 0;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 relative min-h-[44px]",
                            isSelected
                              ? "border-cyan-400 bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold"
                              : isRecommended
                              ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
                              : "border-white/5 bg-[#0d1122] text-slate-300 hover:border-cyan-500/30 hover:text-white"
                          )}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{time}</span>
                          {isRecommended && !isSelected && (
                            <span className="text-[9px] text-cyan-400 font-extrabold">Top</span>
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
              {/* Hold Timer Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs shadow-sm">
                <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Horário reservado com exclusividade para você:
                </span>
                <span className="font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  {Math.floor(holdTimeLeft / 60).toString().padStart(2, '0')}:{(holdTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda Silva"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white placeholder:text-slate-500 text-sm font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none shadow-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white placeholder:text-slate-500 text-sm font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none shadow-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> E-mail para confirmação *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@exemplo.com.br"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white placeholder:text-slate-500 text-sm font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none shadow-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Observações (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Preferência por café ou necessidade específica"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1122] text-white placeholder:text-slate-500 text-sm font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Coupon Section */}
              <div className="p-4 rounded-xl bg-[#0d1122] space-y-2.5 border border-white/5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" /> Possui Cupom de Desconto? (Ex: PRIMEIRA10 ou VIP50)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código do Cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-[#080b17] text-white placeholder:text-slate-500 text-sm uppercase font-mono font-bold focus:border-cyan-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Valor do Procedimento ({selectedService?.name}):</span>
                  <span className="font-bold text-white">{formatCurrency(selectedService?.price || 0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Desconto do Cupom ({appliedCoupon?.code}):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between font-extrabold text-base text-cyan-300">
                  <span>Total Final:</span>
                  <span>{formatCurrency(Math.max(0, (selectedService?.price || 0) - discountAmount))}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION SUCCESS */}
          {step === 6 && createdAppointment && (
            <div className="text-center py-6 space-y-6">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  Agendamento Confirmado!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Sua vaga foi reservada com sucesso no sistema. Enviamos um e-mail com os detalhes para <strong>{createdAppointment.client_email}</strong>.
                </p>
              </div>

              {/* Receipt Visual Ticket */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#0d1122] border border-white/10 text-left space-y-3 shadow-lg">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">Konnexy Agenda</span>
                  <span className="text-xs bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                    #{createdAppointment.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong className="text-white">Cliente:</strong> {createdAppointment.client_name}</p>
                  <p><strong className="text-white">Procedimento:</strong> {createdAppointment.service_name}</p>
                  <p><strong className="text-white">Profissional:</strong> {createdAppointment.professional_name}</p>
                  <p><strong className="text-white">Data e Hora:</strong> {createdAppointment.date} às {createdAppointment.start_time}</p>
                  <p><strong className="text-cyan-400">Total:</strong> <span className="text-base font-extrabold text-cyan-400">{formatCurrency(createdAppointment.final_price)}</span></p>
                </div>
              </div>

              {/* Primary Action: Launch WhatsApp Cloud API */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                <p className="text-xs font-semibold text-emerald-300">
                  Deseja receber confirmação ou tirar dúvidas no WhatsApp?
                </p>
                <a
                  href={`https://wa.me/5511987654321?text=${encodeURIComponent(`✨ *Olá! Gostaria de confirmar meu agendamento no Konnexy Agenda!*\n\n📋 *Código*: #${createdAppointment.id}\n👤 *Cliente*: ${createdAppointment.client_name}\n✂️ *Serviço*: ${createdAppointment.service_name}\n🌟 *Profissional*: ${createdAppointment.professional_name}\n🗓️ *Data*: ${createdAppointment.date} às ${createdAppointment.start_time}\n💰 *Valor*: R$ ${createdAppointment.final_price.toFixed(2)}\n\nPodem me confirmar os detalhes? Obrigado!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  <span>Enviar Agendamento no WhatsApp Oficial</span>
                </a>
              </div>

              {/* Sync Calendar Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">
                  Salvar na sua agenda pessoal:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(createdAppointment.service_name + ' - Konnexy Agenda')}&dates=${createdAppointment.date.replace(/-/g, '')}T${createdAppointment.start_time.replace(':', '')}00/${createdAppointment.date.replace(/-/g, '')}T${createdAppointment.end_time.replace(':', '')}00&details=${encodeURIComponent('Profissional: ' + createdAppointment.professional_name)}&location=${encodeURIComponent('Alameda Gabriel Monteiro da Silva, 1420 - Jardins')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm min-h-[40px]"
                  >
                    Google Calendar
                  </a>

                  <button
                    onClick={() => downloadICS(createdAppointment)}
                    className="px-4 py-2 rounded-xl bg-[#0d1122] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 shadow-sm min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Apple / Outros (.ICS)
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/50"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Buttons */}
        {step < 6 && (
          <div className="p-4 bg-[#0b1022] border-t border-white/10 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-semibold flex items-center gap-1 min-h-[40px]"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            ) : <div />}

            <div>
              {step === 1 && (
                <button
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md shadow-cyan-500/20 min-h-[40px]"
                >
                  Avançar Profissional <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  disabled={!selectedProfessional}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md shadow-cyan-500/20 min-h-[40px]"
                >
                  Avançar Data <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  disabled={!selectedDate}
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md shadow-cyan-500/20 min-h-[40px]"
                >
                  Ver Horários Livres <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  disabled={!selectedTime || isHolding}
                  onClick={handleProceedToStep5WithHold}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-md shadow-cyan-500/20 min-h-[40px]"
                >
                  {isHolding ? 'Reservando Vaga...' : 'Confirmar Seus Dados'} <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 5 && (
                <button
                  disabled={isSubmitting || !clientName || !clientPhone || !clientEmail}
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-extrabold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20 min-h-[44px]"
                >
                  {isSubmitting ? 'Confirmando...' : 'Finalizar Agendamento'} <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
