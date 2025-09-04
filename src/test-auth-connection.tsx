// Test authentication connection to Supabase
import React, { useState } from 'react';
import { supabase } from './utils/supabase/client';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseProjectId } from './utils/supabase/env';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';

export function TestAuthConnection() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test@yogaswiss.ch');
  const [password, setPassword] = useState('testpassword123');

  const runConnectionTest = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Configuration
      results.config = {
        url: getSupabaseUrl(),
        projectId: getSupabaseProjectId(),
        hasAnonKey: Boolean(getSupabaseAnonKey()),
        anonKeyLength: getSupabaseAnonKey()?.length || 0
      };

      // Test 2: Basic connection
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        results.session = {
          success: !error,
          hasSession: Boolean(session),
          error: error?.message
        };
      } catch (err) {
        results.session = {
          success: false,
          error: err.message
        };
      }

      // Test 3: Simple database query (without specific tables)
      try {
        const { data, error } = await supabase.auth.getUser();
        results.authUser = {
          success: !error,
          hasUser: Boolean(data?.user),
          error: error?.message
        };
      } catch (err) {
        results.authUser = {
          success: false,
          error: err.message
        };
      }

      // Test 4: Try signing up a test user
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName: 'Test',
              lastName: 'User',
              role: 'owner'
            }
          }
        });
        results.signup = {
          success: !error,
          userId: data?.user?.id,
          needsConfirmation: !data?.session && data?.user && !data?.user?.email_confirmed_at,
          error: error?.message
        };
      } catch (err) {
        results.signup = {
          success: false,
          error: err.message
        };
      }

      // Test 5: Try signing in (if signup worked or user exists)
      if (results.signup.success || results.signup.error?.includes('already registered')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          results.signin = {
            success: !error,
            userId: data?.user?.id,
            hasSession: Boolean(data?.session),
            error: error?.message
          };
        } catch (err) {
          results.signin = {
            success: false,
            error: err.message
          };
        }
      }

    } catch (err) {
      results.generalError = err.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const createBasicDemoUser = async () => {
    setLoading(true);
    try {
      // Try to create the demo user that the app expects
      const { data, error } = await supabase.auth.signUp({
        email: 'studio@yogaswiss.ch',
        password: 'password',
        options: {
          data: {
            firstName: 'Studio',
            lastName: 'Owner',
            role: 'owner',
            orgName: 'YogaZen Demo',
            orgSlug: 'yogazen-demo'
          }
        }
      });

      if (error && !error.message.includes('already registered')) {
        setTestResults({ 
          demoUser: { 
            success: false, 
            error: error.message 
          } 
        });
      } else {
        setTestResults({ 
          demoUser: { 
            success: true, 
            message: error?.message.includes('already registered') 
              ? 'Demo user already exists' 
              : 'Demo user created successfully',
            userId: data?.user?.id
          } 
        });
      }
    } catch (err) {
      setTestResults({ 
        demoUser: { 
          success: false, 
          error: err.message 
        } 
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Supabase Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Test Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Test Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={runConnectionTest} disabled={loading}>
          {loading ? 'Testing...' : 'Run Connection Test'}
        </Button>
        <Button onClick={createBasicDemoUser} disabled={loading} variant="outline">
          {loading ? 'Creating...' : 'Create Demo User'}
        </Button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Test Results:</h2>
          
          {Object.entries(testResults).map(([key, value]) => (
            <Alert key={key} variant={value.success ? "default" : "destructive"}>
              <AlertDescription>
                <strong>{key}:</strong>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestAuthConnection;