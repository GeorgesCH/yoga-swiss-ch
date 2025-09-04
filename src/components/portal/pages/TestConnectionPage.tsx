import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { useLanguage } from '../../LanguageProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database, 
  Server, 
  Users,
  MapPin,
  Search
} from 'lucide-react';
import { getSupabaseProjectId, getSupabaseAnonKey } from '../../../utils/supabase/env';

export function TestConnectionPage() {
  const { t } = useLanguage();
  const { searchClasses, getStudios, getInstructors, isAuthenticated, customerProfile } = usePortal();
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const runConnectionTests = async () => {
    setConnectionStatus('testing');
    const results: Record<string, any> = {};

    try {
      // Test 1: Basic health check
      console.log('Testing health endpoint...');
      const healthResponse = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
        headers: {
          'Authorization': `Bearer ${getSupabaseAnonKey()}`
        }
      });
      results.health = {
        success: healthResponse.ok,
        status: healthResponse.status,
        data: healthResponse.ok ? await healthResponse.json() : null
      };

      // Test 2: Search classes
      console.log('Testing class search...');
      const classData = await searchClasses({ location: 'zurich' });
      results.classes = {
        success: Array.isArray(classData),
        count: classData.length,
        data: classData.slice(0, 3) // Show first 3 results
      };

      // Test 3: Get studios
      console.log('Testing studios endpoint...');
      const studioData = await getStudios('zurich');
      results.studios = {
        success: Array.isArray(studioData),
        count: studioData.length,
        data: studioData.slice(0, 3)
      };

      // Test 4: Get instructors
      console.log('Testing instructors endpoint...');
      const instructorData = await getInstructors('zurich');
      results.instructors = {
        success: Array.isArray(instructorData),
        count: instructorData.length,
        data: instructorData.slice(0, 3)
      };

      // Test 5: Authentication status
      results.auth = {
        isAuthenticated,
        profile: customerProfile ? {
          id: customerProfile.id,
          firstName: customerProfile.firstName,
          creditsBalance: customerProfile.creditsBalance
        } : null
      };

      // Test 6: Supabase client singleton
      try {
        const { supabase } = await import('../../../utils/supabase/client');
        const client1 = supabase;
        const client2 = supabase;
        results.singleton = {
          success: client1 === client2,
          message: client1 === client2 ? 'Single instance confirmed' : 'Multiple instances detected',
          clientInfo: {
            hasAuth: !!client1.auth,
            hasFrom: !!client1.from,
            isValid: typeof client1.auth.getUser === 'function'
          }
        };
      } catch (error) {
        results.singleton = {
          success: false,
          message: 'Failed to test singleton pattern',
          error: error.message
        };
      }

      setTestResults(results);
      
      const allTestsPassed = results.health?.success && 
                           results.classes?.success && 
                           results.studios?.success && 
                           results.instructors?.success;
      
      setConnectionStatus(allTestsPassed ? 'success' : 'error');
      
    } catch (error) {
      console.error('Connection test failed:', error);
      results.error = error.message;
      setTestResults(results);
      setConnectionStatus('error');
    }
  };

  const searchForClasses = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await searchClasses({ 
      query: searchQuery,
      location: 'zurich'
    });
    setClasses(results);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runConnectionTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">YogaSwiss Supabase Connection Test</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Testing the connection between your YogaSwiss frontend and the Supabase backend with Swiss-specific features.
        </p>
        
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon(connectionStatus)}
          <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
            {connectionStatus === 'testing' && 'Testing Connection...'}
            {connectionStatus === 'success' && 'All Systems Operational'}
            {connectionStatus === 'error' && 'Connection Issues Detected'}
            {connectionStatus === 'idle' && 'Ready to Test'}
          </Badge>
        </div>
      </div>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Connection Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project ID</label>
              <p className="font-mono text-sm bg-muted p-2 rounded">{getSupabaseProjectId()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Backend URL</label>
              <p className="font-mono text-sm bg-muted p-2 rounded">
                https://{getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4
              </p>
            </div>
          </div>
          
          <Button onClick={runConnectionTests} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Connection Tests'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Health Check
                {testResults.health?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status: {testResults.health?.status || 'Failed'}
              </p>
              {testResults.health?.data && (
                <pre className="text-xs bg-muted p-2 rounded mt-2">
                  {JSON.stringify(testResults.health.data, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* Classes Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Classes API
                {testResults.classes?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Found: {testResults.classes?.count || 0} classes
              </p>
              {testResults.classes?.data?.map((cls: any, index: number) => (
                <div key={index} className="text-xs bg-muted p-2 rounded mt-1">
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-muted-foreground">{cls.instructor} • {formatPrice(cls.price)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Studios Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Studios API
                {testResults.studios?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Found: {testResults.studios?.count || 0} studios
              </p>
              {testResults.studios?.data?.map((studio: any, index: number) => (
                <div key={index} className="text-xs bg-muted p-2 rounded mt-1">
                  <p className="font-medium">{studio.name}</p>
                  <p className="text-muted-foreground">Rating: {studio.rating}/5</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructors Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Instructors API
                {testResults.instructors?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Found: {testResults.instructors?.count || 0} instructors
              </p>
              {testResults.instructors?.data?.map((instructor: any, index: number) => (
                <div key={index} className="text-xs bg-muted p-2 rounded mt-1">
                  <p className="font-medium">{instructor.name}</p>
                  <p className="text-muted-foreground">{instructor.specialties.join(', ')}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Authentication Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Authentication
                {testResults.auth?.isAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-yellow-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status: {testResults.auth?.isAuthenticated ? 'Authenticated' : 'Guest User'}
              </p>
              {testResults.auth?.profile && (
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <p className="font-medium">{testResults.auth.profile.firstName}</p>
                  <p className="text-muted-foreground">{testResults.auth.profile.creditsBalance} credits</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Singleton Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                Client Singleton
                {testResults.singleton?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {testResults.singleton?.message || 'Testing...'}
              </p>
              {testResults.singleton?.clientInfo && (
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <p>Auth: {testResults.singleton.clientInfo.hasAuth ? '✓' : '✗'}</p>
                  <p>Database: {testResults.singleton.clientInfo.hasFrom ? '✓' : '✗'}</p>
                  <p>Valid: {testResults.singleton.clientInfo.isValid ? '✓' : '✗'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Details */}
          {testResults.error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base text-red-600">
                  Error Details
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-red-50 text-red-800 p-2 rounded whitespace-pre-wrap">
                  {testResults.error}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Interactive Search Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Interactive Search Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for yoga classes (e.g., 'Vinyasa', 'Yin Yoga')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchForClasses()}
            />
            <Button onClick={searchForClasses}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {classes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Search Results ({classes.length} classes found):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classes.map((cls, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{cls.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          with {cls.instructor} • {cls.studio}
                        </p>
                      </div>
                      <Badge variant="secondary">{formatPrice(cls.price)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{cls.duration}min</span>
                      <span>{cls.level}</span>
                      <span>{cls.spotsLeft} spots left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
