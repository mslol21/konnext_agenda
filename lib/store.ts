import { 
  Salon, 
  Service, 
  Professional, 
  Client, 
  Appointment, 
  Coupon, 
  Review, 
  WaitlistItem,
  Category,
  AIInsight,
  SalonUnit,
  InventoryItem
} from '@/types';
import { 
  initialSalon, 
  initialCategories, 
  initialServices, 
  initialProfessionals, 
  initialClients, 
  initialAppointments, 
  initialCoupons, 
  initialReviews, 
  initialWaitlist,
  initialAIInsights,
  initialSalonUnits,
  initialInventory
} from './mock-data';

const STORAGE_KEYS = {
  SALON: 'konnexy_salon',
  UNITS: 'konnexy_units',
  INVENTORY: 'konnexy_inventory',
  SERVICES: 'konnexy_services',
  PROFESSIONALS: 'konnexy_professionals',
  CLIENTS: 'konnexy_clients',
  APPOINTMENTS: 'konnexy_appointments',
  COUPONS: 'konnexy_coupons',
  REVIEWS: 'konnexy_reviews',
  WAITLIST: 'konnexy_waitlist',
  ROLE: 'konnexy_user_role',
  AI_INSIGHTS: 'konnexy_ai_insights',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting ${key} in localStorage:`, err);
  }
}

export const DataStore = {
  // Salon & White Label Brand
  getSalon(): Salon {
    return getStored(STORAGE_KEYS.SALON, initialSalon);
  },
  updateSalon(salon: Salon): void {
    setStored(STORAGE_KEYS.SALON, salon);
  },

  // Units
  getUnits(): SalonUnit[] {
    return getStored(STORAGE_KEYS.UNITS, initialSalonUnits);
  },

  // Inventory
  getInventory(): InventoryItem[] {
    return getStored(STORAGE_KEYS.INVENTORY, initialInventory);
  },
  saveInventoryItem(item: InventoryItem): InventoryItem[] {
    const items = this.getInventory();
    const index = items.findIndex(i => i.id === item.id);
    let updated: InventoryItem[];
    if (index >= 0) {
      updated = [...items];
      updated[index] = item;
    } else {
      updated = [item, ...items];
    }
    setStored(STORAGE_KEYS.INVENTORY, updated);
    return updated;
  },

  // Categories
  getCategories(): Category[] {
    return initialCategories;
  },

  // Services
  getServices(): Service[] {
    return getStored(STORAGE_KEYS.SERVICES, initialServices);
  },
  saveService(service: Service): Service[] {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === service.id);
    let updated: Service[];
    if (index >= 0) {
      updated = [...services];
      updated[index] = service;
    } else {
      updated = [service, ...services];
    }
    setStored(STORAGE_KEYS.SERVICES, updated);
    return updated;
  },
  deleteService(serviceId: string): Service[] {
    const updated = this.getServices().filter(s => s.id !== serviceId);
    setStored(STORAGE_KEYS.SERVICES, updated);
    return updated;
  },

  // Professionals
  getProfessionals(): Professional[] {
    return getStored(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
  },
  saveProfessional(pro: Professional): Professional[] {
    const pros = this.getProfessionals();
    const index = pros.findIndex(p => p.id === pro.id);
    let updated: Professional[];
    if (index >= 0) {
      updated = [...pros];
      updated[index] = pro;
    } else {
      updated = [pro, ...pros];
    }
    setStored(STORAGE_KEYS.PROFESSIONALS, updated);
    return updated;
  },

  // Clients
  getClients(): Client[] {
    return getStored(STORAGE_KEYS.CLIENTS, initialClients);
  },
  saveClient(client: Client): Client[] {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    let updated: Client[];
    if (index >= 0) {
      updated = [...clients];
      updated[index] = client;
    } else {
      updated = [client, ...clients];
    }
    setStored(STORAGE_KEYS.CLIENTS, updated);
    return updated;
  },

  // Appointments
  getAppointments(): Appointment[] {
    return getStored(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  },
  
  checkSlotAvailable(professionalId: string, date: string, startTime: string, endTime: string, excludeId?: string): boolean {
    const pro = this.getProfessionals().find(p => p.id === professionalId);
    if (pro && pro.status === 'vacation') return false;

    const appointments = this.getAppointments();
    const conflicting = appointments.find(apt => {
      if (apt.id === excludeId) return false;
      if (apt.professional_id !== professionalId) return false;
      if (apt.date !== date) return false;
      if (apt.status === 'cancelled') return false;
      return (startTime < apt.end_time) && (endTime > apt.start_time);
    });

    return !conflicting;
  },

  createAppointment(aptData: Omit<Appointment, 'id' | 'created_at'>): { success: boolean; appointment?: Appointment; message?: string } {
    const isFree = this.checkSlotAvailable(
      aptData.professional_id, 
      aptData.date, 
      aptData.start_time, 
      aptData.end_time
    );

    if (!isFree) {
      return { 
        success: false, 
        message: 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.' 
      };
    }

    const newAppointment: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      confirmation_stage: 'pending',
      created_at: new Date().toISOString(),
    };

    const appointments = [newAppointment, ...this.getAppointments()];
    setStored(STORAGE_KEYS.APPOINTMENTS, appointments);

    // Update client record
    const clients = this.getClients();
    const existingClient = clients.find(c => c.email === aptData.client_email || c.phone === aptData.client_phone);
    if (existingClient) {
      existingClient.total_spent += aptData.final_price;
      existingClient.visits_count += 1;
      existingClient.last_visit = aptData.date;
      
      if (existingClient.visits_count >= 10 || existingClient.total_spent >= 1500) {
        existingClient.tier = 'vip_diamante';
      } else if (existingClient.visits_count >= 5 || existingClient.total_spent >= 500) {
        existingClient.tier = 'vip_ouro';
      }

      this.saveClient(existingClient);
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        salon_id: aptData.salon_id,
        name: aptData.client_name,
        phone: aptData.client_phone,
        email: aptData.client_email,
        total_spent: aptData.final_price,
        visits_count: 1,
        tier: 'padrao',
        last_visit: aptData.date,
        created_at: new Date().toISOString(),
      };
      this.saveClient(newClient);
    }

    return { success: true, appointment: newAppointment };
  },

  updateAppointmentStatus(id: string, status: Appointment['status'], paymentStatus?: Appointment['payment_status']): Appointment[] {
    const appointments = this.getAppointments().map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          status,
          payment_status: paymentStatus || apt.payment_status,
        };
      }
      return apt;
    });
    setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointments;
  },

  updateAppointmentPhotos(id: string, beforeUrl?: string, afterUrl?: string, authorized?: boolean): Appointment[] {
    const appointments = this.getAppointments().map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          before_image_url: beforeUrl || apt.before_image_url,
          after_image_url: afterUrl || apt.after_image_url,
          authorized_publication: authorized !== undefined ? authorized : apt.authorized_publication,
        };
      }
      return apt;
    });
    setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointments;
  },

  // Coupons
  getCoupons(): Coupon[] {
    return getStored(STORAGE_KEYS.COUPONS, initialCoupons);
  },
  saveCoupon(coupon: Coupon): Coupon[] {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.id === coupon.id);
    let updated: Coupon[];
    if (index >= 0) {
      updated = [...coupons];
      updated[index] = coupon;
    } else {
      updated = [coupon, ...coupons];
    }
    setStored(STORAGE_KEYS.COUPONS, updated);
    return updated;
  },
  validateCoupon(code: string, amount: number): { valid: boolean; coupon?: Coupon; discount: number; message?: string } {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupom inválido ou expirado.' };
    }

    if (coupon.min_spend && amount < coupon.min_spend) {
      return { valid: false, discount: 0, message: `Este cupom exige valor mínimo de R$ ${coupon.min_spend.toFixed(2)}.` };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    return { valid: true, coupon, discount };
  },

  // Reviews
  getReviews(): Review[] {
    return getStored(STORAGE_KEYS.REVIEWS, initialReviews);
  },
  addReview(review: Omit<Review, 'id' | 'created_at'>): Review[] {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    const updated = [newReview, ...this.getReviews()];
    setStored(STORAGE_KEYS.REVIEWS, updated);
    return updated;
  },

  // Waitlist
  getWaitlist(): WaitlistItem[] {
    return getStored(STORAGE_KEYS.WAITLIST, initialWaitlist);
  },
  addToWaitlist(item: Omit<WaitlistItem, 'id' | 'created_at' | 'status'>): WaitlistItem[] {
    const newItem: WaitlistItem = {
      ...item,
      id: `wait-${Date.now()}`,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...this.getWaitlist()];
    setStored(STORAGE_KEYS.WAITLIST, updated);
    return updated;
  },

  // AI Insights
  getAIInsights(): AIInsight[] {
    return getStored(STORAGE_KEYS.AI_INSIGHTS, initialAIInsights);
  },

  // User Role Switcher
  getUserRole(): 'client' | 'professional' | 'receptionist' | 'admin' {
    return getStored(STORAGE_KEYS.ROLE, 'admin');
  },
  setUserRole(role: 'client' | 'professional' | 'receptionist' | 'admin'): void {
    setStored(STORAGE_KEYS.ROLE, role);
  }
};
