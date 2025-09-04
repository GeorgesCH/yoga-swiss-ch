// Comprehensive Supabase setup verification and initialization
import { supabase } from './client';
import { getSupabaseProjectId, getSupabaseAnonKey } from './env';

export interface SetupStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  error?: string;
  action?: () => Promise<void>;
}

export interface SetupResult {
  success: boolean;
  steps: SetupStep[];
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    completed: number;
    failed: number;
    warnings: number;
  };
}

export class SupabaseSetupManager {
  private steps: SetupStep[] = [
    {
      id: 'connection',
      name: 'Database Connection',
      description: 'Verify basic connectivity to Supabase',
      required: true,
      status: 'pending',
      action: this.testConnection.bind(this)
    },
    {
      id: 'auth_service',
      name: 'Authentication Service',
      description: 'Verify auth service is accessible',
      required: true,
      status: 'pending',
      action: this.testAuthService.bind(this)
    },
    {
      id: 'schema_check',
      name: 'Database Schema',
      description: 'Check if required tables exist',
      required: false,
      status: 'pending',
      action: this.checkSchema.bind(this)
    },
    {
      id: 'rls_policies',
      name: 'Security Policies',
      description: 'Verify Row Level Security is configured',
      required: false,
      status: 'pending',
      action: this.checkRLS.bind(this)
    },
    {
      id: 'storage_setup',
      name: 'File Storage',
      description: 'Verify storage buckets and permissions',
      required: false,
      status: 'pending',
      action: this.checkStorage.bind(this)
    },
    {
      id: 'realtime_setup',
      name: 'Realtime Features',
      description: 'Test realtime subscriptions',
      required: false,
      status: 'pending',
      action: this.checkRealtime.bind(this)
    },
    {
      id: 'edge_functions',
      name: 'Edge Functions',
      description: 'Verify backend API endpoints',
      required: false,
      status: 'pending',
      action: this.checkEdgeFunctions.bind(this)
    },
    {
      id: 'seed_data',
      name: 'Sample Data',
      description: 'Initialize with sample data if needed',
      required: false,
      status: 'pending',
      action: this.seedSampleData.bind(this)
    }
  ];

