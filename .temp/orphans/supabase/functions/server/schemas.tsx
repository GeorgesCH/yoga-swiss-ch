// Multi-tenant Organization Hierarchy & Wallet System Schemas for YogaSwiss
// This file defines the database structure for the Swiss yoga platform

export interface Org {
  id: string;
  type: 'brand' | 'studio';
  parent_org_id?: string; // Brand ID for studios
  name: string;
  slug: string;
  currency: string; // Default CHF
  timezone: string; // Default Europe/Zurich
  settings: {
    // Payment settings
    twint_enabled?: boolean;
    qr_bill_enabled?: boolean;
    stripe_enabled?: boolean;
    vat_rate?: number; // Swiss VAT rate (usually 7.7%)
    vat_number?: string;
    
    // Business settings
    business_hours?: { [day: string]: { open: string; close: string } };
    booking_window_days?: number;
    cancellation_policy?: string;
    
    // Localization
    languages: string[]; // ['de', 'fr', 'it', 'en']
    default_language: string;
    
    // Branding
    logo_url?: string;
    primary_color?: string;
    website?: string;
    
    // Inherited from parent (for studios)
    inherit_payment_settings?: boolean;
    inherit_policies?: boolean;
  };
  status: 'active' | 'setup_incomplete' | 'suspended' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface OrgUser {
  org_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'front_desk' | 'instructor' | 'accountant' | 'marketer';
  location_scope?: string[]; // Array of location IDs this user can access
  permissions: {
    schedule: boolean;
    customers: boolean;
    finance: boolean;
    marketing: boolean;
    settings: boolean;
    analytics: boolean;
  };
  status: 'active' | 'pending' | 'suspended';
  joined_at: string;
  last_active_at?: string;
}

export interface Location {
  id: string;
  org_id: string; // Studio ID
  name: string;
  type: 'studio' | 'outdoor' | 'online';
  address?: {
    street: string;
    city: string;
    postal_code: string;
    canton: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  capacity?: number;
  amenities?: string[];
  equipment?: string[];
  settings: {
    bookable: boolean;
    require_instructor: boolean;
    allow_drop_in: boolean;
    safety_protocols?: string[];
  };
  status: 'active' | 'maintenance' | 'closed';
  created_at: string;
  updated_at: string;
}

// Wallet System Schemas

export interface Wallet {
  id: string;
  org_id: string; // Scoped to organization
  owner_type: 'studio' | 'instructor';
  user_id: string; // Customer ID
  kind: 'customer' | 'gift' | 'promotion';
  currency: string; // CHF
  balance_cents: number; // Store as cents to avoid floating point issues
  credits: number;
  status: 'active' | 'frozen' | 'closed';
  metadata: {
    created_by?: string;
    notes?: string;
    restrictions?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface WalletLedger {
  id: string;
  wallet_id: string;
  timestamp: string;
  entry_type: 'debit' | 'credit';
  amount_cents: number;
  credits_delta: number;
  reason: string;
  order_id?: string;
  payment_id?: string;
  pass_id?: string;
  metadata: {
    description?: string;
    reference?: string;
    initiated_by?: string;
  };
}

export interface Package {
  id: string;
  org_id: string;
  kind: 'pack' | 'membership' | 'gift_card';
  name: string;
  description?: string;
  price_cents: number;
  tax_mode: 'inclusive' | 'exclusive';
  vat_rate: number; // Swiss VAT rate
  credits?: number; // For credit packs
  duration_days?: number; // For memberships
  features: {
    shareable: boolean;
    transferable: boolean;
    per_org_only: boolean;
    auto_renewal: boolean;
    freeze_allowed: boolean;
  };
  restrictions: {
    valid_locations?: string[];
    valid_class_types?: string[];
    blackout_dates?: string[];
    max_bookings_per_day?: number;
  };
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Pass {
  id: string;
  package_id: string;
  wallet_id: string;
  original_credits?: number;
  remaining_credits: number;
  starts_at?: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'frozen' | 'used' | 'refunded';
  usage_history: {
    used_at: string;
    class_id: string;
    credits_used: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  org_id: string;
  customer_id: string;
  wallet_id?: string;
  total_cents: number;
  tax_cents: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  metadata: {
    notes?: string;
    promo_code?: string;
    referral_source?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  type: 'class' | 'package' | 'retail' | 'fee';
  item_id: string; // class_id, package_id, etc.
  name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  tax_rate: number;
  metadata: {
    class_date?: string;
    instructor_id?: string;
    location_id?: string;
  };
}

export interface Payment {
  id: string;
  order_id: string;
  amount_cents: number;
  currency: string;
  method: 'stripe' | 'twint' | 'qr_bill' | 'cash' | 'account_credit' | 'bank_transfer';
  provider: string; // 'stripe', 'datatrans', 'twint', 'manual'
  provider_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  metadata: {
    twint_qr_code?: string;
    qr_bill_reference?: string;
    stripe_payment_intent?: string;
    failure_reason?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SwissPaymentSettings {
  org_id: string;
  
  // TWINT settings
  twint_enabled: boolean;
  twint_provider: 'datatrans' | 'wallee'; // Swiss TWINT providers
  twint_merchant_id?: string;
  twint_api_key?: string;
  
  // QR-Bill settings
  qr_bill_enabled: boolean;
  creditor_name: string;
  creditor_address: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
  };
  iban: string;
  qr_iban?: string; // Special QR-IBAN if different
  
  // Swiss tax settings
  vat_number?: string;
  vat_rate: number; // Usually 7.7% in Switzerland
  tax_inclusive: boolean; // Whether displayed prices include VAT
  
  // Bank settings for reconciliation
  bank_account?: {
    name: string;
    iban: string;
    swift?: string;
  };
  
  created_at: string;
  updated_at: string;
}

// Permission and access control helpers
export const ROLE_PERMISSIONS = {
  owner: {
    schedule: true,
    customers: true,
    finance: true,
    marketing: true,
    settings: true,
    analytics: true,
    wallet_management: true,
    user_management: true
  },
  manager: {
    schedule: true,
    customers: true,
    finance: true,
    marketing: true,
    settings: false,
    analytics: true,
    wallet_management: true,
    user_management: false
  },
  front_desk: {
    schedule: true,
    customers: true,
    finance: false,
    marketing: false,
    settings: false,
    analytics: false,
    wallet_management: false,
    user_management: false
  },
  instructor: {
    schedule: true, // Own schedule only
    customers: false, // Masked by default
    finance: false,
    marketing: false,
    settings: false,
    analytics: false,
    wallet_management: false,
    user_management: false
  },
  accountant: {
    schedule: false,
    customers: false,
    finance: true,
    marketing: false,
    settings: false,
    analytics: true,
    wallet_management: true,
    user_management: false
  },
  marketer: {
    schedule: false,
    customers: true, // No PII access
    finance: false,
    marketing: true,
    settings: false,
    analytics: true,
    wallet_management: false,
    user_management: false
  }
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = keyof typeof ROLE_PERMISSIONS.owner;