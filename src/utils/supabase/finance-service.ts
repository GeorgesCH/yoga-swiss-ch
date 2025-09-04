import { supabase } from './client';
import { getSupabaseProjectId, getSupabaseAnonKey } from './env';

// Types for Finance Service
export interface Order {
  id: string;
  tenant_id: string;
  customer_id?: string;
  studio_id?: string;
  location_id?: string;
  order_number: string;
  channel: 'web' | 'mobile' | 'pos' | 'admin' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  currency: string;
  subtotal_cents: number;
  tax_total_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_email?: string;
  customer_name?: string;
  customer_address?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  tenant_id: string;
  item_type: 'registration' | 'retail' | 'membership' | 'pass' | 'fee' | 'gift_card' | 'service';
  name: string;
  description?: string;
  sku?: string;
  class_id?: string;
  product_id?: string;
  package_id?: string;
  service_id?: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  tax_rate: number;
  tax_amount_cents: number;
  tax_inclusive: boolean;
  revenue_category_id?: string;
  studio_id?: string;
  location_id?: string;
  instructor_id?: string;
  metadata?: any;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  order_id: string;
  method: 'card' | 'twint' | 'cash' | 'bank_transfer' | 'wallet' | 'gift_card' | 'qr_bill';
  provider?: string;
  provider_payment_id?: string;
  provider_intent_id?: string;
  amount_cents: number;
  fee_amount_cents: number;
  net_amount_cents: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'partially_captured' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'chargeback';
  authorized_at?: string;
  captured_at?: string;
  failed_at?: string;
  failure_reason?: string;
  failure_code?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  tenant_id: string;
  order_id: string;
  payment_id?: string;
  refund_number: string;
  amount_cents: number;
  currency: string;
  reason: string;
  reason_code?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider_refund_id?: string;
  initiated_by?: string;
  approved_by?: string;
  metadata?: any;
  notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerWallet {
  id: string;
  tenant_id: string;
  customer_id: string;
  studio_id?: string;
  instructor_id?: string;
  wallet_type: 'customer' | 'gift' | 'promotion' | 'corporate';
  currency: string;
  balance_cents: number;
  reserved_cents: number;
  available_cents: number;
  total_credits: number;
  used_credits: number;
  available_credits: number;
  credits_expiry?: string;
  status: 'active' | 'frozen' | 'closed';
  rules?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  tenant_id: string;
  transaction_timestamp: string;
  entry_type: 'credit' | 'debit' | 'reserve' | 'release' | 'expiry' | 'transfer_in' | 'transfer_out';
  amount_cents: number;
  credits_delta: number;
  balance_after_cents: number;
  credits_after: number;
  reference_type?: 'order' | 'refund' | 'adjustment' | 'transfer' | 'expiry' | 'purchase' | 'redemption';
  reference_id?: string;
  description: string;
  reason_code?: string;
  initiated_by?: string;
  metadata?: any;
  created_at: string;
}

export interface GiftCard {
  id: string;
  tenant_id: string;
  code: string;
  initial_amount_cents: number;
  current_balance_cents: number;
  currency: string;
  purchaser_id?: string;
  recipient_id?: string;
  recipient_email?: string;
  recipient_name?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  expires_at?: string;
  activated_at?: string;
  first_use_at?: string;
  last_use_at?: string;
  message?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: any;
  customer_vat_id?: string;
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
  currency: string;
  tax_mode: 'inclusive' | 'exclusive';
  tax_breakdown?: any;
  pdf_url?: string;
  qr_bill_url?: string;
  qr_bill_reference?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  sent_at?: string;
  paid_at?: string;
  metadata?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorEarnings {
  id: string;
  tenant_id: string;
  instructor_id: string;
  period_start: string;
  period_end: string;
  total_classes: number;
  total_students: number;
  base_earnings_cents: number;
  bonus_earnings_cents: number;
  adjustments_cents: number;
  deductions_cents: number;
  gross_earnings_cents: number;
  payment_status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_method?: 'bank_transfer' | 'cash' | 'payroll';
  payment_reference?: string;
  calculated_at?: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  breakdown?: any;
  metadata?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CashDrawer {
  id: string;
  tenant_id: string;
  location_id: string;
  drawer_name: string;
  drawer_number?: string;
  register_id?: string;
  current_session_id?: string;
  current_operator_id?: string;
  status: 'closed' | 'open' | 'locked' | 'maintenance';
  current_balance_cents: number;
  expected_balance_cents: number;
  last_z_report_at?: string;
  last_z_report_number?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Finance Service Implementation
export class FinanceService {
  private static instance: FinanceService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/finance`;
  }

  public static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSupabaseAnonKey()}`,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Determine if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Only log detailed errors in development
      if (isDevelopment) {
        console.warn(`Finance API unavailable [${endpoint}] - using fallback data`);
      }
      
      // Return fallback data for development when API is not available
      if (endpoint.includes('/reports/summary/')) {
        return { 
          data: {
            total_revenue_cents: 0,
            total_orders: 0,
            total_customers: 0,
            average_order_value_cents: 0,
            revenue_by_category: [],
            daily_revenue: [],
            payment_methods: []
          }
        };
      }
      
      if (endpoint.includes('/orders/')) {
        return { data: [] };
      }
      
      throw error;
    }
  }

  // Order Management
  async createOrder(orderData: {
    tenant_id: string;
    customer_id?: string;
    studio_id?: string;
    location_id?: string;
    channel: string;
    customer_details: any;
    items: any[];
    metadata?: any;
  }) {
    try {
      const data = await this.makeRequest('/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getOrders(tenantId: string, filters?: {
    status?: string;
    customer_id?: string;
    studio_id?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.studio_id) params.append('studio_id', filters.studio_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const endpoint = `/orders/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch orders data', data: [] };
    }
  }

  async getOrder(tenantId: string, orderId: string) {
    try {
      const data = await this.makeRequest(`/orders/${tenantId}/${orderId}`);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Payment Management
  async processPayment(paymentData: {
    tenant_id: string;
    order_id: string;
    payment_method: string;
    provider?: string;
    provider_payment_id?: string;
    amount_cents: number;
    fee_amount_cents?: number;
    metadata?: any;
  }) {
    try {
      const data = await this.makeRequest('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async capturePayment(tenantId: string, paymentId: string, captureAmountCents?: number) {
    try {
      const { data, error } = await supabase.rpc('capture_payment', {
        p_tenant_id: tenantId,
        p_payment_id: paymentId,
        p_capture_amount_cents: captureAmountCents
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error capturing payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getPayments(tenantId: string, filters?: {
    order_id?: string;
    status?: string;
    method?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.order_id) params.append('order_id', filters.order_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.method) params.append('method', filters.method);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `/payments/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Refund Management
  async processRefund(refundData: {
    tenant_id: string;
    order_id: string;
    payment_id?: string;
    amount_cents: number;
    reason: string;
    reason_code?: string;
    initiated_by?: string;
    notes?: string;
  }) {
    try {
      const data = await this.makeRequest('/refunds/process', {
        method: 'POST',
        body: JSON.stringify(refundData),
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getRefunds(tenantId: string, filters?: {
    order_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.order_id) params.append('order_id', filters.order_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `/refunds/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching refunds:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Wallet Management
  async getCustomerWallets(tenantId: string, customerId?: string) {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId);

      const queryString = params.toString();
      const endpoint = `/wallets/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching customer wallets:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  async addWalletFunds(walletData: {
    tenant_id: string;
    customer_id: string;
    studio_id?: string;
    instructor_id?: string;
    amount_cents?: number;
    credits?: number;
    reason?: string;
    description?: string;
    initiated_by?: string;
  }) {
    try {
      const data = await this.makeRequest('/wallets/add-funds', {
        method: 'POST',
        body: JSON.stringify(walletData),
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error adding wallet funds:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async useWalletCredits(walletData: {
    tenant_id: string;
    customer_id: string;
    studio_id?: string;
    instructor_id?: string;
    amount_cents?: number;
    credits?: number;
    order_id?: string;
    description?: string;
  }) {
    // TODO: Implement wallet credit usage
    return { success: false, error: 'Not implemented yet' };
  }

  async getWalletHistory(tenantId: string, walletId: string, limit: number = 50) {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      const data = await this.makeRequest(`/wallets/${walletId}/history?${params.toString()}`);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching wallet history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Gift Card Management
  async createGiftCard(giftCardData: {
    tenant_id: string;
    code?: string;
    initial_amount_cents: number;
    purchaser_id?: string;
    recipient_email?: string;
    recipient_name?: string;
    expires_at?: string;
    message?: string;
    metadata?: any;
  }) {
    try {
      const code = giftCardData.code || this.generateGiftCardCode();
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert({
          tenant_id: giftCardData.tenant_id,
          code,
          initial_amount_cents: giftCardData.initial_amount_cents,
          current_balance_cents: giftCardData.initial_amount_cents,
          currency: 'CHF',
          purchaser_id: giftCardData.purchaser_id,
          recipient_email: giftCardData.recipient_email,
          recipient_name: giftCardData.recipient_name,
          expires_at: giftCardData.expires_at,
          message: giftCardData.message,
          metadata: giftCardData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating gift card:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getGiftCards(tenantId: string, filters?: {
    status?: string;
    purchaser_id?: string;
    recipient_id?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('gift_cards')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.purchaser_id) {
        query = query.eq('purchaser_id', filters.purchaser_id);
      }
      if (filters?.recipient_id) {
        query = query.eq('recipient_id', filters.recipient_id);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Invoice Management
  async generateInvoice(tenantId: string, orderId: string, dueDays: number = 30) {
    try {
      const data = await this.makeRequest('/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          order_id: orderId,
          due_days: dueDays
        }),
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error generating invoice:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getInvoices(tenantId: string, filters?: {
    customer_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `/invoices/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await this.makeRequest(endpoint);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Instructor Earnings
  async calculateInstructorEarnings(
    tenantId: string,
    instructorId: string,
    periodStart: string,
    periodEnd: string
  ) {
    try {
      const { data, error } = await supabase.rpc('calculate_instructor_earnings', {
        p_tenant_id: tenantId,
        p_instructor_id: instructorId,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error calculating instructor earnings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getInstructorEarnings(tenantId: string, instructorId?: string, filters?: {
    period_start?: string;
    period_end?: string;
    payment_status?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('instructor_earnings')
        .select(`
          *,
          earnings_details (*)
        `)
        .eq('tenant_id', tenantId)
        .order('period_start', { ascending: false });

      if (instructorId) {
        query = query.eq('instructor_id', instructorId);
      }
      if (filters?.period_start) {
        query = query.gte('period_start', filters.period_start);
      }
      if (filters?.period_end) {
        query = query.lte('period_end', filters.period_end);
      }
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching instructor earnings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  // Financial Reports
  async getFinancialSummary(tenantId: string, periodStart: string, periodEnd: string) {
    try {
      const params = new URLSearchParams({
        period_start: periodStart,
        period_end: periodEnd
      });

      const data = await this.makeRequest(`/reports/summary/${tenantId}?${params.toString()}`);
      return { success: true, data: data.data };
    } catch (error) {
      // Return fallback data silently for development
      return { 
        success: true, 
        data: {
          total_revenue_cents: 0,
          total_orders: 0,
          total_customers: 0,
          average_order_value_cents: 0,
          revenue_by_category: [],
          daily_revenue: [],
          payment_methods: []
        }
      };
    }
  }

  // Cash Drawer Management
  async getCashDrawers(tenantId: string, locationId?: string) {
    try {
      let query = supabase
        .from('cash_drawers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('drawer_name');

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching cash drawers:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: [] };
    }
  }

  async openCashDrawerSession(
    tenantId: string,
    drawerId: string,
    operatorId: string,
    openingBalanceCents: number
  ) {
    try {
      const { data, error } = await supabase
        .from('cash_drawer_sessions')
        .insert({
          drawer_id: drawerId,
          tenant_id: tenantId,
          operator_id: operatorId,
          opening_balance_cents: openingBalanceCents,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      // Update drawer status
      await supabase
        .from('cash_drawers')
        .update({
          status: 'open',
          current_session_id: data.id,
          current_operator_id: operatorId,
          current_balance_cents: openingBalanceCents,
          expected_balance_cents: openingBalanceCents
        })
        .eq('id', drawerId);

      return { success: true, data };
    } catch (error) {
      console.error('Error opening cash drawer session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Utility functions
  private generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Currency formatting for Switzerland
  formatCHF(amountCents: number): string {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amountCents / 100);
  }

  // VAT calculation helpers
  calculateVATInclusive(amountCents: number, vatRate: number): number {
    return Math.round(amountCents * vatRate / (100 + vatRate));
  }

  calculateVATExclusive(amountCents: number, vatRate: number): number {
    return Math.round(amountCents * vatRate / 100);
  }
}

export const financeService = FinanceService.getInstance();

// Export singleton instance as default
export default financeService;
