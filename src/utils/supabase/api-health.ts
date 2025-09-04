import { getSupabaseProjectId, getSupabaseAnonKey } from './env';

const API_BASE_URL = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4`;

export interface ApiHealthStatus {
  isHealthy: boolean;
  endpoint: string;
  error?: string;
  responseTime: number;
}

export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const startTime = Date.now();
  
  try {
    console.log('Checking API health at:', `${API_BASE_URL}/health`);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log('API health check successful:', data);
      return {
        isHealthy: true,
        endpoint: `${API_BASE_URL}/health`,
        responseTime
      };
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('API health check failed:', response.status, errorText);
      return {
        isHealthy: false,
        endpoint: `${API_BASE_URL}/health`,
        error: `HTTP ${response.status}: ${errorText}`,
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('API health check error:', error);
    
    return {
      isHealthy: false,
      endpoint: `${API_BASE_URL}/health`,
      error: error instanceof Error ? error.message : 'Network error',
      responseTime
    };
  }
}

export async function logApiEnvironment(): Promise<void> {
  console.group('🔧 API Configuration');
  console.log('Project ID:', getSupabaseProjectId());
  console.log('API Base URL:', API_BASE_URL);
  const anon = getSupabaseAnonKey();
  console.log('Has Anon Key:', !!anon);
  console.log('Anon Key Preview:', anon ? anon.substring(0, 20) + '...' : 'Not available');
  
  // Test health endpoint
  const healthStatus = await checkApiHealth();
  console.log('Health Status:', healthStatus);
  
  console.groupEnd();
}

// Always log environment in production (was previously development-only)
setTimeout(() => {
  logApiEnvironment().catch(error => {
    console.warn('Failed to log API environment:', error);
  });
}, 100);
