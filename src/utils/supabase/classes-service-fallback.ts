// Fallback Classes Service for development when Supabase backend is not available
// This provides mock data and simulated API responses

export interface ClassOccurrence {
  id: string;
  template_id: string;
  template?: {
    name: string;
    type: string;
    category: string;
    level: string;
    description: Record<string, string>;
    color?: string;
  };
  instructor_id: string;
  instructor?: {
    full_name: string;
    avatar_url?: string;
  };
  location_id: string;
  location?: {
    name: string;
    type: string;
    address?: string;
  };
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  booked_count: number;
  waitlist_count: number;
  status: 'scheduled' | 'cancelled' | 'completed' | 'moved';
  cancellation_reason?: string;
  weather_backup_used: boolean;
  slug: string;
}

export interface CreateClassWizardData {
  name: string;
  type: 'class' | 'workshop' | 'course' | 'private' | 'retreat' | 'hybrid';
  visibility: 'public' | 'unlisted' | 'private';
  description: Record<string, string>;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration_minutes: number;
  image_url?: string;
  color?: string;
  tags: string[];
  start_date: string;
  time_window_start: string;
  time_window_end: string;
  recurrence_pattern?: Record<string, any>;
  recurrence_end_date?: string;
  recurrence_end_count?: number;
  instructor_ids: string[];
  location_ids: string[];
  blackout_dates?: string[];
  default_price: number;
  pricing_tiers?: any[];
  credits_required?: number;
  dynamic_pricing_enabled?: boolean;
  dynamic_min_price?: number;
  dynamic_max_price?: number;
  capacity_override?: number;
  cancellation_hours?: number;
  late_cancel_fee?: number;
  no_show_fee?: number;
  sales_open_hours?: number;
  sales_close_hours?: number;
  publish_now?: boolean;
  scheduled_publish?: string;
  sales_channels?: string[];
}

export class ClassesServiceFallback {
  private mockOccurrences: ClassOccurrence[] = [
    {
      id: 'occ-1',
      template_id: 'template-1',
      template: {
        name: 'Morning Vinyasa Flow',
        type: 'class',
        category: 'Vinyasa',
        level: 'all_levels',
        description: { 'en-CH': 'Energizing flow to start your day' },
        color: '#3B82F6'
      },
      instructor_id: 'instructor-1',
      instructor: {
        full_name: 'Sarah Chen',
        avatar_url: undefined
      },
      location_id: 'location-1',
      location: {
        name: 'Studio A',
        type: 'room',
        address: 'Bahnhofstrasse 1, 8001 Zürich'
      },
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      end_time: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours from now
      price: 28.00,
      capacity: 20,
      booked_count: 16,
      waitlist_count: 2,
      status: 'scheduled',
      weather_backup_used: false,
      slug: 'morning-vinyasa-flow-2024-01-15'
    },
    {
      id: 'occ-2',
      template_id: 'template-2',
      template: {
        name: 'Hot Yoga Power',
        type: 'class',
        category: 'Hot Yoga',
        level: 'intermediate',
        description: { 'en-CH': 'Powerful heated yoga session' },
        color: '#EF4444'
      },
      instructor_id: 'instructor-2',
      instructor: {
        full_name: 'David Kumar',
        avatar_url: undefined
      },
      location_id: 'location-2',
      location: {
        name: 'Hot Studio',
        type: 'room',
        address: 'Bahnhofstrasse 1, 8001 Zürich'
      },
      start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      end_time: new Date(Date.now() + 7.5 * 60 * 60 * 1000).toISOString(), // 7.5 hours from now
      price: 32.00,
      capacity: 15,
      booked_count: 12,
      waitlist_count: 0,
      status: 'scheduled',
      weather_backup_used: false,
      slug: 'hot-yoga-power-2024-01-15'
    },
    {
      id: 'occ-3',
      template_id: 'template-3',
      template: {
        name: 'Outdoor Sunrise Yoga',
        type: 'class',
        category: 'Hatha',
        level: 'beginner',
        description: { 'en-CH': 'Gentle yoga in nature at sunrise' },
        color: '#F59E0B'
      },
      instructor_id: 'instructor-3',
      instructor: {
        full_name: 'Maya Patel',
        avatar_url: undefined
      },
      location_id: 'location-outdoor-1',
      location: {
        name: 'Lake Zurich Park',
        type: 'outdoor',
        address: 'Seefeld, 8008 Zürich'
      },
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow morning
      end_time: new Date(Date.now() + 25.25 * 60 * 60 * 1000).toISOString(),
      price: 25.00,
      capacity: 25,
      booked_count: 8,
      waitlist_count: 0,
      status: 'scheduled',
      weather_backup_used: false,
      slug: 'outdoor-sunrise-yoga-2024-01-16'
    }
  ];

