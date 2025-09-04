// Complete Classes Service for YogaSwiss - implements all classes module requirements
import { supabase } from './client';
import type { Database } from './schemas';

type Tables = Database['public']['Tables'];
type ClassTemplate = Tables['class_templates']['Row'];
type ClassInstance = Tables['class_instances']['Row'];
type ClassOccurrence = Tables['class_occurrences']['Row'];
type Registration = Tables['registrations']['Row'];
type WaitlistEntry = Tables['waitlist_entries']['Row'];
type PricingRule = Tables['pricing_rules']['Row'];
type Policy = Tables['policies']['Row'];
type Resource = Tables['resources']['Row'];
type VirtualSession = Tables['virtual_sessions']['Row'];

export interface CreateClassWizardData {
  // Step 1: Basics
  name: string;
  type: ClassTemplate['type'];
  visibility: ClassTemplate['visibility'];
  description: Record<string, string>;
  category: string;
  level: ClassTemplate['level'];
  duration_minutes: number;
  image_url?: string;
  color?: string;
  tags: string[];
  
  // Step 2: Scheduling
  start_date: string;
  time_window_start: string;
  time_window_end: string;
  recurrence_pattern?: Record<string, any>;
  recurrence_end_date?: string;
  recurrence_end_count?: number;
  instructor_ids: string[];
  location_ids: string[];
  blackout_dates?: string[];
  
  // Step 3: Pricing
  default_price: number;
  pricing_tiers?: Omit<PricingRule, 'id' | 'template_id' | 'org_id' | 'created_at' | 'updated_at'>[];
  credits_required?: number;
  dynamic_pricing_enabled?: boolean;
  dynamic_min_price?: number;
  dynamic_max_price?: number;
  
  // Step 4: Policies
  capacity_override?: number;
  cancellation_hours?: number;
  late_cancel_fee?: number;
  no_show_fee?: number;
  sales_open_hours?: number;
  sales_close_hours?: number;
  
  // Step 5: Publication
  publish_now?: boolean;
  scheduled_publish?: string;
  sales_channels?: string[];
}

export interface RecurringEditOptions {
  scope: 'this_occurrence' | 'future_occurrences' | 'all_occurrences';
  changes: Partial<ClassOccurrence>;
  migration_strategy?: 'rebook' | 'refund' | 'credit' | 'notify';
}

export interface MigrationPreview {
  affected_occurrences: ClassOccurrence[];
  affected_registrations: Registration[];
  conflicts: Array<{
    type: 'instructor' | 'location' | 'resource';
    occurrence_id: string;
    message: string;
  }>;
  impact_summary: {
    total_bookings: number;
    total_revenue: number;
    customers_to_notify: number;
  };
}

export interface BookingEligibility {
  eligible: boolean;
  reasons?: string[];
  membership_valid?: boolean;
  age_requirement_met?: boolean;
  prerequisites_met?: boolean;
  corporate_entitlement?: boolean;
  outstanding_dues?: number;
}

export interface WeatherRule {
  min_temperature_celsius: number;
  max_rain_mm: number;
  max_wind_kmh: number;
  backup_location_id: string;
  auto_move: boolean;
  notification_hours: number;
}

export class ClassesService {
  
  // ==================== TEMPLATE MANAGEMENT ====================
  
