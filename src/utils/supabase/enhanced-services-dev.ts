import { ServiceResponse } from './enhanced-services';

// =====================================================
// Development-friendly Enhanced Services
// Returns fallback data instead of making failing API calls
// =====================================================

export class DevEnhancedPeopleService {
  async getCustomers(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ServiceResponse<any>> {
    // Return demo data for development
    return {
      data: [
        {
          id: 'customer-1',
          email: 'maria@example.com',
          display_name: 'Maria Müller',
          phone: '+41 79 123 45 67',
          is_active: true,
          role: 'customer',
          registrations: { count: 12 },
          wallets: { credit_balance: 125.50 },
          orders: { total_cents: 89500, status: 'completed' },
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'customer-2',
          email: 'hans@example.com',
          display_name: 'Hans Weber',
          phone: '+41 79 234 56 78',
          is_active: true,
          role: 'customer',
          registrations: { count: 8 },
          wallets: { credit_balance: 75.00 },
          orders: { total_cents: 45000, status: 'completed' },
          created_at: '2024-02-01T09:30:00Z'
        }
      ],
      error: null,
      success: true,
      metadata: {
        total: 2,
        page: options.page || 1,
        limit: options.limit || 50,
        cached: false,
        timestamp: new Date().toISOString()
      }
    };
  }

  async getCustomerWallets(
    customerId: string,
    organizationId: string
  ): Promise<ServiceResponse<any[]>> {
    return {
      data: [
        {
          id: 'wallet-1',
          customer_id: customerId,
          organization_id: organizationId,
          balance_cents: 12550,
          currency: 'CHF',
          is_active: true,
          product: { name: '10er Karte Yoga', type: 'pass' },
          transactions: [
            {
              type: 'credit',
              amount: 125.50,
              created_at: '2024-09-01T10:00:00Z',
              description: 'Initial purchase'
            }
          ]
        }
      ],
      error: null,
      success: true,
      metadata: { timestamp: new Date().toISOString() }
    };
  }
}

export class DevEnhancedClassesService {
  async getClassAnalytics(
    organizationId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResponse<any>> {
    return {
      data: {
        attendance_rate: 92,
        total_classes: 45,
        total_bookings: 234,
        average_class_size: 8,
        popular_times: ['6:00 AM', '7:00 PM'],
        instructor_performance: [
          { instructor: 'Lisa Meier', classes: 12, rating: 4.8 },
          { instructor: 'Marco Rossi', classes: 8, rating: 4.6 }
        ]
      },
      error: null,
      success: true,
      metadata: { 
        cached: false,
        fallback: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  async getClassOccurrences(
    organizationId: string,
    options: any = {}
  ): Promise<ServiceResponse<any[]>> {
    return {
      data: [
        {
          id: 'class-1',
          start_time: '2024-09-04T08:00:00Z',
          end_time: '2024-09-04T09:00:00Z',
          status: 'scheduled',
          capacity: 12,
          price_cents: 3500,
          template: {
            id: 'template-1',
            name: 'Vinyasa Flow',
            description: 'Dynamic yoga practice',
            type: 'yoga',
            level: 'intermediate'
          },
          instructor: {
            id: 'instructor-1',
            display_name: 'Lisa Meier'
          },
          location: {
            id: 'location-1',
            name: 'Studio Zürich',
            address: 'Bahnhofstrasse 1, 8001 Zürich'
          },
          registrations: []
        }
      ],
      error: null,
      success: true,
      metadata: { timestamp: new Date().toISOString() }
    };
  }
}

export class DevEnhancedFinanceService {
  async getFinancialSummary(
    organizationId: string,
    startDate: string,
    endDate: string,
    useCache: boolean = true
  ): Promise<ServiceResponse<any>> {
    return {
      data: {
        total_revenue_cents: 0,
        total_expenses_cents: 0,
        net_profit_cents: 0,
        payment_success_rate: 0,
        period: { start: startDate, end: endDate }
      },
      error: null,
      success: true,
      metadata: { 
        cached: false,
        fallback: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Production mode only - disable all development bypasses
export function isDevelopmentMode(): boolean {
  return false;
}

// Export development services
export const devEnhancedPeopleService = new DevEnhancedPeopleService();
export const devEnhancedClassesService = new DevEnhancedClassesService();
export const devEnhancedFinanceService = new DevEnhancedFinanceService();