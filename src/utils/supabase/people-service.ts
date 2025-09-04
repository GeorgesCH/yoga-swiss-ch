import { getSupabaseProjectId, getSupabaseAnonKey } from './env';
import { checkApiHealth } from './api-health';

const API_BASE_URL = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4`;

// Helper to get auth headers
// Temporarily disable X-Org-ID header to avoid CORS issues until backend is deployed
const getAuthHeaders = (accessToken?: string, orgId?: string) => {
  const token = accessToken || getSupabaseAnonKey();
  
  console.log('🔑 getAuthHeaders called:', {
    hasAccessToken: !!accessToken,
    tokenType: accessToken ? 'user_token' : 'anon_key',
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    // Temporarily commented out to avoid CORS issues until backend deployment
    // ...(orgId && { 'X-Org-ID': orgId })
  };
};

// Test if API is reachable
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
  private orgId?: string;
  private apiHealthy: boolean | null = null;

  constructor(accessToken?: string, orgId?: string) {
    this.accessToken = accessToken;
    this.orgId = orgId; // Explicit org only
  }

  private async ensureApiConnection(): Promise<void> {
    if (this.apiHealthy === null) {
      console.log('Testing API connection...');
      try {
        this.apiHealthy = await testApiConnection();
        if (!this.apiHealthy) {
          console.warn('API connection test failed - API might not be available');
        } else {
          console.log('API connection successful');
        }
      } catch (error) {
        console.warn('API connection test error:', error);
        this.apiHealthy = false;
      }
    }
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  async getCustomers(): Promise<{ customers: Customer[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty (no mock in production)
      if (!this.apiHealthy) {
        return { customers: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching customers from API...');
      console.log('API URL:', `${API_BASE_URL}/people/customers`);
      console.log('Access token available:', !!this.accessToken);
      console.log('Access token preview:', this.accessToken ? `${this.accessToken.substring(0, 20)}...` : 'none');
      
      const response = await fetch(`${API_BASE_URL}/people/customers`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching customers:', response.status, errorText);
        
        // Check for specific 401 error and provide better debugging
        if (response.status === 401) {
          console.error('🔐 Authentication failed. Possible causes:');
          console.error('1. Access token is invalid or expired');
          console.error('2. Database tables (user_profiles, org_users) do not exist');
          console.error('3. Edge Function authentication logic is too strict');
          console.error('4. User needs to be added to an organization');
        }
        
        return { customers: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched customers:', data.customers?.length || 0);
      
      return { customers: data.customers || [] };
    } catch (error) {
      console.error('Error in getCustomers:', error);
      
      return { customers: [], error: 'Network connection failed' };
    }
  }

  // mock customers removed for production

  // Mock data methods removed for production mode

  async getCustomer(id: string): Promise<{ customer?: CustomerDetails; error?: string }> {
    try {
      console.log('Fetching customer details for:', id);
      
      const response = await fetch(`${API_BASE_URL}/people/customers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching customer:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Successfully fetched customer details for:', id);
      
      return { customer: data.customer };
    } catch (error) {
      console.error('Error in getCustomer:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createCustomer(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    language?: string;
    marketingConsent?: boolean;
  }): Promise<{ customer?: any; error?: string }> {
    try {
      console.log('Creating new customer:', customerData.email);
      
      // Check if API is available
      if (!this.apiHealthy) {
        return { error: 'API service unavailable' };
      }
      
      const response = await fetch(`${API_BASE_URL}/people/customers`, {
        method: 'POST',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating customer:', response.status, errorData);
        
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Successfully created customer:', customerData.email);
      
      return { customer: data.customer };
    } catch (error) {
      console.error('Error in createCustomer:', error);
      
      return { error: 'Network connection failed' };
    }
  }

  async updateCustomer(id: string, updates: Partial<CustomerDetails>): Promise<{ error?: string }> {
    try {
      console.log('Updating customer:', id);
      
      const response = await fetch(`${API_BASE_URL}/people/customers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error updating customer:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      console.log('Successfully updated customer:', id);
      return {};
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // INSTRUCTORS
  // ============================================================================

  async getInstructors(): Promise<{ instructors: Instructor[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty data in production
      if (!this.apiHealthy) {
        return { instructors: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching instructors from API...');
      console.log('Access token available:', !!this.accessToken);
      
      const response = await fetch(`${API_BASE_URL}/people/instructors`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching instructors:', response.status, errorText);
        
        // Check for specific 401 error and provide better debugging
        if (response.status === 401) {
          console.error('🔐 Authentication failed for instructors endpoint. Same issue as customers.');
        }
        
        return { instructors: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched instructors:', data.instructors?.length || 0);
      
      return { instructors: data.instructors || [] };
    } catch (error) {
      console.error('Error in getInstructors:', error);
      
      return { instructors: [], error: 'Network connection failed' };
    }
  }
  // mock instructors removed for production



  // ============================================================================
  // STAFF
  // ============================================================================

  async getStaff(): Promise<{ staff: StaffMember[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty
      if (!this.apiHealthy) {
        return { staff: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching staff from API...');
      
      const response = await fetch(`${API_BASE_URL}/people/staff`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching staff:', response.status, errorText);
        
        return { staff: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched staff:', data.staff?.length || 0);
      
      return { staff: data.staff || [] };
    } catch (error) {
      console.error('Error in getStaff:', error);
      
      return { staff: [], error: 'Network connection failed' };
    }
  }
  // mock staff removed for production



  // ============================================================================
  // WALLETS
  // ============================================================================

  async getWallets(): Promise<{ wallets: Wallet[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty data for production
      if (!this.apiHealthy) {
        console.log('API not available, returning empty wallets data');
        return { wallets: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching wallets from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/people/wallets`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching wallets:', response.status, errorText);
        
        // Return empty data instead of mock data for production
        console.log('API error, returning empty wallets data');
        return { wallets: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched wallets:', data.wallets?.length || 0);
      
      return { wallets: data.wallets || [] };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Wallets API request timed out, returning empty data');
      } else {
        console.error('Error in getWallets:', error);
      }
      
      // Return empty data instead of mock data for production
      console.log('Network error, returning empty wallets data');
      return { wallets: [], error: 'Network connection failed' };
    }
  }



  async updateWalletBalance(walletId: string, amount: number, reason?: string): Promise<{ error?: string }> {
    try {
      console.log('Updating wallet balance:', walletId, amount);
      
      const response = await fetch(`${API_BASE_URL}/people/wallets/${walletId}`, {
        method: 'PUT',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error updating wallet:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      console.log('Successfully updated wallet balance:', walletId);
      return {};
    } catch (error) {
      console.error('Error in updateWalletBalance:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // COMMUNICATIONS
  // ============================================================================

  async getCommunications(): Promise<{ communications: any[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty data for production
      if (!this.apiHealthy) {
        console.log('API not available, returning empty communications data');
        return { communications: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching communications from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/people/communications`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching communications:', response.status, errorText);
        
        // Return empty data instead of mock data for production
        console.log('API error, returning empty communications data');
        return { communications: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched communications:', data.communications?.length || 0);
      
      return { communications: data.communications || [] };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Communications API request timed out, returning empty data');
      } else {
        console.error('Error in getCommunications:', error);
      }
      
      // Return empty data instead of mock data for production
      console.log('Network error, returning empty communications data');
      return { communications: [], error: 'Network connection failed' };
    }
  }



  async createCommunication(communicationData: {
    type: string;
    subject: string;
    content: string;
    recipients?: string[];
    channel: string;
    template_id?: string;
    campaign_type: string;
  }): Promise<{ communication?: any; error?: string }> {
    try {
      console.log('Creating new communication:', communicationData.subject);
      
      const response = await fetch(`${API_BASE_URL}/people/communications`, {
        method: 'POST',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        body: JSON.stringify(communicationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating communication:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Successfully created communication:', communicationData.subject);
      
      return { communication: data.communication };
    } catch (error) {
      console.error('Error in createCommunication:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendCommunication(communicationId: string): Promise<{ error?: string }> {
    try {
      console.log('Sending communication:', communicationId);
      
      const response = await fetch(`${API_BASE_URL}/people/communications/${communicationId}/send`, {
        method: 'POST',
        headers: getAuthHeaders(this.accessToken, this.orgId),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error sending communication:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      console.log('Successfully sent communication:', communicationId);
      return {};
    } catch (error) {
      console.error('Error in sendCommunication:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCommunicationTemplates(): Promise<{ templates: any[]; error?: string }> {
    try {
      await this.ensureApiConnection();
      
      // If API is not healthy, return empty data for production
      if (!this.apiHealthy) {
        console.log('API not available, returning empty templates data');
        return { templates: [], error: 'API service unavailable' };
      }
      
      console.log('Fetching communication templates from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/people/communication-templates`, {
        method: 'GET',
        headers: getAuthHeaders(this.accessToken, this.orgId),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error fetching templates:', response.status, errorText);
        
        // Return empty data instead of mock data for production
        console.log('API error, returning empty templates data');
        return { templates: [], error: `API Error: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      console.log('Successfully fetched templates:', data.templates?.length || 0);
      
      return { templates: data.templates || [] };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Templates API request timed out, returning empty data');
      } else {
        console.error('Error in getCommunicationTemplates:', error);
      }
      
      // Return empty data instead of mock data for production
      console.log('Network error, returning empty templates data');
      return { templates: [], error: 'Network connection failed' };
    }
  }



  async createInstructor(instructorData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    language?: string;
    specialties?: string[];
  }): Promise<{ instructor?: any; error?: string }> {
    try {
      console.log('Creating new instructor:', instructorData.email);
      
      const response = await fetch(`${API_BASE_URL}/people/instructors`, {
        method: 'POST',
        headers: getAuthHeaders(this.accessToken),
        body: JSON.stringify(instructorData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating instructor:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Successfully created instructor:', instructorData.email);
      
      return { instructor: data.instructor };
    } catch (error) {
      console.error('Error in createInstructor:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createStaffMember(staffData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    language?: string;
    role: string;
    permissions?: string[];
  }): Promise<{ staff?: any; error?: string }> {
    try {
      console.log('Creating new staff member:', staffData.email);
      
      const response = await fetch(`${API_BASE_URL}/people/staff`, {
        method: 'POST',
        headers: getAuthHeaders(this.accessToken),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating staff member:', response.status, errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Successfully created staff member:', staffData.email);
      
      return { staff: data.staff };
    } catch (error) {
      console.error('Error in createStaffMember:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const peopleService = new PeopleService();