  async createClassTemplate(orgId: string, template: Tables['class_templates']['Insert']) {
    const { data, error } = await supabase
      .from('class_templates')
      .insert({ ...template, org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateClassTemplate(templateId: string, updates: Tables['class_templates']['Update']) {
    const { data, error } = await supabase
      .from('class_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getClassTemplates(orgId: string, filters?: {
    type?: ClassTemplate['type'];
    visibility?: ClassTemplate['visibility'];
    category?: string;
    level?: ClassTemplate['level'];
    is_active?: boolean;
  }) {
    let query = supabase
      .from('class_templates')
      .select('*')
      .eq('org_id', orgId);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.visibility) query = query.eq('visibility', filters.visibility);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.level) query = query.eq('level', filters.level);
    if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // ==================== CLASS CREATION WIZARD ====================
  
  async createClassWithWizard(orgId: string, wizardData: CreateClassWizardData) {
    // Start transaction-like operations
    try {
      // 1. Create template
      const template = await this.createClassTemplate(orgId, {
        name: wizardData.name,
        type: wizardData.type,
        visibility: wizardData.visibility || 'public',
        category: wizardData.category,
        level: wizardData.level,
        duration_minutes: wizardData.duration_minutes,
        description: wizardData.description,
        image_url: wizardData.image_url,
        color: wizardData.color,
        default_price: wizardData.default_price,
        default_capacity: wizardData.capacity_override || 20,
        tags: wizardData.tags,
        default_instructors: wizardData.instructor_ids,
        default_locations: wizardData.location_ids,
        draft_mode: !wizardData.publish_now,
        scheduled_publish: wizardData.scheduled_publish,
        is_active: wizardData.publish_now || false
      });

      // 2. Create pricing rules if specified
      if (wizardData.pricing_tiers && wizardData.pricing_tiers.length > 0) {
        await Promise.all(
          wizardData.pricing_tiers.map(tier =>
            this.createPricingRule(template.id, orgId, {
              ...tier,
              template_id: template.id,
              org_id: orgId
            })
          )
        );
      }

      // 3. Create class instance for scheduling
      const instance = await this.createClassInstance(template.id, orgId, {
        start_date: wizardData.start_date,
        time_window_start: wizardData.time_window_start,
        time_window_end: wizardData.time_window_end,
        recurrence_pattern: wizardData.recurrence_pattern,
        recurrence_end_date: wizardData.recurrence_end_date,
        recurrence_end_count: wizardData.recurrence_end_count,
        capacity_override: wizardData.capacity_override,
        instructor_overrides: wizardData.instructor_ids,
        location_overrides: wizardData.location_ids,
        blackout_dates: wizardData.blackout_dates
      });

      // 4. Generate occurrences
      const occurrences = await this.generateOccurrences(instance.id);

      // 5. Create default policies
      await this.createDefaultPolicies(template.id, orgId, {
        cancellation_hours: wizardData.cancellation_hours || 24,
        late_cancel_fee: wizardData.late_cancel_fee || 0,
        no_show_fee: wizardData.no_show_fee || 0,
        sales_open_hours: wizardData.sales_open_hours || 168, // 1 week
        sales_close_hours: wizardData.sales_close_hours || 2
      });

      return {
        template,
        instance,
        occurrences,
        success: true
      };

    } catch (error) {
      console.error('Error creating class with wizard:', error);
      throw error;
    }
  }

  // ==================== INSTANCE & OCCURRENCE MANAGEMENT ====================
  
  async createClassInstance(templateId: string, orgId: string, instanceData: Tables['class_instances']['Insert']) {
    const { data, error } = await supabase
      .from('class_instances')
      .insert({
        ...instanceData,
        template_id: templateId,
        org_id: orgId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async generateOccurrences(instanceId: string) {
    // Use stored procedure for complex occurrence generation
    const { data, error } = await supabase.rpc('generate_class_occurrences', {
      p_instance_id: instanceId
    });

    if (error) throw error;
    return data;
  }

  async previewRecurringEdit(instanceId: string, options: RecurringEditOptions): Promise<MigrationPreview> {
    const { data, error } = await supabase.rpc('preview_recurring_edit', {
      p_instance_id: instanceId,
      p_scope: options.scope,
      p_changes: options.changes
    });

    if (error) throw error;
    return data;
  }

  async applyRecurringEdit(instanceId: string, options: RecurringEditOptions, migrationDecision: any) {
    const { data, error } = await supabase.rpc('apply_recurring_edit', {
      p_instance_id: instanceId,
      p_scope: options.scope,
      p_changes: options.changes,
      p_migration_strategy: options.migration_strategy,
      p_migration_decision: migrationDecision
    });

    if (error) throw error;
    return data;
  }

  async getClassOccurrences(orgId: string, filters?: {
    start_date?: string;
    end_date?: string;
    instructor_id?: string;
    location_id?: string;
    template_id?: string;
    status?: string[];
  }) {
    let query = supabase
      .from('class_occurrences')
      .select(`
        *,
        template:class_templates(*),
        instructor:user_profiles(*),
        location:locations(*),
        registrations(count),
        waitlist_entries(count)
      `)
      .eq('org_id', orgId);

    if (filters?.start_date) query = query.gte('start_time', filters.start_date);
    if (filters?.end_date) query = query.lte('start_time', filters.end_date);
    if (filters?.instructor_id) query = query.eq('instructor_id', filters.instructor_id);
    if (filters?.location_id) query = query.eq('location_id', filters.location_id);
    if (filters?.template_id) query = query.eq('template_id', filters.template_id);
    if (filters?.status) query = query.in('status', filters.status);

    const { data, error } = await query.order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // ==================== BOOKING ENGINE ====================
  
  async checkBookingEligibility(
    customerId: string, 
    occurrenceId: string, 
    orgId: string
  ): Promise<BookingEligibility> {
    const { data, error } = await supabase.rpc('check_booking_eligibility', {
      p_customer_id: customerId,
      p_occurrence_id: occurrenceId,
      p_org_id: orgId
    });

    if (error) throw error;
    return data;
  }

  async calculatePrice(
    occurrenceId: string, 
    customerId: string, 
    tierId?: string
  ) {
    const { data, error } = await supabase.rpc('calculate_class_price', {
      p_occurrence_id: occurrenceId,
      p_customer_id: customerId,
      p_tier_id: tierId
    });

    if (error) throw error;
    return data;
  }

  async createBooking(bookingData: {
    occurrence_id: string;
    customer_id: string;
    org_id: string;
    price: number;
    payment_method?: string;
    source_channel?: string;
    notes?: string;
    tier_id?: string;
    use_credits?: boolean;
    use_membership?: boolean;
  }) {
    const { data, error } = await supabase.rpc('create_class_booking', bookingData);

    if (error) throw error;
    return data;
  }

  // ==================== WAITLIST MANAGEMENT ====================
  
  async joinWaitlist(
    occurrenceId: string,
    customerId: string,
    orgId: string,
    options?: {
      auto_promote?: boolean;
      payment_capture_mode?: 'immediate' | 'on_promotion' | 'manual';
      payment_window_hours?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .insert({
        occurrence_id: occurrenceId,
        customer_id: customerId,
        org_id: orgId,
        auto_promote: options?.auto_promote ?? true,
        payment_capture_mode: options?.payment_capture_mode ?? 'on_promotion',
        payment_window_hours: options?.payment_window_hours ?? 2,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async promoteFromWaitlist(entryId: string) {
    const { data, error } = await supabase.rpc('promote_from_waitlist', {
      p_entry_id: entryId
    });

    if (error) throw error;
    return data;
  }

  async getWaitlistEntries(occurrenceId: string) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select(`
        *,
        customer:user_profiles(*)
      `)
      .eq('occurrence_id', occurrenceId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // ==================== SEAT MANAGEMENT ====================
  
  async assignSeat(registrationId: string, seatId: string, seatMapId: string) {
    const { data, error } = await supabase.rpc('assign_seat', {
      p_registration_id: registrationId,
      p_seat_id: seatId,
      p_seat_map_id: seatMapId
    });

    if (error) throw error;
    return data;
  }

  async releaseSeat(registrationId: string) {
    const { data, error } = await supabase.rpc('release_seat', {
      p_registration_id: registrationId
    });

    if (error) throw error;
    return data;
  }

  // ==================== PRICING MANAGEMENT ====================
  
  async createPricingRule(templateId: string, orgId: string, rule: Omit<PricingRule, 'id' | 'template_id' | 'org_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pricing_rules')
      .insert({
        ...rule,
        template_id: templateId,
        org_id: orgId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPricingRules(templateId: string) {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  }

  // ==================== CANCELLATION & REFUNDS ====================
  
  async cancelOccurrence(occurrenceId: string, reason: string, notifyCustomers = true) {
    const { data, error } = await supabase.rpc('cancel_class_occurrence', {
      p_occurrence_id: occurrenceId,
      p_reason: reason,
      p_notify_customers: notifyCustomers
    });

    if (error) throw error;
    return data;
  }

  async cancelRegistration(
    registrationId: string, 
    reason: string, 
    cancellationType: 'customer' | 'instructor' | 'studio' | 'weather' = 'customer'
  ) {
    const { data, error } = await supabase.rpc('cancel_registration', {
      p_registration_id: registrationId,
      p_reason: reason,
      p_cancellation_type: cancellationType
    });

    if (error) throw error;
    return data;
  }

  // ==================== CHECK-IN & ATTENDANCE ====================
  
  async checkInCustomer(registrationId: string, method: 'manual' | 'qr' | 'auto' = 'manual') {
    const { data, error } = await supabase.rpc('check_in_customer', {
      p_registration_id: registrationId,
      p_check_in_method: method
    });

    if (error) throw error;
    return data;
  }

  async getClassRoster(occurrenceId: string) {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        customer:user_profiles(*)
      `)
      .eq('occurrence_id', occurrenceId)
      .in('status', ['confirmed', 'attended'])
      .order('booked_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async markAttendance(registrationIds: string[], status: 'attended' | 'no_show') {
    const { data, error } = await supabase.rpc('bulk_update_attendance', {
      p_registration_ids: registrationIds,
      p_status: status
    });

    if (error) throw error;
    return data;
  }

  // ==================== OUTDOOR LOCATIONS & WEATHER ====================
  
  async createWeatherRule(locationId: string, rule: WeatherRule) {
    const { data, error } = await supabase
      .from('locations')
      .update({
        booking_rules: {
          weather: rule
        }
      })
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkWeatherAndAutoMove(occurrenceId: string) {
    const { data, error } = await supabase.rpc('check_weather_and_auto_move', {
      p_occurrence_id: occurrenceId
    });

    if (error) throw error;
    return data;
  }

  // ==================== VIRTUAL SESSIONS ====================
  
  async createVirtualSession(occurrenceId: string, orgId: string, sessionData: Omit<VirtualSession, 'id' | 'occurrence_id' | 'org_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('virtual_sessions')
      .insert({
        ...sessionData,
        occurrence_id: occurrenceId,
        org_id: orgId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getVirtualSession(occurrenceId: string) {
    const { data, error } = await supabase
      .from('virtual_sessions')
      .select('*')
      .eq('occurrence_id', occurrenceId)
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== POLICIES ====================
  
  async createDefaultPolicies(templateId: string, orgId: string, options: {
    cancellation_hours: number;
    late_cancel_fee: number;
    no_show_fee: number;
    sales_open_hours: number;
    sales_close_hours: number;
  }) {
    const policies = [
      {
        template_id: templateId,
        org_id: orgId,
        name: 'Default Cancellation Policy',
        type: 'cancellation' as const,
        rules: {
          hours_before: options.cancellation_hours,
          full_refund_hours: options.cancellation_hours,
          late_cancel_fee: options.late_cancel_fee
        },
        is_default: true,
        is_active: true
      },
      {
        template_id: templateId,
        org_id: orgId,
        name: 'No Show Policy',
        type: 'no_show' as const,
        rules: {
          fee_amount: options.no_show_fee,
          credit_option: options.no_show_fee > 0
        },
        is_default: true,
        is_active: true
      },
      {
        template_id: templateId,
        org_id: orgId,
        name: 'Sales Window Policy',
        type: 'sales_window' as const,
        rules: {
          open_hours_before: options.sales_open_hours,
          close_hours_before: options.sales_close_hours
        },
        is_default: true,
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from('policies')
      .insert(policies)
      .select();

    if (error) throw error;
    return data;
  }

  // ==================== ANALYTICS ====================
  
  async getClassAnalytics(orgId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_class_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getOccupancyAnalytics(orgId: string, templateId?: string) {
    const { data, error } = await supabase.rpc('get_occupancy_analytics', {
      p_org_id: orgId,
      p_template_id: templateId
    });

    if (error) throw error;
    return data;
  }

  async getRevenueAnalytics(orgId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_class_revenue_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  // ==================== BULK OPERATIONS ====================
  
  async bulkCancelOccurrences(occurrenceIds: string[], reason: string) {
    const { data, error } = await supabase.rpc('bulk_cancel_occurrences', {
      p_occurrence_ids: occurrenceIds,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  }

  async bulkUpdateCapacity(occurrenceIds: string[], newCapacity: number) {
    const { data, error } = await supabase.rpc('bulk_update_capacity', {
      p_occurrence_ids: occurrenceIds,
      p_new_capacity: newCapacity
    });

    if (error) throw error;
    return data;
  }

  // ==================== SEARCH & SEO ====================
  
  async searchPublicClasses(query: {
    text?: string;
    location?: string;
    date_from?: string;
    date_to?: string;
    type?: string;
    level?: string;
    instructor?: string;
    tags?: string[];
    outdoor?: boolean;
  }) {
    const { data, error } = await supabase.rpc('search_public_classes', query);

    if (error) throw error;
    return data;
  }

  async getClassForSEO(slug: string) {
    const { data, error } = await supabase
      .from('class_occurrences')
      .select(`
        *,
        template:class_templates(*),
        instructor:user_profiles(*),
        location:locations(*)
      `)
      .eq('slug', slug)
      .eq('template.visibility', 'public')
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  subscribeToOccurrenceUpdates(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('class_occurrences_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_occurrences',
          filter: `org_id=eq.${orgId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToRegistrationUpdates(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('registration_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `org_id=eq.${orgId}`
        },
        callback
      )
      .subscribe();
  }
}

// Export singleton instance
export const classesService = new ClassesService();