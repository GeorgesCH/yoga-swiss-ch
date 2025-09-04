// Clean People Service for YogaSwiss - No environment checks
// This version avoids any complex conditional expressions

import { getSupabaseProjectId, getSupabaseAnonKey } from './env';
import { checkApiHealth } from './api-health-safe';
import { safeService } from './safe-service';

const API_BASE_URL = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4`;

// Helper to get auth headers
const getAuthHeaders = (accessToken?: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken || getSupabaseAnonKey()}`,
  'X-Org-ID': 'org-demo-1'
});

// Test API connection
const testApiConnection = async (): Promise<boolean> => {
  const healthStatus = await checkApiHealth();
  return healthStatus.isHealthy;
};

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  language: string;
  status: 'Active' | 'Inactive' | 'Trial' | 'Suspended';
  joinedDate: string;
  walletBalance: number;
  activePasses: number;
  lastActivity?: string;
  marketingConsent: boolean;
}

export interface CustomerDetails extends Customer {
  dateOfBirth?: string;
  emergencyContact?: any;
  medicalInfo?: any;
  dietaryPreferences?: string[];
  privacySettings?: any;
  wallet?: any;
  passes?: any[];
  recentRegistrations?: any[];
}

export interface Instructor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  language: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  totalClasses: number;
  lastActivity?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  language: string;
  role: 'manager' | 'front_desk' | 'accountant' | 'marketer';
  permissions: string[];
  status: 'Active' | 'Inactive';
  joinedDate: string;
  lastActivity?: string;
}

export interface Wallet {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  balance: number;
  currency: string;
  lastTransaction?: string;
  isActive: boolean;
}

