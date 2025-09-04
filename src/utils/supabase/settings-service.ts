// =============================================
// SETTINGS SERVICE
// Frontend service for managing organization settings,
// user preferences, and global configuration
// =============================================

export interface OrgSetting {
  category: string;
  key: string;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updated_at?: string;
}

export interface UserPreference {
  category: string;
  key: string;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  org_id?: string;
  updated_at?: string;
}

export interface GlobalSetting {
  category: string;
  key: string;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
  description?: string;
  updated_at?: string;
}

export interface SettingsGroup {
  [key: string]: {
    value: any;
    data_type: string;
    description?: string;
    updated_at?: string;
  };
}

export interface SettingsData {
  [category: string]: SettingsGroup;
}

export class SettingsService {
  private static baseUrl = '';
  private static accessToken = '';

  // Initialize service with base URL and auth token
  static init(projectId: string, token: string) {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/settings`;
    this.accessToken = token;
  }

  // Helper method to make API calls
  private static async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    return result;
  }

  // =============================================
  // ORGANIZATION SETTINGS
  // =============================================

  // Get all organization settings
  static async getOrgSettings(orgId: string, category?: string): Promise<SettingsData> {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const result = await this.apiCall(`/org/${orgId}${params}`);
      return result.data || {};
    } catch (error) {
      console.warn('Failed to load org settings, using defaults:', error);
      return this.getDefaultOrgSettings();
    }
  }

  // Update single organization setting
  static async setOrgSetting(
    orgId: string,
    category: string,
    key: string,
    value: any,
    dataType: OrgSetting['data_type'] = 'json',
    description?: string
  ): Promise<any> {
    const result = await this.apiCall(`/org/${orgId}/${category}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({
        value,
        data_type: dataType,
        description,
      }),
    });
    return result.data?.value;
  }

  // Batch update multiple organization settings
  static async batchUpdateOrgSettings(
    orgId: string,
    settings: Array<{
      category: string;
      key: string;
      value: any;
      data_type?: OrgSetting['data_type'];
      description?: string;
    }>
  ): Promise<any> {
    const result = await this.apiCall(`/org/${orgId}/batch`, {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
    return result;
  }

  // =============================================
  // USER PREFERENCES
  // =============================================

  // Get user preferences
  static async getUserPreferences(
    userId: string,
    orgId?: string,
    category?: string
  ): Promise<SettingsData> {
    try {
      const params = new URLSearchParams();
      if (orgId) params.append('org_id', orgId);
      if (category) params.append('category', category);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const result = await this.apiCall(`/user/${userId}/preferences${queryString}`);
      return result.data || {};
    } catch (error) {
      console.warn('Failed to load user preferences, using defaults:', error);
      return this.getDefaultUserPreferences();
    }
  }

  // Set user preference
  static async setUserPreference(
    userId: string,
    category: string,
    key: string,
    value: any,
    orgId?: string,
    dataType: UserPreference['data_type'] = 'json'
  ): Promise<any> {
    const result = await this.apiCall(`/user/${userId}/preferences/${category}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({
        value,
        data_type: dataType,
        org_id: orgId,
      }),
    });
    return result.data?.value;
  }

  // =============================================
  // GLOBAL SETTINGS
  // =============================================

  // Get global settings (public only by default)
  static async getGlobalSettings(category?: string, publicOnly: boolean = true): Promise<SettingsData> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (publicOnly) params.append('public_only', 'true');
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const result = await this.apiCall(`/global${queryString}`);
      return result.data || {};
    } catch (error) {
      console.warn('Failed to load global settings, using defaults:', error);
      return {};
    }
  }

  // =============================================
  // TYPED SETTINGS ACCESSORS
  // =============================================

  // Get strongly typed org setting
  static async getOrgSetting<T = any>(
    orgId: string,
    category: string,
    key: string,
    defaultValue?: T
  ): Promise<T> {
    try {
      const settings = await this.getOrgSettings(orgId, category);
      const value = settings[category]?.[key]?.value;
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      return defaultValue as T;
    }
  }

  // Get strongly typed user preference
  static async getUserPreference<T = any>(
    userId: string,
    category: string,
    key: string,
    defaultValue?: T,
    orgId?: string
  ): Promise<T> {
    try {
      const preferences = await this.getUserPreferences(userId, orgId, category);
      const value = preferences[category]?.[key]?.value;
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      return defaultValue as T;
    }
  }

  // =============================================
  // DEFAULT SETTINGS
  // =============================================

  private static getDefaultOrgSettings(): SettingsData {
    return {
      general: {
        timezone: { value: 'Europe/Zurich', data_type: 'string' },
        default_locale: { value: 'de-CH', data_type: 'string' },
        currency: { value: 'CHF', data_type: 'string' },
        vat_rate: { value: 7.7, data_type: 'number' },
        business_name: { value: 'YogaSwiss Studio', data_type: 'string' },
        contact_email: { value: 'studio@yogaswiss.ch', data_type: 'string' },
        contact_phone: { value: '+41 44 123 45 67', data_type: 'string' },
      },
      classes: {
        default_duration: { value: 60, data_type: 'number' },
        default_capacity: { value: 20, data_type: 'number' },
        default_price: { value: 25.0, data_type: 'number' },
        booking_window_hours: { value: 24, data_type: 'number' },
        cancellation_window_hours: { value: 2, data_type: 'number' },
        waitlist_enabled: { value: true, data_type: 'boolean' },
        auto_confirm_from_waitlist: { value: true, data_type: 'boolean' },
      },
      payments: {
        twint_enabled: { value: true, data_type: 'boolean' },
        stripe_enabled: { value: true, data_type: 'boolean' },
        qr_bill_enabled: { value: true, data_type: 'boolean' },
        payment_methods: { 
          value: ['twint', 'credit_card', 'qr_bill'], 
          data_type: 'json' 
        },
      },
      notifications: {
        booking_confirmation: { value: true, data_type: 'boolean' },
        class_reminders: { value: true, data_type: 'boolean' },
        cancellation_notifications: { value: true, data_type: 'boolean' },
        waitlist_notifications: { value: true, data_type: 'boolean' },
        payment_notifications: { value: true, data_type: 'boolean' },
      },
      automations: {
        auto_reminders: { value: true, data_type: 'boolean' },
        auto_waitlist: { value: true, data_type: 'boolean' },
        auto_feedback: { value: false, data_type: 'boolean' },
        reminder_hours_before: { value: 2, data_type: 'number' },
      },
      integrations: {
        google_calendar_sync: { value: false, data_type: 'boolean' },
        zoom_integration: { value: false, data_type: 'boolean' },
        mailchimp_sync: { value: false, data_type: 'boolean' },
      },
      branding: {
        primary_color: { value: '#2B5D31', data_type: 'string' },
        secondary_color: { value: '#E8B86D', data_type: 'string' },
        logo_url: { value: '', data_type: 'string' },
        brand_font: { value: 'Inter', data_type: 'string' },
      },
    };
  }

  private static getDefaultUserPreferences(): SettingsData {
    return {
      interface: {
        theme: { value: 'light', data_type: 'string' },
        language: { value: 'de-CH', data_type: 'string' },
        timezone: { value: 'Europe/Zurich', data_type: 'string' },
        date_format: { value: 'DD.MM.YYYY', data_type: 'string' },
        time_format: { value: '24h', data_type: 'string' },
      },
      notifications: {
        email_enabled: { value: true, data_type: 'boolean' },
        sms_enabled: { value: false, data_type: 'boolean' },
        push_enabled: { value: true, data_type: 'boolean' },
        marketing_consent: { value: false, data_type: 'boolean' },
      },
      dashboard: {
        default_view: { value: 'overview', data_type: 'string' },
        show_weather: { value: true, data_type: 'boolean' },
        quick_actions: { 
          value: ['create_class', 'view_registrations', 'check_revenue'], 
          data_type: 'json' 
        },
      },
    };
  }

  // =============================================
  // SETTINGS CATEGORIES & VALIDATION
  // =============================================

  static getSettingsSchema() {
    return {
      general: {
        name: 'General Settings',
        description: 'Basic organization configuration',
        fields: {
          business_name: { type: 'string', required: true, label: 'Business Name' },
          timezone: { type: 'string', required: true, label: 'Timezone' },
          default_locale: { type: 'string', required: true, label: 'Default Language' },
          currency: { type: 'string', required: true, label: 'Currency' },
          vat_rate: { type: 'number', required: true, label: 'VAT Rate (%)' },
          contact_email: { type: 'string', required: true, label: 'Contact Email' },
          contact_phone: { type: 'string', required: false, label: 'Contact Phone' },
        },
      },
      classes: {
        name: 'Classes & Scheduling',
        description: 'Default settings for classes and bookings',
        fields: {
          default_duration: { type: 'number', required: true, label: 'Default Duration (minutes)' },
          default_capacity: { type: 'number', required: true, label: 'Default Capacity' },
          default_price: { type: 'number', required: true, label: 'Default Price (CHF)' },
          booking_window_hours: { type: 'number', required: true, label: 'Booking Window (hours)' },
          cancellation_window_hours: { type: 'number', required: true, label: 'Cancellation Window (hours)' },
          waitlist_enabled: { type: 'boolean', required: false, label: 'Enable Waitlist' },
          auto_confirm_from_waitlist: { type: 'boolean', required: false, label: 'Auto-confirm from Waitlist' },
        },
      },
      payments: {
        name: 'Payments & Billing',
        description: 'Payment methods and billing configuration',
        fields: {
          twint_enabled: { type: 'boolean', required: false, label: 'Enable TWINT' },
          stripe_enabled: { type: 'boolean', required: false, label: 'Enable Stripe' },
          qr_bill_enabled: { type: 'boolean', required: false, label: 'Enable QR Bill' },
        },
      },
      notifications: {
        name: 'Notifications',
        description: 'Email and SMS notification settings',
        fields: {
          booking_confirmation: { type: 'boolean', required: false, label: 'Booking Confirmations' },
          class_reminders: { type: 'boolean', required: false, label: 'Class Reminders' },
          cancellation_notifications: { type: 'boolean', required: false, label: 'Cancellation Notifications' },
          waitlist_notifications: { type: 'boolean', required: false, label: 'Waitlist Notifications' },
          payment_notifications: { type: 'boolean', required: false, label: 'Payment Notifications' },
        },
      },
      automations: {
        name: 'Automations',
        description: 'Automated processes and workflows',
        fields: {
          auto_reminders: { type: 'boolean', required: false, label: 'Automatic Reminders' },
          auto_waitlist: { type: 'boolean', required: false, label: 'Automatic Waitlist Management' },
          auto_feedback: { type: 'boolean', required: false, label: 'Automatic Feedback Requests' },
          reminder_hours_before: { type: 'number', required: false, label: 'Reminder Hours Before Class' },
        },
      },
      integrations: {
        name: 'Integrations',
        description: 'Third-party service integrations',
        fields: {
          google_calendar_sync: { type: 'boolean', required: false, label: 'Google Calendar Sync' },
          zoom_integration: { type: 'boolean', required: false, label: 'Zoom Integration' },
          mailchimp_sync: { type: 'boolean', required: false, label: 'Mailchimp Sync' },
        },
      },
    };
  }

  // Validate setting value
  static validateSetting(category: string, key: string, value: any): boolean {
    const schema = this.getSettingsSchema();
    const field = schema[category]?.fields[key];
    
    if (!field) return false;
    
    switch (field.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'json':
        return true; // JSON can be any value
      default:
        return false;
    }
  }
}