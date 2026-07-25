export type Role = 'client' | 'professional' | 'receptionist' | 'admin';

export interface Salon {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  primary_color: string;
  accent_color: string;
  working_hours: {
    days: number[]; // 0 = Sunday, 1 = Monday...
    open: string;  // e.g. "08:00"
    close: string; // e.g. "20:00"
  };
  interval_minutes: number;
}

export interface Category {
  id: string;
  salon_id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
}

export interface Service {
  id: string;
  salon_id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url: string;
  color: string;
  is_active: boolean;
}

export interface Professional {
  id: string;
  salon_id: string;
  name: string;
  email: string;
  phone: string;
  photo_url: string;
  specialty: string;
  description: string;
  experience_years: number;
  instagram: string;
  working_days: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  working_hours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  break_hours?: {
    start: string; // "12:00"
    end: string;   // "13:00"
  };
  status: 'active' | 'vacation' | 'inactive';
  services: string[]; // Service IDs
  commission_rate: number; // e.g. 40 (%)
}

export interface Client {
  id: string;
  user_id?: string;
  salon_id: string;
  name: string;
  phone: string;
  email: string;
  birthday?: string;
  notes?: string;
  total_spent: number;
  visits_count: number;
  last_visit?: string;
  favorite_service_ids?: string[];
  created_at: string;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  professional_id: string;
  professional_name?: string;
  professional_photo?: string;
  service_id: string;
  service_name?: string;
  service_price?: number;
  service_duration?: number;
  service_color?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  price: number;
  discount: number;
  final_price: number;
  status: AppointmentStatus;
  notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'cash';
  created_at: string;
}

export interface BlockedTime {
  id: string;
  professional_id: string;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  reason: string;
}

export interface BlockedDate {
  id: string;
  salon_id: string;
  date: string;
  reason: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: 'pix' | 'credit_card' | 'debit_card' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  receipt_url?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  salon_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend?: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}

export interface LoyaltyCard {
  id: string;
  client_id: string;
  salon_id: string;
  total_stamps: number;
  stamps_needed: number; // Default 10
  reward_description: string; // e.g. "1 Hidratação Grátis"
  reward_unlocked: boolean;
}

export interface Review {
  id: string;
  appointment_id: string;
  client_name: string;
  client_avatar?: string;
  professional_name: string;
  service_name: string;
  rating: number; // 1 to 5
  comment: string;
  is_featured: boolean;
  created_at: string;
}

export interface WaitlistItem {
  id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  preferred_date: string;
  notes?: string;
  status: 'waiting' | 'notified' | 'scheduled';
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_role?: string;
  client_avatar: string;
  content: string;
  rating: number;
}

export interface NotificationItem {
  id: string;
  recipient_type: 'client' | 'professional' | 'admin';
  title: string;
  message: string;
  read: boolean;
  type: 'booking_created' | 'booking_cancelled' | 'reminder' | 'waitlist';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}
