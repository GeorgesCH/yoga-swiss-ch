// Complete Supabase database schema for YogaSwiss platform

export interface Database {
  public: {
    Tables: {
      // Organizations (Brands and Studios)
      orgs: {
        Row: {
          id: string;
          name: string;
          type: 'brand' | 'studio';
          parent_id: string | null; // For studio -> brand relationship
          slug: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          timezone: string;
          default_locale: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          currency: string;
          vat_rate: number;
          payment_methods: string[];
          features: string[];
          settings: Record<string, any>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'brand' | 'studio';
          parent_id?: string | null;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          default_locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          currency?: string;
          vat_rate?: number;
          payment_methods?: string[];
          features?: string[];
          settings?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'brand' | 'studio';
          parent_id?: string | null;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          default_locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          currency?: string;
          vat_rate?: number;
          payment_methods?: string[];
          features?: string[];
          settings?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // User profiles
      user_profiles: {
        Row: {
          id: string; // matches auth.users.id
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          emergency_contact: Record<string, any> | null;
          medical_info: Record<string, any> | null;
          dietary_preferences: string[] | null;
          preferred_locale: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          marketing_consent: boolean;
          privacy_settings: Record<string, any>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: Record<string, any> | null;
          medical_info?: Record<string, any> | null;
          dietary_preferences?: string[] | null;
          preferred_locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          marketing_consent?: boolean;
          privacy_settings?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: Record<string, any> | null;
          medical_info?: Record<string, any> | null;
          dietary_preferences?: string[] | null;
          preferred_locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          marketing_consent?: boolean;
          privacy_settings?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Organization users (roles and permissions)
      org_users: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: 'customer' | 'instructor' | 'manager' | 'owner' | 'front_desk' | 'accountant' | 'marketer';
          permissions: string[];
          is_active: boolean;
          invited_at: string | null;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: 'customer' | 'instructor' | 'manager' | 'owner' | 'front_desk' | 'accountant' | 'marketer';
          permissions?: string[];
          is_active?: boolean;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: 'customer' | 'instructor' | 'manager' | 'owner' | 'front_desk' | 'accountant' | 'marketer';
          permissions?: string[];
          is_active?: boolean;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Locations (rooms, outdoor spaces)
      locations: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: 'room' | 'outdoor' | 'online';
          capacity: number;
          address: string | null;
          coordinates: Record<string, any> | null; // lat/lng
          weather_dependent: boolean;
          backup_location_id: string | null;
          equipment: string[];
          amenities: string[];
          accessibility_features: string[];
          booking_rules: Record<string, any>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type: 'room' | 'outdoor' | 'online';
          capacity: number;
          address?: string | null;
          coordinates?: Record<string, any> | null;
          weather_dependent?: boolean;
          backup_location_id?: string | null;
          equipment?: string[];
          amenities?: string[];
          accessibility_features?: string[];
          booking_rules?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?: 'room' | 'outdoor' | 'online';
          capacity?: number;
          address?: string | null;
          coordinates?: Record<string, any> | null;
          weather_dependent?: boolean;
          backup_location_id?: string | null;
          equipment?: string[];
          amenities?: string[];
          accessibility_features?: string[];
          booking_rules?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Class templates/services
      class_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: 'class' | 'workshop' | 'course' | 'private' | 'retreat' | 'hybrid';
          visibility: 'public' | 'unlisted' | 'private';
          category: string;
          level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
          duration_minutes: number;
          description: Record<string, string>; // Multi-language descriptions
          image_url: string | null;
          color: string | null;
          default_price: number;
          default_capacity: number;
          instructor_pay_rate: number;
          instructor_pay_type: 'fixed' | 'hourly' | 'percentage' | 'per_participant';
          requirements: Record<string, string> | null;
          benefits: Record<string, string> | null;
          equipment_needed: string[];
          tags: string[];
          audience: string | null;
          revenue_category: string | null;
          default_policies: Record<string, any> | null;
          default_instructors: string[] | null;
          default_locations: string[] | null;
          virtual_settings: Record<string, any> | null;
          is_featured: boolean;
          is_active: boolean;
          draft_mode: boolean;
          scheduled_publish: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type: 'class' | 'workshop' | 'course' | 'private' | 'retreat' | 'hybrid';
          visibility?: 'public' | 'unlisted' | 'private';
          category: string;
          level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
          duration_minutes: number;
          description: Record<string, string>;
          image_url?: string | null;
          color?: string | null;
          default_price: number;
          default_capacity: number;
          instructor_pay_rate?: number;
          instructor_pay_type?: 'fixed' | 'hourly' | 'percentage' | 'per_participant';
          requirements?: Record<string, string> | null;
          benefits?: Record<string, string> | null;
          equipment_needed?: string[];
          tags?: string[];
          audience?: string | null;
          revenue_category?: string | null;
          default_policies?: Record<string, any> | null;
          default_instructors?: string[] | null;
          default_locations?: string[] | null;
          virtual_settings?: Record<string, any> | null;
          is_featured?: boolean;
          is_active?: boolean;
          draft_mode?: boolean;
          scheduled_publish?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?: 'class' | 'workshop' | 'course' | 'private' | 'retreat' | 'hybrid';
          visibility?: 'public' | 'unlisted' | 'private';
          category?: string;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
          duration_minutes?: number;
          description?: Record<string, string>;
          image_url?: string | null;
          color?: string | null;
          default_price?: number;
          default_capacity?: number;
          instructor_pay_rate?: number;
          instructor_pay_type?: 'fixed' | 'hourly' | 'percentage' | 'per_participant';
          requirements?: Record<string, string> | null;
          benefits?: Record<string, string> | null;
          equipment_needed?: string[];
          tags?: string[];
          audience?: string | null;
          revenue_category?: string | null;
          default_policies?: Record<string, any> | null;
          default_instructors?: string[] | null;
          default_locations?: string[] | null;
          virtual_settings?: Record<string, any> | null;
          is_featured?: boolean;
          is_active?: boolean;
          draft_mode?: boolean;
          scheduled_publish?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Class instances (scheduling containers)
      class_instances: {
        Row: {
          id: string;
          template_id: string;
          org_id: string;
          start_date: string;
          time_window_start: string;
          time_window_end: string;
          recurrence_pattern: Record<string, any> | null;
          recurrence_end_date: string | null;
          recurrence_end_count: number | null;
          capacity_override: number | null;
          instructor_overrides: string[] | null;
          location_overrides: string[] | null;
          notes: string | null;
          blackout_dates: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          org_id: string;
          start_date: string;
          time_window_start: string;
          time_window_end: string;
          recurrence_pattern?: Record<string, any> | null;
          recurrence_end_date?: string | null;
          recurrence_end_count?: number | null;
          capacity_override?: number | null;
          instructor_overrides?: string[] | null;
          location_overrides?: string[] | null;
          notes?: string | null;
          blackout_dates?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          org_id?: string;
          start_date?: string;
          time_window_start?: string;
          time_window_end?: string;
          recurrence_pattern?: Record<string, any> | null;
          recurrence_end_date?: string | null;
          recurrence_end_count?: number | null;
          capacity_override?: number | null;
          instructor_overrides?: string[] | null;
          location_overrides?: string[] | null;
          notes?: string | null;
          blackout_dates?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Class occurrences (concrete sessions)
      class_occurrences: {
        Row: {
          id: string;
          instance_id: string;
          template_id: string;
          org_id: string;
          instructor_id: string;
          location_id: string;
          start_time: string;
          end_time: string;
          slug: string;
          price: number;
          capacity: number;
          booked_count: number;
          waitlist_count: number;
          status: 'scheduled' | 'cancelled' | 'completed' | 'moved';
          cancellation_reason: string | null;
          notes: string | null;
          meeting_url: string | null;
          weather_backup_used: boolean;
          instructor_notes: string | null;
          actual_instructor_id: string | null;
          actual_location_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instance_id: string;
          template_id: string;
          org_id: string;
          instructor_id: string;
          location_id: string;
          start_time: string;
          end_time: string;
          slug?: string;
          price: number;
          capacity: number;
          booked_count?: number;
          waitlist_count?: number;
          status?: 'scheduled' | 'cancelled' | 'completed' | 'moved';
          cancellation_reason?: string | null;
          notes?: string | null;
          meeting_url?: string | null;
          weather_backup_used?: boolean;
          instructor_notes?: string | null;
          actual_instructor_id?: string | null;
          actual_location_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instance_id?: string;
          template_id?: string;
          org_id?: string;
          instructor_id?: string;
          location_id?: string;
          start_time?: string;
          end_time?: string;
          slug?: string;
          price?: number;
          capacity?: number;
          booked_count?: number;
          waitlist_count?: number;
          status?: 'scheduled' | 'cancelled' | 'completed' | 'moved';
          cancellation_reason?: string | null;
          notes?: string | null;
          meeting_url?: string | null;
          weather_backup_used?: boolean;
          instructor_notes?: string | null;
          actual_instructor_id?: string | null;
          actual_location_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Customer registrations
      registrations: {
        Row: {
          id: string;
          occurrence_id: string;
          customer_id: string;
          org_id: string;
          status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'no_show' | 'refunded' | 'transferred' | 'attended';
          source_channel: string | null;
          price: number;
          booked_at: string;
          cancelled_at: string | null;
          waitlist_position: number | null;
          payment_status: 'pending' | 'paid' | 'refunded' | 'free';
          payment_method: string | null;
          payment_link: string | null;
          refund_link: string | null;
          notes: string | null;
          check_in_time: string | null;
          feedback_rating: number | null;
          feedback_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          customer_id: string;
          org_id: string;
          status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'no_show' | 'refunded' | 'transferred' | 'attended';
          source_channel?: string | null;
          price: number;
          booked_at?: string;
          cancelled_at?: string | null;
          waitlist_position?: number | null;
          payment_status?: 'pending' | 'paid' | 'refunded' | 'free';
          payment_method?: string | null;
          payment_link?: string | null;
          refund_link?: string | null;
          notes?: string | null;
          check_in_time?: string | null;
          feedback_rating?: number | null;
          feedback_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          occurrence_id?: string;
          customer_id?: string;
          org_id?: string;
          status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'no_show' | 'refunded' | 'transferred' | 'attended';
          source_channel?: string | null;
          price?: number;
          booked_at?: string;
          cancelled_at?: string | null;
          waitlist_position?: number | null;
          payment_status?: 'pending' | 'paid' | 'refunded' | 'free';
          payment_method?: string | null;
          payment_link?: string | null;
          refund_link?: string | null;
          notes?: string | null;
          check_in_time?: string | null;
          feedback_rating?: number | null;
          feedback_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Customer wallets
      wallets: {
        Row: {
          id: string;
          customer_id: string;
          org_id: string;
          balance: number;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          org_id: string;
          balance?: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          org_id?: string;
          balance?: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Passes and memberships
      passes: {
        Row: {
          id: string;
          customer_id: string;
          org_id: string;
          product_id: string;
          type: 'credits' | 'unlimited' | 'time_limited';
          credits_total: number | null;
          credits_used: number | null;
          valid_from: string;
          valid_until: string | null;
          is_active: boolean;
          auto_renew: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          org_id: string;
          product_id: string;
          type: 'credits' | 'unlimited' | 'time_limited';
          credits_total?: number | null;
          credits_used?: number | null;
          valid_from: string;
          valid_until?: string | null;
          is_active?: boolean;
          auto_renew?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          org_id?: string;
          product_id?: string;
          type?: 'credits' | 'unlimited' | 'time_limited';
          credits_total?: number | null;
          credits_used?: number | null;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
          auto_renew?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Products (packages, memberships, etc.)
      products: {
        Row: {
          id: string;
          org_id: string;
          name: Record<string, string>; // Multi-language names
          description: Record<string, string>; // Multi-language descriptions
          type: 'drop_in' | 'package' | 'membership' | 'gift_card' | 'retreat';
          price: number;
          credits: number | null;
          validity_days: number | null;
          is_unlimited: boolean;
          is_recurring: boolean;
          recurring_interval: 'monthly' | 'yearly' | null;
          is_gift_eligible: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: Record<string, string>;
          description: Record<string, string>;
          type: 'drop_in' | 'package' | 'membership' | 'gift_card' | 'retreat';
          price: number;
          credits?: number | null;
          validity_days?: number | null;
          is_unlimited?: boolean;
          is_recurring?: boolean;
          recurring_interval?: 'monthly' | 'yearly' | null;
          is_gift_eligible?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: Record<string, string>;
          description?: Record<string, string>;
          type?: 'drop_in' | 'package' | 'membership' | 'gift_card' | 'retreat';
          price?: number;
          credits?: number | null;
          validity_days?: number | null;
          is_unlimited?: boolean;
          is_recurring?: boolean;
          recurring_interval?: 'monthly' | 'yearly' | null;
          is_gift_eligible?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Orders and payments
      orders: {
        Row: {
          id: string;
          customer_id: string;
          org_id: string;
          status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          items: Record<string, any>[];
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          payment_method: 'twint' | 'credit_card' | 'apple_pay' | 'google_pay' | 'qr_bill' | 'cash';
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_intent_id: string | null;
          stripe_session_id: string | null;
          twint_transaction_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          org_id: string;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          items: Record<string, any>[];
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency?: string;
          payment_method: 'twint' | 'credit_card' | 'apple_pay' | 'google_pay' | 'qr_bill' | 'cash';
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          twint_transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          org_id?: string;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          items?: Record<string, any>[];
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          payment_method?: 'twint' | 'credit_card' | 'apple_pay' | 'google_pay' | 'qr_bill' | 'cash';
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          twint_transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Waitlist entries
      waitlist_entries: {
        Row: {
          id: string;
          occurrence_id: string;
          customer_id: string;
          org_id: string;
          priority: number;
          auto_promote: boolean;
          payment_capture_mode: 'immediate' | 'on_promotion' | 'manual';
          payment_window_hours: number;
          notes: string | null;
          joined_at: string;
          promoted_at: string | null;
          expired_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          customer_id: string;
          org_id: string;
          priority?: number;
          auto_promote?: boolean;
          payment_capture_mode?: 'immediate' | 'on_promotion' | 'manual';
          payment_window_hours?: number;
          notes?: string | null;
          joined_at?: string;
          promoted_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          occurrence_id?: string;
          customer_id?: string;
          org_id?: string;
          priority?: number;
          auto_promote?: boolean;
          payment_capture_mode?: 'immediate' | 'on_promotion' | 'manual';
          payment_window_hours?: number;
          notes?: string | null;
          joined_at?: string;
          promoted_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ==================== MARKETING MODULE TABLES ====================

      // Customer segments
      segments: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          definition_json: Record<string, any>;
          live_count: number;
          refreshed_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          definition_json: Record<string, any>;
          live_count?: number;
          refreshed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          definition_json?: Record<string, any>;
          live_count?: number;
          refreshed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Audience syncs to ad platforms
      audiences: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          segment_id: string;
          sync_target: string;
          external_audience_id: string | null;
          status: string;
          last_synced_at: string | null;
          sync_count: number;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          segment_id: string;
          sync_target: string;
          external_audience_id?: string | null;
          status?: string;
          last_synced_at?: string | null;
          sync_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          segment_id?: string;
          sync_target?: string;
          external_audience_id?: string | null;
          status?: string;
          last_synced_at?: string | null;
          sync_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Marketing funnels
      funnels: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          slug: string | null;
          status: string;
          goal_type: string;
          goal_object_id: string | null;
          locale: string;
          theme: string | null;
          domain: string | null;
          published_at: string | null;
          views_count: number;
          conversions_count: number;
          revenue_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          slug?: string | null;
          status?: string;
          goal_type: string;
          goal_object_id?: string | null;
          locale?: string;
          theme?: string | null;
          domain?: string | null;
          published_at?: string | null;
          views_count?: number;
          conversions_count?: number;
          revenue_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string | null;
          status?: string;
          goal_type?: string;
          goal_object_id?: string | null;
          locale?: string;
          theme?: string | null;
          domain?: string | null;
          published_at?: string | null;
          views_count?: number;
          conversions_count?: number;
          revenue_total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Funnel steps
      funnel_steps: {
        Row: {
          id: string;
          funnel_id: string;
          type: string;
          order_index: number;
          content_json: Record<string, any>;
          form_id: string | null;
          offer_id: string | null;
          test_group: string | null;
          views_count: number;
          conversions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          funnel_id: string;
          type: string;
          order_index: number;
          content_json: Record<string, any>;
          form_id?: string | null;
          offer_id?: string | null;
          test_group?: string | null;
          views_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          funnel_id?: string;
          type?: string;
          order_index?: number;
          content_json?: Record<string, any>;
          form_id?: string | null;
          offer_id?: string | null;
          test_group?: string | null;
          views_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Landing pages
      landing_pages: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          slug: string;
          content_json: Record<string, any>;
          seo_json: Record<string, any> | null;
          publish_at: string | null;
          locale: string;
          theme: string | null;
          views_count: number;
          conversions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          slug: string;
          content_json: Record<string, any>;
          seo_json?: Record<string, any> | null;
          publish_at?: string | null;
          locale?: string;
          theme?: string | null;
          views_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          content_json?: Record<string, any>;
          seo_json?: Record<string, any> | null;
          publish_at?: string | null;
          locale?: string;
          theme?: string | null;
          views_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Forms for lead capture
      forms: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          schema_json: Record<string, any>;
          double_opt_in: boolean;
          redirect_url: string | null;
          webhook_url: string | null;
          submissions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          schema_json: Record<string, any>;
          double_opt_in?: boolean;
          redirect_url?: string | null;
          webhook_url?: string | null;
          submissions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          schema_json?: Record<string, any>;
          double_opt_in?: boolean;
          redirect_url?: string | null;
          webhook_url?: string | null;
          submissions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Form submissions
      form_submissions: {
        Row: {
          id: string;
          form_id: string;
          lead_id: string | null;
          data_json: Record<string, any>;
          utm_json: Record<string, any> | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          lead_id?: string | null;
          data_json: Record<string, any>;
          utm_json?: Record<string, any> | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          lead_id?: string | null;
          data_json?: Record<string, any>;
          utm_json?: Record<string, any> | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
        };
      };

      // Lead management
      leads: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          person_id: string | null;
          email: string | null;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          locale: string;
          region: string | null;
          interests: string[] | null;
          source: string | null;
          status: string;
          owner_id: string | null;
          score: number;
          tags: string[];
          utm_json: Record<string, any> | null;
          custom_fields: Record<string, any>;
          consent_json: Record<string, any>;
          assigned_at: string | null;
          last_contact_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          person_id?: string | null;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          locale?: string;
          region?: string | null;
          interests?: string[] | null;
          source?: string | null;
          status?: string;
          owner_id?: string | null;
          score?: number;
          tags?: string[];
          utm_json?: Record<string, any> | null;
          custom_fields?: Record<string, any>;
          consent_json: Record<string, any>;
          assigned_at?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          person_id?: string | null;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          locale?: string;
          region?: string | null;
          interests?: string[] | null;
          source?: string | null;
          status?: string;
          owner_id?: string | null;
          score?: number;
          tags?: string[];
          utm_json?: Record<string, any> | null;
          custom_fields?: Record<string, any>;
          consent_json?: Record<string, any>;
          assigned_at?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Lead activities
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          type: string;
          ts: string;
          data_json: Record<string, any>;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: string;
          ts?: string;
          data_json?: Record<string, any>;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: string;
          ts?: string;
          data_json?: Record<string, any>;
          created_by?: string | null;
        };
      };

      // Marketing campaigns
      campaigns: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          type: string;
          channel: string;
          status: string;
          audience_segment_id: string | null;
          template_id: string | null;
          schedule_json: Record<string, any> | null;
          ab_test_json: Record<string, any> | null;
          holdout_pct: number;
          budget_json: Record<string, any> | null;
          utm_params: Record<string, any> | null;
          scheduled_at: string | null;
          sent_at: string | null;
          sends_count: number;
          opens_count: number;
          clicks_count: number;
          conversions_count: number;
          revenue_total: number;
          cost_total: number;
          preflight_passed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          type: string;
          channel: string;
          status?: string;
          audience_segment_id?: string | null;
          template_id?: string | null;
          schedule_json?: Record<string, any> | null;
          ab_test_json?: Record<string, any> | null;
          holdout_pct?: number;
          budget_json?: Record<string, any> | null;
          utm_params?: Record<string, any> | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sends_count?: number;
          opens_count?: number;
          clicks_count?: number;
          conversions_count?: number;
          revenue_total?: number;
          cost_total?: number;
          preflight_passed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          channel?: string;
          status?: string;
          audience_segment_id?: string | null;
          template_id?: string | null;
          schedule_json?: Record<string, any> | null;
          ab_test_json?: Record<string, any> | null;
          holdout_pct?: number;
          budget_json?: Record<string, any> | null;
          utm_params?: Record<string, any> | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sends_count?: number;
          opens_count?: number;
          clicks_count?: number;
          conversions_count?: number;
          revenue_total?: number;
          cost_total?: number;
          preflight_passed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Individual messages
      messages: {
        Row: {
          id: string;
          campaign_id: string | null;
          journey_node_id: string | null;
          recipient_type: string;
          recipient_id: string;
          channel: string;
          subject: string | null;
          content: string | null;
          rendered_size: number | null;
          send_at: string | null;
          sent_at: string | null;
          delivery_status: string;
          open_at: string | null;
          click_at: string | null;
          bounce_type: string | null;
          bounce_reason: string | null;
          unsubscribe_at: string | null;
          conversion_order_id: string | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id?: string | null;
          journey_node_id?: string | null;
          recipient_type: string;
          recipient_id: string;
          channel: string;
          subject?: string | null;
          content?: string | null;
          rendered_size?: number | null;
          send_at?: string | null;
          sent_at?: string | null;
          delivery_status?: string;
          open_at?: string | null;
          click_at?: string | null;
          bounce_type?: string | null;
          bounce_reason?: string | null;
          unsubscribe_at?: string | null;
          conversion_order_id?: string | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string | null;
          journey_node_id?: string | null;
          recipient_type?: string;
          recipient_id?: string;
          channel?: string;
          subject?: string | null;
          content?: string | null;
          rendered_size?: number | null;
          send_at?: string | null;
          sent_at?: string | null;
          delivery_status?: string;
          open_at?: string | null;
          click_at?: string | null;
          bounce_type?: string | null;
          bounce_reason?: string | null;
          unsubscribe_at?: string | null;
          conversion_order_id?: string | null;
          cost?: number | null;
          created_at?: string;
        };
      };

      // Marketing journeys/automations
      journeys: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          status: string;
          entry_triggers_json: Record<string, any>;
          quiet_hours_json: Record<string, any> | null;
          frequency_caps_json: Record<string, any> | null;
          version: number;
          published_at: string | null;
          enrollments_count: number;
          completions_count: number;
          revenue_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          status?: string;
          entry_triggers_json: Record<string, any>;
          quiet_hours_json?: Record<string, any> | null;
          frequency_caps_json?: Record<string, any> | null;
          version?: number;
          published_at?: string | null;
          enrollments_count?: number;
          completions_count?: number;
          revenue_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          entry_triggers_json?: Record<string, any>;
          quiet_hours_json?: Record<string, any> | null;
          frequency_caps_json?: Record<string, any> | null;
          version?: number;
          published_at?: string | null;
          enrollments_count?: number;
          completions_count?: number;
          revenue_total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Journey nodes
      journey_nodes: {
        Row: {
          id: string;
          journey_id: string;
          type: string;
          config_json: Record<string, any>;
          position: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          journey_id: string;
          type: string;
          config_json: Record<string, any>;
          position: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          journey_id?: string;
          type?: string;
          config_json?: Record<string, any>;
          position?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Journey enrollments
      journey_enrollments: {
        Row: {
          id: string;
          journey_id: string;
          lead_id: string;
          current_node_id: string | null;
          status: string;
          enrolled_at: string;
          completed_at: string | null;
          exit_reason: string | null;
        };
        Insert: {
          id?: string;
          journey_id: string;
          lead_id: string;
          current_node_id?: string | null;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          exit_reason?: string | null;
        };
        Update: {
          id?: string;
          journey_id?: string;
          lead_id?: string;
          current_node_id?: string | null;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          exit_reason?: string | null;
        };
      };

      // Message templates
      templates: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          type: string;
          subject: string | null;
          content: string;
          locale: string;
          design_json: Record<string, any> | null;
          variables: string[];
          legal_footer_id: string | null;
          version: number;
          is_active: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          type: string;
          subject?: string | null;
          content: string;
          locale?: string;
          design_json?: Record<string, any> | null;
          variables?: string[];
          legal_footer_id?: string | null;
          version?: number;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          subject?: string | null;
          content?: string;
          locale?: string;
          design_json?: Record<string, any> | null;
          variables?: string[];
          legal_footer_id?: string | null;
          version?: number;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Marketing offers
      offers: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          type: string;
          name: string;
          code: string | null;
          description: Record<string, any> | null;
          rules_json: Record<string, any>;
          budget: number | null;
          budget_used: number;
          usage_limit_total: number | null;
          usage_limit_per_customer: number;
          usage_count: number;
          start_at: string | null;
          end_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          type: string;
          name: string;
          code?: string | null;
          description?: Record<string, any> | null;
          rules_json: Record<string, any>;
          budget?: number | null;
          budget_used?: number;
          usage_limit_total?: number | null;
          usage_limit_per_customer?: number;
          usage_count?: number;
          start_at?: string | null;
          end_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          type?: string;
          name?: string;
          code?: string | null;
          description?: Record<string, any> | null;
          rules_json?: Record<string, any>;
          budget?: number | null;
          budget_used?: number;
          usage_limit_total?: number | null;
          usage_limit_per_customer?: number;
          usage_count?: number;
          start_at?: string | null;
          end_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Offer redemptions
      offer_redemptions: {
        Row: {
          id: string;
          offer_id: string;
          customer_id: string;
          order_id: string | null;
          discount_amount: number;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          customer_id: string;
          order_id?: string | null;
          discount_amount: number;
          redeemed_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          customer_id?: string;
          order_id?: string | null;
          discount_amount?: number;
          redeemed_at?: string;
        };
      };

      // Referral programs
      referral_programs: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          rules_json: Record<string, any>;
          code_prefix: string;
          valid_until: string | null;
          is_active: boolean;
          referrals_count: number;
          successful_referrals_count: number;
          total_rewards_paid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          rules_json: Record<string, any>;
          code_prefix?: string;
          valid_until?: string | null;
          is_active?: boolean;
          referrals_count?: number;
          successful_referrals_count?: number;
          total_rewards_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          rules_json?: Record<string, any>;
          code_prefix?: string;
          valid_until?: string | null;
          is_active?: boolean;
          referrals_count?: number;
          successful_referrals_count?: number;
          total_rewards_paid?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Individual referrals
      referrals: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          program_id: string;
          referrer_customer_id: string;
          referee_customer_id: string | null;
          code: string;
          share_url: string | null;
          status: string;
          reward_amount: number | null;
          paid_at: string | null;
          fraud_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          program_id: string;
          referrer_customer_id: string;
          referee_customer_id?: string | null;
          code: string;
          share_url?: string | null;
          status?: string;
          reward_amount?: number | null;
          paid_at?: string | null;
          fraud_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          program_id?: string;
          referrer_customer_id?: string;
          referee_customer_id?: string | null;
          code?: string;
          share_url?: string | null;
          status?: string;
          reward_amount?: number | null;
          paid_at?: string | null;
          fraud_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Attribution events
      attribution_events: {
        Row: {
          id: string;
          org_id: string | null;
          tenant_id: string | null;
          person_id: string | null;
          session_id: string;
          event: string;
          ts: string;
          utm_json: Record<string, any> | null;
          url: string | null;
          referrer: string | null;
          user_agent: string | null;
          ip_address: string | null;
          device_type: string | null;
          order_id: string | null;
          revenue: number | null;
          data_json: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          tenant_id?: string | null;
          person_id?: string | null;
          session_id: string;
          event: string;
          ts?: string;
          utm_json?: Record<string, any> | null;
          url?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          device_type?: string | null;
          order_id?: string | null;
          revenue?: number | null;
          data_json?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          tenant_id?: string | null;
          person_id?: string | null;
          session_id?: string;
          event?: string;
          ts?: string;
          utm_json?: Record<string, any> | null;
          url?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          device_type?: string | null;
          order_id?: string | null;
          revenue?: number | null;
          data_json?: Record<string, any> | null;
        };
      };

      // A/B Testing experiments
      experiments: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          scope: string;
          status: string;
          hypothesis: string | null;
          variants_json: Record<string, any>;
          primary_metric: string;
          confidence_level: number;
          start_at: string | null;
          end_at: string | null;
          winner_variant: string | null;
          statistical_significance: number | null;
          results_json: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          scope: string;
          status?: string;
          hypothesis?: string | null;
          variants_json: Record<string, any>;
          primary_metric: string;
          confidence_level?: number;
          start_at?: string | null;
          end_at?: string | null;
          winner_variant?: string | null;
          statistical_significance?: number | null;
          results_json?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          scope?: string;
          status?: string;
          hypothesis?: string | null;
          variants_json?: Record<string, any>;
          primary_metric?: string;
          confidence_level?: number;
          start_at?: string | null;
          end_at?: string | null;
          winner_variant?: string | null;
          statistical_significance?: number | null;
          results_json?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Ad cost data
      ad_costs: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          platform: string;
          campaign_id_external: string;
          adset_id_external: string | null;
          ad_id_external: string | null;
          date: string;
          spend: number;
          impressions: number;
          clicks: number;
          conversions: number;
          revenue: number;
          currency: string;
          imported_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          platform: string;
          campaign_id_external: string;
          adset_id_external?: string | null;
          ad_id_external?: string | null;
          date: string;
          spend: number;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          revenue?: number;
          currency?: string;
          imported_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          platform?: string;
          campaign_id_external?: string;
          adset_id_external?: string | null;
          ad_id_external?: string | null;
          date?: string;
          spend?: number;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          revenue?: number;
          currency?: string;
          imported_at?: string;
        };
      };

      // Email domain settings
      domain_settings: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          sending_domain: string;
          dkim_selector: string;
          dkim_private_key: string | null;
          dkim_public_key: string | null;
          dkim_status: string;
          spf_status: string;
          dmarc_policy: string;
          link_domain: string | null;
          is_verified: boolean;
          last_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          sending_domain: string;
          dkim_selector?: string;
          dkim_private_key?: string | null;
          dkim_public_key?: string | null;
          dkim_status?: string;
          spf_status?: string;
          dmarc_policy?: string;
          link_domain?: string | null;
          is_verified?: boolean;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          sending_domain?: string;
          dkim_selector?: string;
          dkim_private_key?: string | null;
          dkim_public_key?: string | null;
          dkim_status?: string;
          spf_status?: string;
          dmarc_policy?: string;
          link_domain?: string | null;
          is_verified?: boolean;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Email suppression lists
      suppression_lists: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          type: string;
          value: string;
          reason: string;
          source_campaign_id: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          type: string;
          value: string;
          reason: string;
          source_campaign_id?: string | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          type?: string;
          value?: string;
          reason?: string;
          source_campaign_id?: string | null;
          added_at?: string;
        };
      };

      // Webhooks
      webhooks: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          name: string;
          target_url: string;
          secret: string | null;
          events: string[];
          is_active: boolean;
          last_success_at: string | null;
          last_error_at: string | null;
          error_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          name: string;
          target_url: string;
          secret?: string | null;
          events: string[];
          is_active?: boolean;
          last_success_at?: string | null;
          last_error_at?: string | null;
          error_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          name?: string;
          target_url?: string;
          secret?: string | null;
          events?: string[];
          is_active?: boolean;
          last_success_at?: string | null;
          last_error_at?: string | null;
          error_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Marketing audit logs
      marketing_audit_logs: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_values: Record<string, any> | null;
          new_values: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tenant_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
          payment_window_hours?: number;
          notes?: string | null;
          joined_at?: string;
          promoted_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          occurrence_id?: string;
          customer_id?: string;
          org_id?: string;
          priority?: number;
          auto_promote?: boolean;
          payment_capture_mode?: 'immediate' | 'on_promotion' | 'manual';
          payment_window_hours?: number;
          notes?: string | null;
          joined_at?: string;
          promoted_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Pricing rules
      pricing_rules: {
        Row: {
          id: string;
          template_id: string;
          org_id: string;
          tier_name: string;
          tier_description: Record<string, string> | null;
          price: number;
          quantity_cap: number | null;
          member_discount_percentage: number | null;
          corporate_rate: number | null;
          early_bird_price: number | null;
          early_bird_deadline_hours: number | null;
          dynamic_pricing_enabled: boolean;
          dynamic_min_price: number | null;
          dynamic_max_price: number | null;
          dynamic_rules: Record<string, any> | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          org_id: string;
          tier_name: string;
          tier_description?: Record<string, string> | null;
          price: number;
          quantity_cap?: number | null;
          member_discount_percentage?: number | null;
          corporate_rate?: number | null;
          early_bird_price?: number | null;
          early_bird_deadline_hours?: number | null;
          dynamic_pricing_enabled?: boolean;
          dynamic_min_price?: number | null;
          dynamic_max_price?: number | null;
          dynamic_rules?: Record<string, any> | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          org_id?: string;
          tier_name?: string;
          tier_description?: Record<string, string> | null;
          price?: number;
          quantity_cap?: number | null;
          member_discount_percentage?: number | null;
          corporate_rate?: number | null;
          early_bird_price?: number | null;
          early_bird_deadline_hours?: number | null;
          dynamic_pricing_enabled?: boolean;
          dynamic_min_price?: number | null;
          dynamic_max_price?: number | null;
          dynamic_rules?: Record<string, any> | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Seat maps and assignments
      seat_maps: {
        Row: {
          id: string;
          location_id: string;
          org_id: string;
          name: string;
          layout_data: Record<string, any>;
          total_seats: number;
          accessible_seats: string[];
          premium_seats: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          org_id: string;
          name: string;
          layout_data: Record<string, any>;
          total_seats: number;
          accessible_seats?: string[];
          premium_seats?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          org_id?: string;
          name?: string;
          layout_data?: Record<string, any>;
          total_seats?: number;
          accessible_seats?: string[];
          premium_seats?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Seat assignments
      seat_assignments: {
        Row: {
          id: string;
          registration_id: string;
          seat_map_id: string;
          seat_id: string;
          reserved_at: string;
          expires_at: string | null;
          is_confirmed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          seat_map_id: string;
          seat_id: string;
          reserved_at?: string;
          expires_at?: string | null;
          is_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          registration_id?: string;
          seat_map_id?: string;
          seat_id?: string;
          reserved_at?: string;
          expires_at?: string | null;
          is_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Resources (equipment, rooms)
      resources: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: 'room' | 'equipment' | 'buffer';
          quantity: number;
          location_id: string | null;
          is_shareable: boolean;
          booking_rules: Record<string, any> | null;
          utilization_tracking: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type: 'room' | 'equipment' | 'buffer';
          quantity?: number;
          location_id?: string | null;
          is_shareable?: boolean;
          booking_rules?: Record<string, any> | null;
          utilization_tracking?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?: 'room' | 'equipment' | 'buffer';
          quantity?: number;
          location_id?: string | null;
          is_shareable?: boolean;
          booking_rules?: Record<string, any> | null;
          utilization_tracking?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Policies (cancellation, refund, etc.)
      policies: {
        Row: {
          id: string;
          org_id: string;
          template_id: string | null;
          name: string;
          type: 'cancellation' | 'refund' | 'late_fee' | 'no_show' | 'sales_window' | 'terms_waiver';
          rules: Record<string, any>;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          template_id?: string | null;
          name: string;
          type: 'cancellation' | 'refund' | 'late_fee' | 'no_show' | 'sales_window' | 'terms_waiver';
          rules: Record<string, any>;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          template_id?: string | null;
          name?: string;
          type?: 'cancellation' | 'refund' | 'late_fee' | 'no_show' | 'sales_window' | 'terms_waiver';
          rules?: Record<string, any>;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Virtual sessions
      virtual_sessions: {
        Row: {
          id: string;
          occurrence_id: string;
          org_id: string;
          platform: 'zoom' | 'meet' | 'teams' | 'custom';
          meeting_id: string;
          join_url: string;
          host_key: string | null;
          password: string | null;
          recording_enabled: boolean;
          recording_url: string | null;
          join_limits: Record<string, any> | null;
          watermark_settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          org_id: string;
          platform: 'zoom' | 'meet' | 'teams' | 'custom';
          meeting_id: string;
          join_url: string;
          host_key?: string | null;
          password?: string | null;
          recording_enabled?: boolean;
          recording_url?: string | null;
          join_limits?: Record<string, any> | null;
          watermark_settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          occurrence_id?: string;
          org_id?: string;
          platform?: 'zoom' | 'meet' | 'teams' | 'custom';
          meeting_id?: string;
          join_url?: string;
          host_key?: string | null;
          password?: string | null;
          recording_enabled?: boolean;
          recording_url?: string | null;
          join_limits?: Record<string, any> | null;
          watermark_settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Notifications queue
      notifications: {
        Row: {
          id: string;
          org_id: string;
          customer_id: string;
          type: 'confirmation' | 'reminder' | 'update' | 'cancellation' | 'waitlist_promotion' | 'feedback_request';
          channel: 'email' | 'sms' | 'push' | 'in_app';
          template_name: string;
          template_data: Record<string, any>;
          locale: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          status: 'pending' | 'sent' | 'failed' | 'cancelled';
          scheduled_at: string;
          sent_at: string | null;
          error_message: string | null;
          retry_count: number;
          max_retries: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          customer_id: string;
          type: 'confirmation' | 'reminder' | 'update' | 'cancellation' | 'waitlist_promotion' | 'feedback_request';
          channel: 'email' | 'sms' | 'push' | 'in_app';
          template_name: string;
          template_data: Record<string, any>;
          locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          status?: 'pending' | 'sent' | 'failed' | 'cancelled';
          scheduled_at: string;
          sent_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
          max_retries?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          customer_id?: string;
          type?: 'confirmation' | 'reminder' | 'update' | 'cancellation' | 'waitlist_promotion' | 'feedback_request';
          channel?: 'email' | 'sms' | 'push' | 'in_app';
          template_name?: string;
          template_data?: Record<string, any>;
          locale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH';
          status?: 'pending' | 'sent' | 'failed' | 'cancelled';
          scheduled_at?: string;
          sent_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
          max_retries?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Audit logs
      audit_logs: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          changes: Record<string, any> | null;
          impersonation_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          changes?: Record<string, any> | null;
          impersonation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          changes?: Record<string, any> | null;
          impersonation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      // Invoices with Swiss QR-bill support
      invoices: {
        Row: {
          id: string;
          order_id: string;
          customer_id: string;
          org_id: string;
          invoice_number: string;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date: string;
          due_date: string;
          paid_date: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          qr_bill_data: Record<string, any> | null; // Swiss QR-bill specific data
          qr_code_url: string | null;
          pdf_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          customer_id: string;
          org_id: string;
          invoice_number: string;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date: string;
          due_date: string;
          paid_date?: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency?: string;
          qr_bill_data?: Record<string, any> | null;
          qr_code_url?: string | null;
          pdf_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          customer_id?: string;
          org_id?: string;
          invoice_number?: string;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date?: string;
          due_date?: string;
          paid_date?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          qr_bill_data?: Record<string, any> | null;
          qr_code_url?: string | null;
          pdf_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}