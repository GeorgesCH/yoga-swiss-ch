import { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '../../components/auth/MultiTenantAuthProvider';
import { sisRunner, type SISRunResult, type SISHealthSummary } from './sis-runner';

// Hook for SIS health monitoring
export function useSISHealth(autoRefresh: boolean = true) {
  const { currentOrg } = useMultiTenantAuth();
  const [health, setHealth] = useState<SISHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    if (!currentOrg?.id) return;

    try {
      setError(null);
      const healthData = await sisRunner.getHealthSummary(currentOrg.id);
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();

    if (autoRefresh) {
      const interval = setInterval(loadHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentOrg?.id, autoRefresh]);

  return {
    health,
    loading,
    error,
    refresh: loadHealth
  };
}

// Hook for running SIS checks
export function useSISRunner() {
  const { currentOrg, currentUser } = useMultiTenantAuth();
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<SISRunResult | null>(null);

  const runChecks = async (environment: string = 'production') => {
    if (!currentOrg?.id || running) return;

    try {
      setRunning(true);
      const result = await sisRunner.runChecks(currentOrg.id, environment);
      setLastResult(result);
      return result;
    } catch (error) {
      console.error('Error running SIS checks:', error);
      throw error;
    } finally {
      setRunning(false);
    }
  };

  return {
    runChecks,
    running,
    lastResult
  };
}

// Hook for system alerts
export function useSystemAlerts() {
  const { currentOrg } = useMultiTenantAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    if (!currentOrg?.id) return;

    try {
      const alertsData = await sisRunner.getSystemAlerts(currentOrg.id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!currentOrg?.id) return;

    try {
      await sisRunner.resolveAlert(alertId, currentOrg.id);
      await loadAlerts(); // Refresh alerts list
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [currentOrg?.id]);

  return {
    alerts,
    loading,
    refresh: loadAlerts,
    resolveAlert
  };
}
