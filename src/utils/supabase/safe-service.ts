// Safe service utility for handling Supabase requests with fallbacks
import { supabase } from './client';
import { validateOrganizationId } from '../demo-uuid-helper';

export interface SafeServiceOptions {
  timeout?: number;
  retries?: number;
  fallbackData?: any;
  logErrors?: boolean;
}

export interface SafeServiceResult<T> {
  data: T | null;
  error: string | null;
  isFromFallback: boolean;
  connectionHealthy: boolean;
}

class SafeSupabaseService {
  private connectionHealthy = true;
  private lastHealthCheck = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  private async checkConnection(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.connectionHealthy;
    }

    try {
      // Use a very simple health check that doesn't depend on table structure
      const { error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any;

      // If we get any response (even an error about no session), connection is working
      this.connectionHealthy = true;
      this.lastHealthCheck = now;
      return this.connectionHealthy;
    } catch (error) {
      this.connectionHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  async safeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: SafeServiceOptions = {}
  ): Promise<SafeServiceResult<T>> {
    const {
      timeout = 10000,
      retries = 1,
      fallbackData = null,
      logErrors = true
    } = options;

    // Check connection health first
    const isHealthy = await this.checkConnection();
    
    if (!isHealthy) {
      if (logErrors) {
        console.warn('[SafeService] Connection unhealthy, returning fallback data');
      }
      return {
        data: fallbackData,
        error: 'Connection unavailable',
        isFromFallback: true,
        connectionHealthy: false
      };
    }

    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          queryFn(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeout)
          )
        ]);

        if (result.error) {
          lastError = result.error;
          
          // Handle specific database schema errors
          if (this.isSchemaError(result.error)) {
            if (logErrors) {
              console.warn(`[SafeService] Database schema error detected:`, result.error);
              console.warn('💡 Hint: Run the database initialization script: ./cli-init.sh');
            }
            
            return {
              data: fallbackData,
              error: `Database not initialized: ${result.error.message}`,
              isFromFallback: true,
              connectionHealthy: false
            };
          }
          
          if (logErrors) {
            console.warn(`[SafeService] Query error (attempt ${attempt + 1}):`, result.error);
          }
        } else {
          return {
            data: result.data,
            error: null,
            isFromFallback: false,
            connectionHealthy: true
          };
        }
      } catch (error) {
        lastError = error;
        if (logErrors) {
          console.warn(`[SafeService] Query failed (attempt ${attempt + 1}):`, error);
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // All attempts failed, return fallback
    if (logErrors) {
      console.error('[SafeService] All query attempts failed, using fallback:', lastError);
    }

    return {
      data: fallbackData,
      error: lastError?.message || 'Query failed',
      isFromFallback: true,
      connectionHealthy: false
    };
  }

  private isSchemaError(error: any): boolean {
    if (!error) return false;
    
    // Check for PostgreSQL schema errors
    const schemaErrorCodes = ['PGRST205', 'PGRST204', '42P01', '42703', '22P02'];
    const schemaErrorMessages = [
      'Could not find the table',
      'relation does not exist',
      'table does not exist',
      'schema cache',
      'column',
      'does not exist',
      'Could not find the function',
      'invalid input syntax for type uuid',
      'invalid uuid'
    ];
    
    const hasErrorCode = error.code && schemaErrorCodes.includes(error.code);
    const hasErrorMessage = error.message && schemaErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
    
    return hasErrorCode || hasErrorMessage;
  }

  // Use the shared UUID validation helper
  private validateOrganizationId(organizationId?: string): string | null {
    return validateOrganizationId(organizationId);
  }

  // Specific service methods with fallbacks
  async getCustomers(organizationId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        let query = supabase
          .from('organization_members')
          .select(`
            id,
            user_id,
            role,
            joined_at,
            is_active,
            profiles (
              display_name,
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          `)
          .eq('role', 'customer')
          .eq('is_active', true);

        const validOrgId = this.validateOrganizationId(organizationId);
        if (validOrgId) {
          query = query.eq('organization_id', validOrgId);
        }

        return query.order('joined_at', { ascending: false });
      },
      {
        fallbackData: [],
        logErrors: true
      }
    );
  }

  async getInstructors(organizationId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        let query = supabase
          .from('instructors')
          .select(`
            id,
            user_id,
            instructor_number,
            specialties,
            bio,
            hourly_rate_cents,
            is_active,
            profiles (
              display_name,
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          `)
          .eq('is_active', true);

        const validOrgId = this.validateOrganizationId(organizationId);
        if (validOrgId) {
          query = query.eq('organization_id', validOrgId);
        }

        return query.order('created_at', { ascending: false });
      },
      {
        fallbackData: [],
        logErrors: true
      }
    );
  }

  async getStaff(organizationId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        let query = supabase
          .from('organization_members')
          .select(`
            id,
            user_id,
            role,
            joined_at,
            is_active,
            profiles (
              display_name,
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          `)
          .neq('role', 'customer')
          .eq('is_active', true);

        const validOrgId = this.validateOrganizationId(organizationId);
        if (validOrgId) {
          query = query.eq('organization_id', validOrgId);
        }

        return query.order('joined_at', { ascending: false });
      },
      {
        fallbackData: [],
        logErrors: true
      }
    );
  }

  async getWallets(organizationId?: string, customerId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        let query = supabase
          .from('wallets')
          .select(`
            id,
            customer_id,
            product_id,
            credit_balance,
            expires_at,
            is_active,
            profiles (
              display_name,
              first_name,
              last_name,
              email
            ),
            products (
              name,
              type
            )
          `)
          .eq('is_active', true);

        const validOrgId = this.validateOrganizationId(organizationId);
        if (validOrgId) {
          query = query.eq('organization_id', validOrgId);
        }

        if (customerId) {
          query = query.eq('customer_id', customerId);
        }

        return query.order('created_at', { ascending: false });
      },
      {
        fallbackData: [],
        logErrors: true
      }
    );
  }

  async getCommunicationTemplates(organizationId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        // Since we don't have communication templates table yet, return empty
        return { data: [], error: null };
      },
      {
        fallbackData: [],
        logErrors: false // Don't log for missing features
      }
    );
  }

  async getCommunications(organizationId?: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        let query = supabase
          .from('campaigns')
          .select(`
            id,
            name,
            type,
            status,
            sent_count,
            delivered_count,
            opened_count,
            created_at,
            started_at
          `);

        const validOrgId = this.validateOrganizationId(organizationId);
        if (validOrgId) {
          query = query.eq('organization_id', validOrgId);
        }

        return query.order('created_at', { ascending: false });
      },
      {
        fallbackData: [],
        logErrors: true
      }
    );
  }

  async getTodayClasses(organizationId: string): Promise<SafeServiceResult<any[]>> {
    return this.safeQuery(
      async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        const validOrgId = this.validateOrganizationId(organizationId);
        if (!validOrgId) {
          console.warn(`[SafeService] Invalid organization ID for getTodayClasses: "${organizationId}". Using fallback data.`);
          return { data: this.getMockTodayClasses(), error: null };
        }

        // Try a simplified query first to avoid column errors
        try {
          return supabase
            .from('class_instances')
            .select(`
              id,
              name,
              start_time,
              end_time,
              capacity,
              price_cents,
              status
            `)
            .eq('organization_id', validOrgId)
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay)
            .eq('status', 'scheduled')
            .order('start_time', { ascending: true });
        } catch (error) {
          // If simple query fails, throw to trigger fallback
          throw error;
        }
      },
      {
        fallbackData: this.getMockTodayClasses(),
        logErrors: true
      }
    );
  }

  private getMockTodayClasses(): any[] {
    const today = new Date();
    const classes = [
      {
        id: 'mock-class-1',
        name: 'Morning Vinyasa Flow',
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 15).toISOString(),
        capacity: 20,
        price_cents: 3500,
        status: 'scheduled',
        locations: {
          name: 'Studio A Zürich'
        },
        class_templates: {
          name: 'Vinyasa Flow',
          type: 'Vinyasa',
          level: 'Intermediate',
          duration_minutes: 75
        },
        profiles: {
          display_name: 'Sarah Müller',
          first_name: 'Sarah',
          last_name: 'Müller',
          avatar_url: 'https://images.unsplash.com/photo-1667890786022-83bca6c4f4c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHdvbWFufGVufDF8fHx8MTc1NjkyMDYzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      },
      {
        id: 'mock-class-2',
        name: 'Gentle Hatha',
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30).toISOString(),
        capacity: 15,
        price_cents: 2800,
        status: 'scheduled',
        locations: {
          name: 'Studio B Geneva'
        },
        class_templates: {
          name: 'Hatha Yoga',
          type: 'Hatha',
          level: 'Beginner',
          duration_minutes: 60
        },
        profiles: {
          display_name: 'Marc Dubois',
          first_name: 'Marc',
          last_name: 'Dubois',
          avatar_url: 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmaXRuZXNzJTIwaW5zdHJ1Y3RvcnxlbnwxfHx8fDE3NTY5MjczMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      },
      {
        id: 'mock-class-3',
        name: 'Power Yoga',
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 30).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 45).toISOString(),
        capacity: 25,
        price_cents: 4200,
        status: 'scheduled',
        locations: {
          name: 'Main Studio Basel'
        },
        class_templates: {
          name: 'Power Yoga',
          type: 'Power',
          level: 'Advanced',
          duration_minutes: 75
        },
        profiles: {
          display_name: 'Elena Rossi',
          first_name: 'Elena',
          last_name: 'Rossi',
          avatar_url: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1Njg3MjczOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      },
      {
        id: 'mock-class-4',
        name: 'Yin & Meditation',
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 45).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 45).toISOString(),
        capacity: 18,
        price_cents: 3200,
        status: 'scheduled',
        locations: {
          name: 'Zen Space Lucerne'
        },
        class_templates: {
          name: 'Yin Yoga',
          type: 'Yin',
          level: 'All Levels',
          duration_minutes: 60
        },
        profiles: {
          display_name: 'Anna Schmidt',
          first_name: 'Anna',
          last_name: 'Schmidt',
          avatar_url: 'https://images.unsplash.com/photo-1659100939529-7008a25e447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBpbnN0cnVjdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU2ODM5MTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      }
    ];

    return classes;
  }

  async getOrganizationStats(organizationId: string): Promise<SafeServiceResult<any>> {
    return this.safeQuery(
      async () => {
        const validOrgId = this.validateOrganizationId(organizationId);
        if (!validOrgId) {
          console.warn(`[SafeService] Invalid organization ID for getOrganizationStats: "${organizationId}". Using fallback data.`);
          return { 
            data: {
              totalCustomers: 0,
              totalClasses: 0,
              totalRevenue: 0,
              totalLocations: 0
            }, 
            error: null 
          };
        }

        // Get multiple stats in parallel with individual error handling
        const results = await Promise.allSettled([
          supabase.from('organization_members').select('id', { count: 'exact' }).eq('organization_id', validOrgId).eq('role', 'customer'),
          supabase.from('class_instances').select('id', { count: 'exact' }).eq('organization_id', validOrgId),
          supabase.from('payments').select('amount_cents').eq('organization_id', validOrgId).eq('status', 'paid'),
          supabase.from('locations').select('id', { count: 'exact' }).eq('organization_id', validOrgId).eq('is_active', true)
        ]);

        const [customersResult, classesResult, paymentsResult, locationsResult] = results;

        const stats = {
          totalCustomers: customersResult.status === 'fulfilled' ? (customersResult.value.count || 0) : 0,
          totalClasses: classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0,
          totalRevenue: paymentsResult.status === 'fulfilled' ? 
            (paymentsResult.value.data || []).reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) : 0,
          totalLocations: locationsResult.status === 'fulfilled' ? (locationsResult.value.count || 0) : 0
        };

        return { data: stats, error: null };
      },
      {
        fallbackData: {
          totalCustomers: 0,
          totalClasses: 0,
          totalRevenue: 0,
          totalLocations: 0
        },
        logErrors: true
      }
    );
  }

  // Health check method for external use
  async healthCheck(): Promise<boolean> {
    return this.checkConnection();
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.connectionHealthy;
  }
}

// Export singleton instance
export const safeService = new SafeSupabaseService();

// Export individual service functions for backward compatibility
export const getCustomers = (organizationId?: string) => safeService.getCustomers(organizationId);
export const getInstructors = (organizationId?: string) => safeService.getInstructors(organizationId);
export const getStaff = (organizationId?: string) => safeService.getStaff(organizationId);
export const getWallets = (organizationId?: string, customerId?: string) => safeService.getWallets(organizationId, customerId);
export const getCommunicationTemplates = (organizationId?: string) => safeService.getCommunicationTemplates(organizationId);
export const getCommunications = (organizationId?: string) => safeService.getCommunications(organizationId);
export const getTodayClasses = (organizationId: string) => safeService.getTodayClasses(organizationId);
export const getOrganizationStats = (organizationId: string) => safeService.getOrganizationStats(organizationId);