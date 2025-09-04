/**
 * Optimized API Hook for Production
 * Replaces redundant useEffect patterns with efficient data fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../utils/api/optimized-client';

export interface UseApiOptions {
  skip?: boolean;
  refreshInterval?: number;
  cacheType?: 'auth' | 'orgs' | 'profile' | 'health' | 'static';
  dependencies?: any[];
}

export function useOptimizedApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    skip = false,
    refreshInterval,
    cacheType = 'static',
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (skip) return;

    // Prevent concurrent requests
    if (abortControllerRef.current && !force) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      const result = await fetchFn();
      
      setData(result);
      setLastFetch(Date.now());
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.warn('[useOptimizedApi] Fetch failed:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [fetchFn, skip]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && !skip) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, skip, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastFetch
  };
}

/**
 * Hook for organizations with optimized caching
 */
export function useOrganizations() {
  return useOptimizedApi(
    () => apiClient.getOrganizations(),
    { cacheType: 'orgs' }
  );
}

/**
 * Hook for user profile with caching
 */
export function useProfile() {
  return useOptimizedApi(
    () => apiClient.getProfile(),
    { cacheType: 'profile' }
  );
}

/**
 * Hook for initial app data with batching
 */
export function useInitialData() {
  return useOptimizedApi(
    () => apiClient.loadInitialData(),
    { cacheType: 'auth' }
  );
}

/**
 * Throttled health check hook
 */
export function useHealthCheck(intervalMs = 120000) { // 2 minutes default
  return useOptimizedApi(
    () => apiClient.healthCheck(),
    { 
      cacheType: 'health',
      refreshInterval: intervalMs
    }
  );
}

/**
 * Hook to get API debug information
 */
export function useApiDebug() {
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(apiClient.getDebugInfo());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return debugInfo;
}