export class PeopleService {
  private accessToken?: string;
  private apiHealthy: boolean | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }

  private async ensureApiConnection(): Promise<void> {
    if (this.apiHealthy === null) {
      console.log('Testing API connection...');
      this.apiHealthy = await testApiConnection();
      if (!this.apiHealthy) {
        console.warn('API connection test failed - API might not be available');
      } else {
        console.log('API connection successful');
      }
    }
  }

  async getCustomers(): Promise<{ customers: Customer[]; error?: string }> {
    try {
      // Try safe service first
      const result = await safeService.getCustomers();
      
      if (result.data && result.data.length > 0) {
        // Convert Supabase data to our Customer format
        const customers: Customer[] = result.data.map((member: any) => {
          const profile = member.profiles;
          return {
            id: member.user_id,
            email: profile?.email || 'unknown@email.ch',
            firstName: profile?.first_name || 'Unknown',
            lastName: profile?.last_name || 'User',
            phone: profile?.phone,
            avatar: profile?.avatar_url,
            language: 'de-CH',
            status: member.is_active ? 'Active' : 'Inactive',
            joinedDate: member.joined_at,
            walletBalance: 0,
            activePasses: 0,
            lastActivity: member.joined_at,
            marketingConsent: true
          };
        });
        
        return { customers };
      }
      
      // If no real data or connection failed, try API fallback
      await this.ensureApiConnection();
      
      if (!this.apiHealthy) {
        console.log('Using mock customer data due to connection issues');
        return { customers: this.getMockCustomers() };
      }
      
      // Try API call
      const response = await fetch(`${API_BASE_URL}/people/customers`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken),
      });

      if (!response.ok) {
        console.log('API call failed, using mock data');
        return { customers: this.getMockCustomers() };
      }

      const data = await response.json();
      return { customers: data.customers || this.getMockCustomers() };
      
    } catch (error) {
      console.error('Error in getCustomers:', error);
      return { customers: this.getMockCustomers() };
    }
  }

  private getMockCustomers(): Customer[] {
    return [
      {
        id: 'customer-1',
        email: 'emma.weber@email.ch',
        firstName: 'Emma',
        lastName: 'Weber',
        phone: '+41 79 123 4567',
        language: 'de-CH',
        status: 'Active',
        joinedDate: '2023-11-15T00:00:00Z',
        walletBalance: 25.50,
        activePasses: 3,
        lastActivity: '2024-01-15T18:30:00Z',
        marketingConsent: true
      },
      {
        id: 'customer-2',
        email: 'marc.dubois@email.ch',
        firstName: 'Marc',
        lastName: 'Dubois',
        phone: '+41 76 234 5678',
        language: 'fr-CH',
        status: 'Active',
        joinedDate: '2023-08-20T00:00:00Z',
        walletBalance: 0.00,
        activePasses: 0,
        lastActivity: '2024-01-10T19:00:00Z',
        marketingConsent: false
      },
      {
        id: 'customer-3',
        email: 'sofia.rossi@email.ch',
        firstName: 'Sofia',
        lastName: 'Rossi',
        phone: '+41 78 345 6789',
        language: 'it-CH',
        status: 'Inactive',
        joinedDate: '2023-09-10T00:00:00Z',
        walletBalance: 15.00,
        activePasses: 1,
        lastActivity: '2023-12-01T10:00:00Z',
        marketingConsent: true
      }
    ];
  }

  async getInstructors(): Promise<{ instructors: Instructor[]; error?: string }> {
    try {
      // Try safe service first
      const result = await safeService.getInstructors();
      
      if (result.data && result.data.length > 0) {
        // Convert Supabase data to our Instructor format
        const instructors: Instructor[] = result.data.map((instructor: any) => {
          const profile = instructor.profiles;
          return {
            id: instructor.id,
            email: profile?.email || 'unknown@yogaswiss.ch',
            firstName: profile?.first_name || 'Unknown',
            lastName: profile?.last_name || 'Instructor',
            phone: profile?.phone,
            avatar: profile?.avatar_url,
            language: 'de-CH',
            status: instructor.is_active ? 'Active' : 'Inactive',
            joinedDate: instructor.created_at || new Date().toISOString(),
            totalClasses: 0, // Would need to count from class_instances
            lastActivity: instructor.created_at || new Date().toISOString()
          };
        });
        
        return { instructors };
      }
      
      // Fallback to API or mock data
      console.log('Using mock instructor data');
      return { instructors: this.getMockInstructors() };
      
    } catch (error) {
      console.error('Error in getInstructors:', error);
      return { instructors: this.getMockInstructors() };
    }
  }

  private getMockInstructors(): Instructor[] {
    return [
      {
        id: 'instructor-1',
        email: 'sarah.chen@yogaswiss.ch',
        firstName: 'Sarah',
        lastName: 'Chen',
        phone: '+41 79 123 4567',
        language: 'en-CH',
        status: 'Active',
        joinedDate: '2019-08-15T00:00:00Z',
        totalClasses: 324,
        lastActivity: '2024-01-15T18:30:00Z'
      },
      {
        id: 'instructor-2',
        email: 'marco.bernasconi@yogaswiss.ch',
        firstName: 'Marco',
        lastName: 'Bernasconi',
        phone: '+41 76 234 5678',
        language: 'de-CH',
        status: 'Active',
        joinedDate: '2017-03-20T00:00:00Z',
        totalClasses: 567,
        lastActivity: '2024-01-14T19:00:00Z'
      }
    ];
  }

  async getStaff(): Promise<{ staff: StaffMember[]; error?: string }> {
    try {
      // Try safe service first
      const result = await safeService.getStaff();
      
      if (result.data && result.data.length > 0) {
        // Convert Supabase data to our StaffMember format
        const staff: StaffMember[] = result.data.map((member: any) => {
          const profile = member.profiles;
          return {
            id: member.user_id,
            email: profile?.email || 'unknown@yogaswiss.ch',
            firstName: profile?.first_name || 'Unknown',
            lastName: profile?.last_name || 'Staff',
            phone: profile?.phone,
            avatar: profile?.avatar_url,
            language: 'de-CH',
            role: member.role === 'studio_manager' ? 'manager' : 
                  member.role === 'front_desk' ? 'front_desk' :
                  member.role === 'accountant' ? 'accountant' :
                  member.role === 'marketer' ? 'marketer' : 'front_desk',
            permissions: ['basic_access'],
            status: member.is_active ? 'Active' : 'Inactive',
            joinedDate: member.joined_at,
            lastActivity: member.joined_at
          };
        });
        
        return { staff };
      }
      
      // Fallback to mock data
      console.log('Using mock staff data');
      return { staff: this.getMockStaff() };
      
    } catch (error) {
      console.error('Error in getStaff:', error);
      return { staff: this.getMockStaff() };
    }
  }

  private getMockStaff(): StaffMember[] {
    return [
      {
        id: 'staff-1',
        email: 'anna.mueller@yogaswiss.ch',
        firstName: 'Anna',
        lastName: 'Müller',
        phone: '+41 79 567 8901',
        language: 'de-CH',
        role: 'manager',
        permissions: ['manage_staff', 'view_reports', 'schedule_classes'],
        status: 'Active',
        joinedDate: '2022-01-15T00:00:00Z',
        lastActivity: '2024-01-15T09:00:00Z'
      },
      {
        id: 'staff-2',
        email: 'lucas.martin@yogaswiss.ch',
        firstName: 'Lucas',
        lastName: 'Martin',
        phone: '+41 76 678 9012',
        language: 'fr-CH',
        role: 'front_desk',
        permissions: ['manage_customers', 'process_payments'],
        status: 'Active',
        joinedDate: '2023-06-01T00:00:00Z',
        lastActivity: '2024-01-14T17:30:00Z'
      }
    ];
  }

  async getWallets(): Promise<{ wallets: Wallet[]; error?: string }> {
    try {
      // Try safe service first
      const result = await safeService.getWallets();
      
      if (result.data && result.data.length > 0) {
        // Convert Supabase data to our Wallet format
        const wallets: Wallet[] = result.data.map((wallet: any) => {
          const profile = wallet.profiles;
          const product = wallet.products;
          return {
            id: wallet.id,
            customerId: wallet.customer_id,
            customerName: profile?.display_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown Customer',
            customerEmail: profile?.email || 'unknown@email.ch',
            balance: (wallet.credit_balance || 0) / 100, // Convert from cents
            currency: 'CHF',
            lastTransaction: wallet.last_used_at,
            isActive: wallet.is_active
          };
        });
        
        return { wallets };
      }
      
      // Fallback to mock data
      console.log('Using mock wallet data');
      return { wallets: this.getMockWallets() };
      
    } catch (error) {
      console.error('Error in getWallets:', error);
      return { wallets: this.getMockWallets() };
    }
  }

  private getMockWallets(): Wallet[] {
    return [
      {
        id: 'wallet-1',
        customerId: 'customer-1',
        customerName: 'Emma Weber',
        customerEmail: 'emma.weber@email.ch',
        balance: 25.50,
        currency: 'CHF',
        lastTransaction: '2024-01-10T10:00:00Z',
        isActive: true
      },
      {
        id: 'wallet-2',
        customerId: 'customer-2',
        customerName: 'Marc Dubois',
        customerEmail: 'marc.dubois@email.ch',
        balance: 0.00,
        currency: 'CHF',
        lastTransaction: '2023-12-15T14:30:00Z',
        isActive: true
      }
    ];
  }

  async getCommunications(): Promise<{ communications: any[]; error?: string }> {
    try {
      // Use safe service to get communications
      const result = await safeService.getCommunications();
      
      if (result.data && result.data.length > 0) {
        return { communications: result.data };
      }
      
      // Return mock communications for demo
      return { communications: this.getMockCommunications() };
      
    } catch (error) {
      console.error('Error in getCommunications:', error);
      return { communications: this.getMockCommunications() };
    }
  }

  async getCommunicationTemplates(): Promise<{ templates: any[]; error?: string }> {
    try {
      // Use safe service to get templates
      const result = await safeService.getCommunicationTemplates();
      
      if (result.data && result.data.length > 0) {
        return { templates: result.data };
      }
      
      // Return mock templates for demo
      return { templates: this.getMockCommunicationTemplates() };
      
    } catch (error) {
      console.error('Error in getCommunicationTemplates:', error);
      return { templates: this.getMockCommunicationTemplates() };
    }
  }

  private getMockCommunications(): any[] {
    return [
      {
        id: 'comm-1',
        name: 'Welcome Email Campaign',
        type: 'email',
        status: 'completed',
        sent_count: 124,
        delivered_count: 118,
        opened_count: 67,
        clicked_count: 23,
        created_at: '2024-01-15T10:00:00Z',
        started_at: '2024-01-15T11:00:00Z',
        completed_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 'comm-2',
        name: 'Class Reminder SMS',
        type: 'sms',
        status: 'active',
        sent_count: 45,
        delivered_count: 43,
        opened_count: 43,
        clicked_count: 12,
        created_at: '2024-01-16T06:00:00Z',
        started_at: '2024-01-16T06:30:00Z'
      }
    ];
  }

  private getMockCommunicationTemplates(): any[] {
    return [
      {
        id: 'template-1',
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to YogaSwiss',
        content: 'Welcome to our yoga community!',
        variables: ['customerName'],
        isActive: true,
        category: 'onboarding',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template-2',
        name: 'Class Reminder',
        type: 'sms',
        subject: 'Class starting soon',
        content: 'Your class starts in 2 hours!',
        variables: ['customerName', 'className'],
        isActive: true,
        category: 'reminder',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // Additional methods would go here...
}

// Export singleton instance
export const peopleService = new PeopleService();
