/**
 * Production-Ready Request Manager
 * Handles caching, deduplication, batching, and error recovery
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  promise: Promise<any>;
  abortController: AbortController;
}

export class RequestManager {
  private static instance: RequestManager;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest>();
  private healthCache: { isHealthy: boolean; lastCheck: number } = { 
    isHealthy: true, 
    lastCheck: 0 
  };

  // Cache durations for different types of data
  private static readonly CACHE_DURATIONS = {
    auth: 30 * 1000,        // 30 seconds - auth data changes frequently  
    orgs: 5 * 60 * 1000,    // 5 minutes - org data is fairly stable
    profile: 10 * 60 * 1000, // 10 minutes - profile changes rarely
    health: 60 * 1000,      // 1 minute - health checks
    static: 60 * 60 * 1000  // 1 hour - static/config data
  };

  private static readonly HEALTH_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
  private static readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  private static readonly MAX_RETRIES = 2;

  public static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  /**
   * Main request method with caching, deduplication, and error handling
   */
  async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      cacheType?: keyof typeof RequestManager.CACHE_DURATIONS;
      skipCache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const {
      cacheType = 'static',
      skipCache = false,
      timeout = RequestManager.REQUEST_TIMEOUT,
      retries = RequestManager.MAX_RETRIES
    } = options;

    // Check cache first (unless explicitly skipped)
    if (!skipCache) {
      const cached = this.getCachedData<T>(key);
      if (cached) {
        console.log(`[RequestManager] Cache hit for: ${key}`);
        return cached;
      }
    }

    // Check if request is already pending (deduplication)
    const pendingKey = `pending_${key}`;
    if (this.pendingRequests.has(pendingKey)) {
      console.log(`[RequestManager] Deduplicating request: ${key}`);
      return this.pendingRequests.get(pendingKey)!.promise;
    }

    // Create new request with timeout and retry logic
    const abortController = new AbortController();
    const requestPromise = this.executeWithRetry(
      requestFn,
      retries,
      timeout,
      abortController.signal
    );

    // Store pending request
    this.pendingRequests.set(pendingKey, {
      promise: requestPromise,
      abortController
    });

    try {
      const result = await requestPromise;
      
      // Cache successful result
      if (!skipCache) {
        this.setCachedData(key, result, cacheType);
      }
      
      return result;
    } catch (error) {
      console.error(`[RequestManager] Request failed for ${key}:`, error);
      throw error;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(pendingKey);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number,
    timeout: number,
    signal: AbortSignal
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout to the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Request timeout after ${timeout}ms`));
          }, timeout);
          
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Request aborted'));
          });
        });

        return await Promise.race([requestFn(), timeoutPromise]);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff for retries
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        console.warn(`[RequestManager] Retry ${attempt + 1}/${retries} after ${backoffDelay}ms`);
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  /**
   * Batch multiple requests together
   */
  async batchRequests<T extends Record<string, any>>(
    requests: Record<keyof T, () => Promise<T[keyof T]>>,
    options: {
      cacheType?: keyof typeof RequestManager.CACHE_DURATIONS;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const results = await Promise.allSettled(
      Object.entries(requests).map(async ([key, requestFn]) => {
        try {
          const result = await this.request(
            `batch_${key}`,
            requestFn as () => Promise<any>,
            options
          );
          return { key, result, status: 'fulfilled' };
        } catch (error) {
          return { key, error, status: 'rejected' };
        }
      })
    );

    const finalResult = {} as T;
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { key, result: data } = result.value;
        (finalResult as any)[key] = data;
      } else {
        console.error(`[RequestManager] Batch request failed for ${result.value.key}:`, result.value.error);
      }
    });

    return finalResult;
  }

  /**
   * Health check with throttling
   */
  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached health status if checked recently
    if (now - this.healthCache.lastCheck < RequestManager.HEALTH_CHECK_INTERVAL) {
      return this.healthCache.isHealthy;
    }

    try {
      const healthy = await this.request(
        'health_check',
        async () => {
          const response = await fetch('/api/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 second timeout for health checks
          });
          return response.ok;
        },
        { cacheType: 'health', skipCache: true }
      );

      this.healthCache = { isHealthy: healthy, lastCheck: now };
      return healthy;
    } catch (error) {
      console.warn('[RequestManager] Health check failed:', error);
      this.healthCache = { isHealthy: false, lastCheck: now };
      return false;
    }
  }

  /**
   * Cache management
   */
  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCachedData<T>(
    key: string, 
    data: T, 
    cacheType: keyof typeof RequestManager.CACHE_DURATIONS
  ): void {
    const duration = RequestManager.CACHE_DURATIONS[cacheType];
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.healthCache = { isHealthy: true, lastCheck: 0 };
  }

  /**
   * Clear cache by pattern
   */
  clearCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Abort all pending requests
   */
  abortAllRequests(): void {
    this.pendingRequests.forEach(({ abortController }) => {
      abortController.abort();
    });
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    return {
      totalEntries: entries.length,
      expiredEntries: entries.filter(([_, entry]) => now > entry.expiresAt).length,
      pendingRequests: this.pendingRequests.size,
      memoryUsage: this.approximateMemoryUsage()
    };
  }

  private approximateMemoryUsage(): string {
    const size = JSON.stringify(Array.from(this.cache.entries())).length;
    return `${(size / 1024).toFixed(2)} KB`;
  }
}

// Export singleton instance
export const requestManager = RequestManager.getInstance();