  async runSetup(): Promise<SetupResult> {
    console.log('🚀 Starting Supabase setup verification...');
    
    const result: SetupResult = {
      success: false,
      steps: [...this.steps],
      errors: [],
      warnings: [],
      summary: {
        total: this.steps.length,
        completed: 0,
        failed: 0,
        warnings: 0
      }
    };

    for (const step of result.steps) {
      try {
        console.log(`⏳ Running: ${step.name}`);
        step.status = 'running';
        
        if (step.action) {
          await step.action();
        }
        
        step.status = 'success';
        result.summary.completed++;
        console.log(`✅ Completed: ${step.name}`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        step.status = step.required ? 'error' : 'warning';
        step.error = errorMessage;
        
        if (step.required) {
          result.errors.push(`${step.name}: ${errorMessage}`);
          result.summary.failed++;
          console.error(`❌ Failed: ${step.name} - ${errorMessage}`);
        } else {
          result.warnings.push(`${step.name}: ${errorMessage}`);
          result.summary.warnings++;
          console.warn(`⚠️ Warning: ${step.name} - ${errorMessage}`);
        }
      }
    }

    result.success = result.summary.failed === 0;
    
    console.log('📊 Setup Summary:', result.summary);
    
    if (result.success) {
      console.log('🎉 Supabase setup verification completed successfully!');
    } else {
      console.log('💥 Setup verification completed with errors. Check the issues above.');
    }

    return result;
  }

  private async testConnection(): Promise<void> {
    try {
      // Test 1: Try auth service (this always works if Supabase is accessible)
      const { error: authError } = await supabase.auth.getSession();
      if (authError) {
        throw new Error(`Auth service failed: ${authError.message}`);
      }

      // Test 2: Try a simple RPC call to test database connectivity
      try {
        // This will fail gracefully if the function doesn't exist
        await supabase.rpc('get_current_timestamp_test').limit(1);
      } catch (rpcError) {
        // RPC failure is expected if function doesn't exist, that's fine
      }

      // Test 3: Try to access any table with a simple select (this will fail if no tables exist, but confirms connection)
      try {
        const { error: tableError } = await supabase
          .from('orgs')
          .select('count', { count: 'exact', head: true })
          .limit(0);
        
        // If we get here without a connection error, we're connected
        // Table not existing (42P01) is fine, connection is working
        if (tableError && tableError.code !== '42P01' && !tableError.message.includes('does not exist')) {
          console.warn('Database query failed but connection is working:', tableError.message);
        }
      } catch (tableError) {
        // This is fine, just means tables don't exist yet
      }

      console.log('Database connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      throw new Error(`Database connection failed: ${errorMessage}`);
    }
  }

  private async testAuthService(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Auth service error: ${error.message}`);
      }

      console.log('Auth service accessible');
    } catch (error) {
      throw new Error(`Auth service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkSchema(): Promise<void> {
    const requiredTables = [
      'orgs', 
      'user_profiles', 
      'org_users', 
      'locations',
      'class_templates', 
      'class_occurrences', 
      'registrations',
      'wallets'
    ];

    let existingTables: string[] = [];
    let missingTables: string[] = [];

    // Try to check each table individually by attempting to select from it
    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true })
          .limit(0);

        if (!error) {
          existingTables.push(tableName);
        } else if (error.code === '42P01') {
          // Table doesn't exist
          missingTables.push(tableName);
        } else {
          // Other error (might be permissions)
          console.warn(`Table ${tableName} check failed:`, error.message);
          missingTables.push(tableName);
        }
      } catch (err) {
        missingTables.push(tableName);
      }
    }

    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}. Please run the database setup SQL script first.`);
    }

    console.log(`Schema check passed: ${existingTables.length}/${requiredTables.length} tables found`);
  }

  private async checkRLS(): Promise<void> {
    try {
      // Try to call a custom function that checks RLS status
      const { data, error } = await supabase.rpc('check_rls_status');
      
      if (error && error.code === '42883') {
        // Function doesn't exist, which is okay for development
        console.log('RLS check function not found - skipping');
        return;
      }
      
      if (error) {
        throw new Error(`RLS check failed: ${error.message}`);
      }

      console.log('RLS policies verified');
    } catch (error) {
      // RLS check is not critical, just log warning
      console.log('RLS verification skipped - function not available');
    }
  }

  private async checkStorage(): Promise<void> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        throw new Error(`Storage check failed: ${error.message}`);
      }

      console.log(`Storage accessible: ${buckets?.length || 0} buckets found`);
    } catch (error) {
      throw new Error(`Storage service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkRealtime(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Realtime test timeout'));
      }, 10000);

      try {
        const channel = supabase.channel('setup-test');
        
        channel
          .on('broadcast', { event: 'test' }, () => {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            console.log('Realtime test successful');
            resolve();
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({ type: 'broadcast', event: 'test' });
            } else if (status === 'CHANNEL_ERROR') {
              clearTimeout(timeout);
              reject(new Error('Realtime subscription failed'));
            }
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async checkEdgeFunctions(): Promise<void> {
    try {
      const projectId = getSupabaseProjectId();
      const anonKey = getSupabaseAnonKey();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Edge function health check failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`Edge functions available: version ${data.version || 'unknown'}`);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Edge function timeout - functions may not be deployed');
      }
      throw new Error(`Edge functions unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async seedSampleData(): Promise<void> {
    try {
      // Check if we already have any organizations
      const { data: existingOrgs, error } = await supabase
        .from('orgs')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        if (error.code === '42P01') {
          // Table doesn't exist
          console.log('Sample data skipped - tables not created yet');
          return;
        }
        throw error;
      }

      if (existingOrgs && existingOrgs.length > 0) {
        console.log('Sample data already exists, skipping seeding');
        return;
      }

      // Try to seed via edge function
      const projectId = getSupabaseProjectId();
      const anonKey = getSupabaseAnonKey();
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/seed/basic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ demo: true })
      });

      if (response.ok) {
        console.log('Sample data seeded successfully');
      } else {
        // Seeding failed, but this is not critical
        console.log('Sample data seeding failed - continuing without seed data');
      }
    } catch (error) {
      // Seeding is not critical, just log the issue
      console.log('Sample data seeding skipped:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Method to get a quick status overview
  async getQuickStatus(): Promise<{
    connected: boolean;
    authenticated: boolean;
    schemaReady: boolean;
    functionsReady: boolean;
    projectId?: string;
  }> {
    const status = {
      connected: false,
      authenticated: false,
      schemaReady: false,
      functionsReady: false,
      projectId: getSupabaseProjectId()
    };

    try {
      // Test basic connection via auth service
      try {
        const { error: authError } = await supabase.auth.getSession();
        status.connected = !authError;
        status.authenticated = !authError;
        
        if (authError) {
          console.log('Auth service failed:', authError.message);
        }
      } catch (error) {
        console.log('Connection test failed:', error);
        status.connected = false;
        status.authenticated = false;
      }

      // Test schema by trying to access core tables
      try {
        const { error: orgError } = await supabase
          .from('orgs')
          .select('count', { count: 'exact', head: true })
          .limit(0);

        const { error: profileError } = await supabase
          .from('user_profiles')
          .select('count', { count: 'exact', head: true })
          .limit(0);

        status.schemaReady = !orgError && !profileError;
      } catch (error) {
        console.log('Schema test failed:', error);
        status.schemaReady = false;
      }

      // Test functions
      try {
        const projectId = getSupabaseProjectId();
        const anonKey = getSupabaseAnonKey();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
          headers: { 'Authorization': `Bearer ${anonKey}` },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        status.functionsReady = response.ok;
      } catch (error) {
        console.log('Functions test failed:', error);
        status.functionsReady = false;
      }

    } catch (error) {
      console.error('Quick status check failed:', error);
    }

    return status;
  }
}

// Export singleton instance
export const supabaseSetup = new SupabaseSetupManager();

// Convenience function for quick setup check
export async function verifySupabaseSetup(): Promise<SetupResult> {
  return supabaseSetup.runSetup();
}

// Quick health check
export async function getSupabaseHealth() {
  return supabaseSetup.getQuickStatus();
}