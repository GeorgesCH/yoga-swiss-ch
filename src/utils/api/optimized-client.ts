/**
 * Optimized API Client for Production
 * Uses RequestManager for caching, deduplication, and error handling
 */

import { requestManager } from './request-manager';
import { getSupabaseProjectId } from '../supabase/env';
import { supabase } from '../supabase/client';

export interface ApiClientOptions {
  timeout?: number;
  retries?: number;
  skipCache?: boolean;
  cacheType?: 'auth' | 'orgs' | 'profile' | 'health' | 'static';
}

class OptimizedApiClient {
  private static instance: OptimizedApiClient;
  private baseUrl: string;
  private sessionCache: { session: any; expiresAt: number } | null = null;

  constructor() {
    this.baseUrl = `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4`;
  }

  public static getInstance(): OptimizedApiClient {
    if (!OptimizedApiClient.instance) {
      OptimizedApiClient.instance = new OptimizedApiClient();
    }
    return OptimizedApiClient.instance;
  }

  /**
   * Get authenticated session with caching
   */
  private async getSession(): Promise<{ session: any; error?: any }> {
    // Check cached session first
    if (this.sessionCache && Date.now() < this.sessionCache.expiresAt) {
      return { session: this.sessionCache.session };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        this.sessionCache = null;
        return { session: null, error };
      }

      // Cache session for 5 minutes
      if (data.session) {
        this.sessionCache = {
          session: data.session,
          expiresAt: Date.now() + (5 * 60 * 1000)
        };
      }

      return { session: data.session };
    } catch (error) {
      this.sessionCache = null;
      return { session: null, error };
    }
  }

  /**
   * Main API call method with full optimization
   */
  async call<T>(
    endpoint: string,
    options: RequestInit & ApiClientOptions = {}
  ): Promise<T> {
    const {
      timeout,
      retries,
      skipCache = false,
      cacheType = 'static',
      ...requestOptions
    } = options;

    // Create cache key based on endpoint and method
    const method = requestOptions.method || 'GET';
    const body = requestOptions.body ? JSON.stringify(requestOptions.body) : '';
    const cacheKey = `api_${method}_${endpoint}_${btoa(body).slice(0, 16)}`;

    return requestManager.request(
      cacheKey,
      async () => {
        const { session, error: sessionError } = await this.getSession();
        
        if (sessionError?.message?.includes('invalid claim')) {
          console.log('[OptimizedApiClient] Invalid session detected, clearing auth');
          await supabase.auth.signOut();
          this.sessionCache = null;
          throw new Error('Session invalid');
        }

        if (!session?.access_token) {
          throw new Error('Authentication required');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          ...requestOptions.headers
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...requestOptions,
          headers
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        return response.json();
      },
      { cacheType, skipCache, timeout, retries }
    );
  }

  /**
   * Organizations API with aggressive caching
   */
  async getOrganizations(): Promise<any> {
    return this.call('/orgs', {
      cacheType: 'orgs',
      timeout: 10000
    });
  }

  /**
   * User profile with caching
   */
  async getProfile(): Promise<any> {
    return this.call('/profile', {
      cacheType: 'profile',
      timeout: 8000
    });
  }

  /**
   * Health check (minimal, cached)
   */
  async healthCheck(): Promise<any> {
    return requestManager.checkHealth();
  }

  /**
   * Batch load initial app data
   */
  async loadInitialData(): Promise<{
    orgs?: any;
    profile?: any;
    health?: boolean;
  }> {
    return requestManager.batchRequests({
      orgs: () => this.getOrganizations(),
      profile: () => this.getProfile(),
      health: () => this.healthCheck()
    }, {
      cacheType: 'auth',
      timeout: 15000
    });
  }

  /**
   * Clear all cached data (on logout, etc.)
   */
  clearCache(): void {
    this.sessionCache = null;
    requestManager.clearCache();
  }

  /**
   * Clear organization-specific cache
   */
  clearOrgCache(): void {
    requestManager.clearCacheByPattern('api.*orgs.*');
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      cacheStats: requestManager.getCacheStats(),
      sessionCached: !!this.sessionCache,
      sessionExpiresIn: this.sessionCache 
        ? Math.max(0, this.sessionCache.expiresAt - Date.now())
        : 0
    };
  }
}

// Export singleton
export const apiClient = OptimizedApiClient.getInstance();