  // Mock implementation of getClassOccurrences
  async getClassOccurrences(orgId: string, filters?: {
    start_date?: string;
    end_date?: string;
    instructor_id?: string;
    location_id?: string;
    template_id?: string;
    status?: string[];
  }): Promise<ClassOccurrence[]> {
    console.log('[ClassesServiceFallback] Returning mock class occurrences for orgId:', orgId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...this.mockOccurrences];
    
    if (filters?.start_date) {
      filtered = filtered.filter(occ => new Date(occ.start_time) >= new Date(filters.start_date!));
    }
    
    if (filters?.end_date) {
      filtered = filtered.filter(occ => new Date(occ.start_time) <= new Date(filters.end_date!));
    }
    
    if (filters?.instructor_id && filters.instructor_id !== 'all') {
      filtered = filtered.filter(occ => occ.instructor_id === filters.instructor_id);
    }
    
    if (filters?.location_id && filters.location_id !== 'all') {
      filtered = filtered.filter(occ => occ.location_id === filters.location_id);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(occ => filters.status!.includes(occ.status));
    }
    
    return filtered;
  }

  // Mock implementation of createClassWithWizard
  async createClassWithWizard(orgId: string, wizardData: CreateClassWizardData) {
    console.log('[ClassesServiceFallback] Creating mock class for orgId:', orgId, wizardData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newId = `template-${Date.now()}`;
    const template = {
      id: newId,
      name: wizardData.name,
      type: wizardData.type,
      category: wizardData.category,
      level: wizardData.level,
      description: wizardData.description,
      color: wizardData.color,
      org_id: orgId
    };
    
    const instance = {
      id: `instance-${Date.now()}`,
      template_id: newId,
      org_id: orgId,
      start_date: wizardData.start_date,
      time_window_start: wizardData.time_window_start,
      time_window_end: wizardData.time_window_end
    };
    
    // Create a mock occurrence
    const newOccurrence: ClassOccurrence = {
      id: `occ-${Date.now()}`,
      template_id: newId,
      template: {
        name: wizardData.name,
        type: wizardData.type,
        category: wizardData.category,
        level: wizardData.level,
        description: wizardData.description,
        color: wizardData.color
      },
      instructor_id: wizardData.instructor_ids[0] || 'instructor-1',
      instructor: {
        full_name: 'Default Instructor'
      },
      location_id: wizardData.location_ids[0] || 'location-1',
      location: {
        name: 'Default Location',
        type: 'room'
      },
      start_time: `${wizardData.start_date}T${wizardData.time_window_start}:00.000Z`,
      end_time: `${wizardData.start_date}T${wizardData.time_window_end}:00.000Z`,
      price: wizardData.default_price,
      capacity: wizardData.capacity_override || 20,
      booked_count: 0,
      waitlist_count: 0,
      status: 'scheduled',
      weather_backup_used: false,
      slug: `${wizardData.name.toLowerCase().replace(/\s+/g, '-')}-${wizardData.start_date}`
    };
    
    // Add to mock data
    this.mockOccurrences.push(newOccurrence);
    
    return {
      template,
      instance,
      occurrences: [newOccurrence],
      success: true
    };
  }

  // Mock implementation of cancelOccurrence
  async cancelOccurrence(occurrenceId: string, reason: string, notifyCustomers = true) {
    console.log('[ClassesServiceFallback] Cancelling mock occurrence:', occurrenceId, reason);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const occurrence = this.mockOccurrences.find(occ => occ.id === occurrenceId);
    if (occurrence) {
      occurrence.status = 'cancelled';
      occurrence.cancellation_reason = reason;
    }
    
    return {
      success: true,
      affected_registrations: occurrence?.booked_count || 0,
      total_refunds: (occurrence?.booked_count || 0) * (occurrence?.price || 0),
      reason
    };
  }
}

// Export singleton instance
export const classesServiceFallback = new ClassesServiceFallback();