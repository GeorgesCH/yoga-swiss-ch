import { supabase } from '../../utils/supabase/client';
import type { Database } from '../../utils/supabase/schemas';

type Tables = Database['public']['Tables'];
type ClassOccurrence = Tables['class_occurrences']['Row'];
type Registration = Tables['registrations']['Row'];
type Wallet = Tables['wallets']['Row'];
type Order = Tables['orders']['Row'];

// Supabase service for core operations
export class SupabaseIntegrationService {
  
  // ==================== CLASS OPERATIONS ====================
  
  async getClassOccurrences(orgId: string, filters?: {
    startDate?: string;
    endDate?: string;
    instructorId?: string;
    locationId?: string;
    status?: string;
  }) {
    let query = supabase
      .from('class_occurrences')
      .select(`
        *,
        template:class_templates(*),
        instructor:user_profiles(*),
        location:locations(*),
        registrations(*)
      `)
      .eq('org_id', orgId);

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId);
    }
    if (filters?.locationId) {
      query = query.eq('location_id', filters.locationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createClassOccurrence(occurrence: Tables['class_occurrences']['Insert']) {
    const { data, error } = await supabase
      .from('class_occurrences')
      .insert(occurrence)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateClassOccurrence(id: string, updates: Tables['class_occurrences']['Update']) {
    const { data, error } = await supabase
      .from('class_occurrences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async cancelClassOccurrence(id: string, reason: string, notifyCustomers = true) {
    // 1. Update class status
    const { data: occurrence, error: updateError } = await supabase
      .from('class_occurrences')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Get all confirmed registrations for refund processing
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('occurrence_id', id)
      .eq('status', 'confirmed');

    if (regError) throw regError;

    // 3. Process refunds for each registration
    if (registrations && notifyCustomers) {
      await Promise.all(
        registrations.map(reg => this.processAutomaticRefund(reg, 'instructor_cancellation'))
      );
    }

    return { occurrence, affectedRegistrations: registrations?.length || 0 };
  }

  // ==================== BOOKING OPERATIONS ====================
  
  async createBooking(bookingData: {
    occurrenceId: string;
    customerId: string;
    orgId: string;
    paymentMethod: string;
    amount: number;
    notes?: string;
  }) {
    const { occurrenceId, customerId, orgId, paymentMethod, amount, notes } = bookingData;

    // Start transaction
    const { data, error } = await supabase.rpc('create_booking_transaction', {
      p_occurrence_id: occurrenceId,
      p_customer_id: customerId,
      p_org_id: orgId,
      p_payment_method: paymentMethod,
      p_amount: amount,
      p_notes: notes
    });

    if (error) throw error;
    return data;
  }

  async getCustomerRegistrations(customerId: string, orgId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('registrations')
      .select(`
        *,
        occurrence:class_occurrences(*,
          template:class_templates(*),
          location:locations(*)
        )
      `)
      .eq('customer_id', customerId)
      .eq('org_id', orgId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('booked_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateRegistrationStatus(registrationId: string, status: Registration['status'], notes?: string) {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
        ...(status === 'cancelled' && { cancelled_at: new Date().toISOString() })
      })
      .eq('id', registrationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ==================== WALLET OPERATIONS ====================
  
  async getCustomerWallet(customerId: string, orgId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('customer_id', customerId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No wallet found, create one
      return this.createCustomerWallet(customerId, orgId);
    }
    
    if (error) throw error;
    return data;
  }

  async createCustomerWallet(customerId: string, orgId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        customer_id: customerId,
        org_id: orgId,
        balance: 0,
        currency: 'CHF',
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async addWalletCredit(
    customerId: string, 
    orgId: string, 
    amount: number, 
    reason: string,
    referenceType: string,
    referenceId: string
  ) {
    // Use stored procedure for atomic wallet transaction
    const { data, error } = await supabase.rpc('add_wallet_credit', {
      p_customer_id: customerId,
      p_org_id: orgId,
      p_amount: amount,
      p_reason: reason,
      p_reference_type: referenceType,
      p_reference_id: referenceId
    });

    if (error) throw error;
    return data;
  }

  async deductWalletCredit(
    customerId: string, 
    orgId: string, 
    amount: number, 
    reason: string,
    referenceType: string,
    referenceId: string
  ) {
    // Use stored procedure for atomic wallet transaction
    const { data, error } = await supabase.rpc('deduct_wallet_credit', {
      p_customer_id: customerId,
      p_org_id: orgId,
      p_amount: amount,
      p_reason: reason,
      p_reference_type: referenceType,
      p_reference_id: referenceId
    });

    if (error) throw error;
    return data;
  }

  // ==================== REFUND OPERATIONS ====================
  
  async processAutomaticRefund(registration: Registration, cancellationType: string) {
    const { data: occurrence } = await supabase
      .from('class_occurrences')
      .select('*, template:class_templates(*)')
      .eq('id', registration.occurrence_id)
      .single();

    if (!occurrence) throw new Error('Class occurrence not found');

    // Calculate refund based on cancellation policy
    const refundDetails = this.calculateRefundAmount(
      registration,
      occurrence,
      cancellationType
    );

    // Process refund transaction
    if (refundDetails.refundAmount > 0) {
      await this.processPaymentRefund(registration, refundDetails.refundAmount);
    }

    // Add wallet credit if applicable
    if (refundDetails.creditAmount > 0) {
      await this.addWalletCredit(
        registration.customer_id,
        registration.org_id,
        refundDetails.creditAmount,
        `Cancellation credit for class: ${occurrence.template?.name}`,
        'cancellation',
        registration.id
      );
    }

    // Update registration status
    await this.updateRegistrationStatus(registration.id, 'cancelled', `Auto-cancelled: ${cancellationType}`);

    return refundDetails;
  }

  private calculateRefundAmount(
    registration: Registration,
    occurrence: ClassOccurrence & { template?: any },
    cancellationType: string
  ) {
    // Get time difference
    const now = new Date();
    const classTime = new Date(occurrence.start_time);
    const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Default policy for different cancellation types
    let refundPercentage = 0;
    let creditPercentage = 0;
    let processingFee = 0;

    switch (cancellationType) {
      case 'instructor_cancellation':
      case 'weather_cancellation':
      case 'studio_cancellation':
        refundPercentage = 100;
        break;
      
      case 'customer_cancellation':
        if (hoursUntilClass >= 24) {
          refundPercentage = 100;
        } else if (hoursUntilClass >= 12) {
          refundPercentage = 50;
          creditPercentage = 50;
          processingFee = 2.50;
        } else if (hoursUntilClass >= 2) {
          creditPercentage = 100;
          processingFee = 2.50;
        }
        // Less than 2 hours: no refund or credit
        break;
    }

    const originalAmount = occurrence.price;
    const refundAmount = Math.max(0, (originalAmount * refundPercentage / 100) - processingFee);
    const creditAmount = originalAmount * creditPercentage / 100;

    return {
      originalAmount,
      refundAmount,
      creditAmount,
      processingFee,
      hoursUntilClass
    };
  }

  private async processPaymentRefund(registration: Registration, amount: number) {
    // Create refund order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: registration.customer_id,
        org_id: registration.org_id,
        status: 'refunded',
        items: [{
          type: 'refund',
          reference_id: registration.id,
          amount: -amount
        }],
        subtotal: -amount,
        tax_amount: 0,
        total_amount: -amount,
        currency: 'CHF',
        payment_method: 'refund',
        payment_status: 'completed',
        notes: `Refund for cancelled registration ${registration.id}`
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== PASSES & CREDITS ====================
  
  async getCustomerPasses(customerId: string, orgId: string) {
    const { data, error } = await supabase
      .from('passes')
      .select(`
        *,
        product:products(*)
      `)
      .eq('customer_id', customerId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async usePassCredit(passId: string, occurrenceId: string) {
    const { data, error } = await supabase.rpc('use_pass_credit', {
      p_pass_id: passId,
      p_occurrence_id: occurrenceId
    });

    if (error) throw error;
    return data;
  }

  async refundPassCredit(passId: string, occurrenceId: string) {
    const { data, error } = await supabase.rpc('refund_pass_credit', {
      p_pass_id: passId,
      p_occurrence_id: occurrenceId
    });

    if (error) throw error;
    return data;
  }

  // ==================== ANALYTICS ====================
  
  async getBookingAnalytics(orgId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_booking_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getCancellationAnalytics(orgId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_cancellation_analytics', {
      p_org_id: orgId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  subscribeToClassOccurrences(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('class_occurrences')
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

  subscribeToRegistrations(orgId: string, callback: (payload: any) => void) {
    return supabase
      .channel('registrations')
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

  subscribeToWalletTransactions(customerId: string, callback: (payload: any) => void) {
    return supabase
      .channel('wallet_transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `customer_id=eq.${customerId}`
        },
        callback
      )
      .subscribe();
  }

  // ==================== BATCH OPERATIONS ====================
  
  async processBulkCancellations(occurrenceIds: string[], reason: string, notifyCustomers = true) {
    const results = await Promise.allSettled(
      occurrenceIds.map(id => this.cancelClassOccurrence(id, reason, notifyCustomers))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed, results };
  }

  async processBulkRefunds(registrationIds: string[], reason: string) {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('*')
      .in('id', registrationIds);

    if (error) throw error;

    const results = await Promise.allSettled(
      registrations.map(reg => this.processAutomaticRefund(reg, reason))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed, results };
  }
}

// Create singleton instance
export const supabaseService = new SupabaseIntegrationService();