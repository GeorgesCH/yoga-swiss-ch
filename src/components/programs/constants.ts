// Demo data and constants for Programs Management

export interface Program {
  id: string;
  title: string;
  category: 'coaching' | 'mobility' | 'reiki' | 'private_class' | 'therapy' | 'assessment' | 'consultation';
  instructor_name: string;
  instructor_id: string;
  status: 'active' | 'draft' | 'paused' | 'archived';
  visibility: 'public' | 'private' | 'by_link' | 'draft';
  total_bookings: number;
  confirmed_bookings: number;
  revenue: number;
  avg_rating: number;
  created_at: string;
  delivery_mode: 'in_person' | 'online' | 'hybrid';
  session_length_min: number;
  is_multi_session: boolean;
}

export interface Booking {
  id: string;
  program_id: string;
  program_title: string;
  customer_name: string;
  customer_email: string;
  instructor_name: string;
  variant_name: string;
  status: 'reserved' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'deposit_paid' | 'paid' | 'refunded';
  total_price: number;
  sessions_completed: number;
  total_sessions: number;
  booked_at: string;
  next_session_at?: string;
}

export const DEMO_PROGRAMS: Program[] = [
  {
    id: 'program-evolve-coaching',
    title: 'EVOLVE Holistic Life Coaching',
    category: 'coaching',
    instructor_name: 'Sarah Kumar',
    instructor_id: 'instructor-sarah',
    status: 'active',
    visibility: 'public',
    total_bookings: 23,
    confirmed_bookings: 18,
    revenue: 23040.00,
    avg_rating: 4.9,
    created_at: '2024-01-10T09:00:00Z',
    delivery_mode: 'hybrid',
    session_length_min: 90,
    is_multi_session: true
  },
  {
    id: 'program-split-flexibility',
    title: 'SPLIT Grand Écart Training',
    category: 'mobility',
    instructor_name: 'Elena Varga',
    instructor_id: 'instructor-elena',
    status: 'active',
    visibility: 'public',
    total_bookings: 15,
    confirmed_bookings: 12,
    revenue: 10080.00,
    avg_rating: 4.8,
    created_at: '2024-01-05T14:30:00Z',
    delivery_mode: 'in_person',
    session_length_min: 75,
    is_multi_session: true
  },
  {
    id: 'program-reiki-healing',
    title: 'Reiki Energy Healing Sessions',
    category: 'reiki',
    instructor_name: 'Maria Santos',
    instructor_id: 'instructor-maria',
    status: 'active',
    visibility: 'public',
    total_bookings: 45,
    confirmed_bookings: 42,
    revenue: 5040.00,
    avg_rating: 5.0,
    created_at: '2023-12-15T11:00:00Z',
    delivery_mode: 'in_person',
    session_length_min: 60,
    is_multi_session: false
  },
  {
    id: 'program-private-yoga',
    title: 'Private Yoga Instruction',
    category: 'private_class',
    instructor_name: 'David Chen',
    instructor_id: 'instructor-david',
    status: 'active',
    visibility: 'public',
    total_bookings: 32,
    confirmed_bookings: 28,
    revenue: 4200.00,
    avg_rating: 4.9,
    created_at: '2024-01-20T10:15:00Z',
    delivery_mode: 'hybrid',
    session_length_min: 60,
    is_multi_session: false
  }
];

export const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    program_id: 'program-evolve-coaching',
    program_title: 'EVOLVE Holistic Life Coaching',
    customer_name: 'Jennifer Meyer',
    customer_email: 'jennifer.meyer@email.com',
    instructor_name: 'Sarah Kumar',
    variant_name: '8-Session Transformation',
    status: 'in_progress',
    payment_status: 'paid',
    total_price: 1280.00,
    sessions_completed: 3,
    total_sessions: 8,
    booked_at: '2024-02-01T14:30:00Z',
    next_session_at: '2024-02-20T09:00:00Z'
  },
  {
    id: 'booking-2',
    program_id: 'program-split-flexibility',
    program_title: 'SPLIT Grand Écart Training',
    customer_name: 'Marcus Weber',
    customer_email: 'marcus.weber@email.com',
    instructor_name: 'Elena Varga',
    variant_name: 'Intermediate 12-Week Program',
    status: 'confirmed',
    payment_status: 'deposit_paid',
    total_price: 840.00,
    sessions_completed: 0,
    total_sessions: 12,
    booked_at: '2024-02-10T11:15:00Z',
    next_session_at: '2024-02-25T16:00:00Z'
  },
  {
    id: 'booking-3',
    program_id: 'program-reiki-healing',
    program_title: 'Reiki Energy Healing Sessions',
    customer_name: 'Sophie Laurent',
    customer_email: 'sophie.laurent@email.com',
    instructor_name: 'Maria Santos',
    variant_name: 'Single Reiki Session',
    status: 'completed',
    payment_status: 'paid',
    total_price: 120.00,
    sessions_completed: 1,
    total_sessions: 1,
    booked_at: '2024-02-05T09:45:00Z'
  }
];