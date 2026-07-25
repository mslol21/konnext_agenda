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

export interface SalonUnit {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_main: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  cost_price: number;
  supplier: string;
  status: 'ok' | 'low' | 'critical';
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
  buffer_minutes?: number;
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
  working_days: number[];
  working_hours: {
    start: string;
    end: string;
  };
  break_hours?: {
    start: string;
    end: string;
  };
  status: 'active' | 'vacation' | 'inactive';
  services: string[];
  commission_rate: number;
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
  tier?: 'padrao' | 'vip_ouro' | 'vip_diamante';
  color_formula?: string;
  allergies?: string;
  preferred_brands?: string;
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
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  discount: number;
  final_price: number;
  status: AppointmentStatus;
  notes?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'cash';
  before_image_url?: string;
  after_image_url?: string;
  authorized_publication?: boolean;
  confirmation_stage?: 'pending' | '48h' | '24h' | '2h' | 'confirmed';
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

export interface Review {
  id: string;
  appointment_id: string;
  client_name: string;
  client_avatar?: string;
  professional_name: string;
  service_name: string;
  rating: number;
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

export interface AIInsight {
  id: string;
  title: string;
  category: 'occupancy' | 'retention' | 'pricing' | 'marketing';
  insight: string;
  suggestion: string;
  metric?: string;
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
