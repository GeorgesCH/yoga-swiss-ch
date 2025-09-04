import { supabase } from './client';

// =====================================================
// SIS Runner Service
// Handles automated health checks and monitoring
// =====================================================

export interface SISRunResult {
  run_id: number;
  result: 'ok' | 'warn' | 'fail';
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  warning_checks: number;
  duration_ms: number;
  details?: SISCheckResult[];
}

export interface SISCheckResult {
  check_id: number;
  name: string;
  resource_type: string;
  resource_ref: string;
  status: 'ok' | 'warn' | 'fail';
  latency_ms: number;
  message: string;
  severity: string;
}

export interface SISHealthSummary {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  last_run_at: string | null;
  duration_ms: number | null;
  checks_total: number;
  checks_passed: number;
  checks_failed: number;
  checks_warning: number;
  health_score: number;
}

class SISRunnerService {
  private runCache: Map<string, SISRunResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Run SIS checks for an organization
  async runChecks(
    organizationId: string,
    environment: string = 'production'
  ): Promise<SISRunResult> {
    try {
      const { data, error } = await supabase.rpc('run_sis_checks', {
        p_organization_id: organizationId,
        p_environment: environment
      });

      if (error) {
        console.error('SIS check error:', error);
        throw new Error(`SIS checks failed: ${error.message}`);
      }

      const result: SISRunResult = {
        run_id: data.run_id,
        result: data.result,
        total_checks: data.total_checks,
        passed_checks: data.passed_checks,
        failed_checks: data.failed_checks,
        warning_checks: data.warning_checks,
        duration_ms: data.duration_ms
      };

      // Cache the result
      this.runCache.set(organizationId, result);

      return result;

    } catch (error) {
      console.error('Error running SIS checks:', error);
      throw error;
    }
  }

  // Get detailed results for a specific run
  async getRunDetails(runId: number): Promise<SISCheckResult[]> {
    try {
      const { data, error } = await supabase
        .from('sis_results')
        .select(`
          *,
          check:sis_checks (
            name,
            resource_type,
            resource_ref,
            severity
          )
        `)
        .eq('run_id', runId)
        .order('check_id');

      if (error) throw error;

      return data?.map(result => ({
        check_id: result.check_id,
        name: result.check.name,
        resource_type: result.check.resource_type,
        resource_ref: result.check.resource_ref,
        status: result.status,
        latency_ms: result.latency_ms || 0,
        message: result.message || '',
        severity: result.check.severity
      })) || [];

    } catch (error) {
      console.error('Error getting run details:', error);
      throw error;
    }
  }

  // Get health summary for organization
  async getHealthSummary(organizationId: string): Promise<SISHealthSummary> {
    try {
      const { data, error } = await supabase.rpc('get_sis_health_summary', {
        p_organization_id: organizationId
      });

      if (error) throw error;

      return {
        status: data.status || 'unknown',
        last_run_at: data.last_run_at,
        duration_ms: data.duration_ms,
        checks_total: data.checks_total || 0,
        checks_passed: data.checks_passed || 0,
        checks_failed: data.checks_failed || 0,
        checks_warning: data.checks_warning || 0,
        health_score: data.health_score || 0
      };

    } catch (error) {
      console.error('Error getting health summary:', error);
      
      // Return safe defaults on error
      return {
        status: 'unknown',
        last_run_at: null,
        duration_ms: null,
        checks_total: 0,
        checks_passed: 0,
        checks_failed: 0,
        checks_warning: 0,
        health_score: 0
      };
    }
  }

  // Get recent SIS runs
  async getRecentRuns(
    organizationId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sis_runs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error getting recent runs:', error);
      return [];
    }
  }

  // Get system alerts
  async getSystemAlerts(
    organizationId: string,
    includeResolved: boolean = false
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('system_alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (!includeResolved) {
        query = query.eq('resolved', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error getting system alerts:', error);
      return [];
    }
  }

  // Resolve a system alert
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  // Create a custom system alert
  async createAlert(
    organizationId: string,
    alertType: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    title: string,
    message: string,
    sourceTable?: string,
    sourceId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .insert({
          organization_id: organizationId,
          alert_type: alertType,
          severity,
          title,
          message,
          source_table: sourceTable,
          source_id: sourceId
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Schedule nightly SIS runs (would be called by a cron job)
  async scheduleNightlyRuns(): Promise<void> {
    try {
      // Get all organizations with SIS enabled
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('id, settings')
        .eq('subscription_status', 'active');

      if (error) throw error;

      const promises = orgs
        ?.filter(org => org.settings?.sis_nightly_run === true)
        .map(org => this.runChecks(org.id, 'nightly'))
        || [];

      await Promise.allSettled(promises);

    } catch (error) {
      console.error('Error scheduling nightly runs:', error);
    }
  }

  // Get SIS inventory for organization
  async getInventory(organizationId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sis_inventory')
        .select('*')
        .eq('organization_id', organizationId)
        .order('area', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error getting SIS inventory:', error);
      return [];
    }
  }

  // Update SIS inventory item
  async updateInventoryItem(
    itemId: string,
    updates: Partial<{
      criticality: string;
      owner_role: string;
      resource_type: string;
      resource_ref: string;
    }>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sis_inventory')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  // Get failed checks summary
  async getFailedChecksSummary(organizationId: string): Promise<{
    critical_failures: number;
    high_failures: number;
    recent_failures: any[];
  }> {
    try {
      // Get the latest run
      const { data: latestRun } = await supabase
        .from('sis_runs')
        .select('id')
        .eq('organization_id', organizationId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestRun) {
        return {
          critical_failures: 0,
          high_failures: 0,
          recent_failures: []
        };
      }

      // Get failed checks from latest run
      const { data: failedChecks, error } = await supabase
        .from('sis_results')
        .select(`
          *,
          check:sis_checks (
            name,
            resource_type,
            resource_ref,
            severity
          )
        `)
        .eq('run_id', latestRun.id)
        .eq('status', 'fail');

      if (error) throw error;

      const critical_failures = failedChecks?.filter(c => c.check.severity === 'critical').length || 0;
      const high_failures = failedChecks?.filter(c => c.check.severity === 'high').length || 0;

      return {
        critical_failures,
        high_failures,
        recent_failures: failedChecks || []
      };

    } catch (error) {
      console.error('Error getting failed checks summary:', error);
      return {
        critical_failures: 0,
        high_failures: 0,
        recent_failures: []
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.runCache.clear();
  }

  // Get cached result
  getCachedResult(organizationId: string): SISRunResult | null {
    const cached = this.runCache.get(organizationId);
    if (!cached) return null;

    // Check if cache is still valid (5 minutes)
    const cacheAge = Date.now() - cached.duration_ms;
    if (cacheAge > this.cacheTimeout) {
      this.runCache.delete(organizationId);
      return null;
    }

    return cached;
  }
}

// Export singleton instance
export const sisRunner = new SISRunnerService();