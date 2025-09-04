import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Loader2, 
  Database, 
  Users, 
  MapPin, 
  Calendar, 
  Package, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  checkSeedStatus, 
  seedDemoData, 
  resetDemoData, 
  runSystemHealthCheck,
  type SeedResult 
} from '../utils/demo-seeder';
export function DemoSeederButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [healthCheckResult, setHealthCheckResult] = useState<any>(null);
  const [seedStatus, setSeedStatus] = useState<any>(null);

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      const result = await seedDemoData();
      setSeedResult(result);
      
      // Check status after seeding
      const status = await checkSeedStatus();
      setSeedStatus(status);
    } catch (error) {
      setSeedResult({
        success: false,
        message: `Seeding failed: ${error.message}`,
        error: error.message
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    setSeedResult(null);
    
    try {
      const result = await resetDemoData();
      setSeedResult(result);
      
      // Check status after reset
      const status = await checkSeedStatus();
      setSeedStatus(status);
    } catch (error) {
      setSeedResult({
        success: false,
        message: `Reset failed: ${error.message}`,
        error: error.message
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleHealthCheck = async () => {
    setIsChecking(true);
    setHealthCheckResult(null);
    
    try {
      const result = await runSystemHealthCheck();
      setHealthCheckResult(result);
      
      // Also get seed status
      const status = await checkSeedStatus();
      setSeedStatus(status);
    } catch (error) {
      setHealthCheckResult({
        error: error.message,
        status: 'failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check status on component mount
  React.useEffect(() => {
    checkSeedStatus().then(setSeedStatus);
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          YogaSwiss Demo Data Management
          <Badge variant="secondary">🇨🇭 Swiss Ready</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Initialize demo data for YogaSwiss with Swiss studios, users, classes, and payment integrations
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        {seedStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">{seedStatus.demoUsers}</p>
              <p className="text-xs text-muted-foreground">Demo Users</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">{seedStatus.counts?.orgs || 0}</p>
              <p className="text-xs text-muted-foreground">Studios</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">{seedStatus.counts?.class_templates || 0}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">{seedStatus.counts?.class_occurrences || 0}</p>
              <p className="text-xs text-muted-foreground">Occurrences</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSeedDemo}
            disabled={isSeeding || isResetting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding Demo Data...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                🌱 Seed Demo Data
              </>
            )}
          </Button>

          <Button
            onClick={handleResetDemo}
            variant="destructive"
            disabled={isSeeding || isResetting}
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                🧹 Reset Demo Data
              </>
            )}
          </Button>

          <Button
            onClick={handleHealthCheck}
            variant="outline"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                🔍 System Health Check
              </>
            )}
          </Button>
        </div>

        {/* Seed Result */}
        {seedResult && (
          <div className={`p-4 rounded-lg ${seedResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              {seedResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-2">
                <p className={`font-medium ${seedResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {seedResult.message}
                </p>
                
                {seedResult.success && seedResult.data && (
                  <div className="text-sm text-green-700 space-y-1">
                    <p>✅ Created {seedResult.data.orgs} organizations</p>
                    <p>✅ Created {seedResult.data.users} demo users</p>
                    <p>✅ Created {seedResult.data.locations} locations</p>
                    <p>✅ Created {seedResult.data.templates} class templates</p>
                    <p>✅ Created {seedResult.data.products} products</p>
                    <p>✅ Created {seedResult.data.occurrences} class occurrences</p>
                    <p>✅ Created {seedResult.data.orders} sample orders</p>
                  </div>
                )}
                
                {!seedResult.success && seedResult.error && (
                  <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                    {seedResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Health Check Result */}
        {healthCheckResult && (
          <div className="space-y-4">
            <h4 className="font-medium">System Health Check Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthCheckResult.server_health && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Server Health</h5>
                  <Badge variant={healthCheckResult.server_health.status === 'ok' ? 'default' : 'destructive'}>
                    {healthCheckResult.server_health.status}
                  </Badge>
                  {healthCheckResult.server_health.version && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Version: {healthCheckResult.server_health.version}
                    </p>
                  )}
                </div>
              )}
              
              {healthCheckResult.localization && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">🌍 Localization</h5>
                  <Badge variant="default">
                    4 Locales Working
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    DE/FR/IT/EN with CHF formatting
                  </p>
                </div>
              )}
              
              {healthCheckResult.payments && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">💳 Payments</h5>
                  <Badge variant="default">
                    TWINT & QR-Bills
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Swiss payment methods ready
                  </p>
                </div>
              )}
              
              {healthCheckResult.seed_status && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">🌱 Demo Data</h5>
                  <Badge variant={healthCheckResult.seed_status.isSeeded ? 'default' : 'secondary'}>
                    {healthCheckResult.seed_status.isSeeded ? 'Seeded' : 'Not Seeded'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {healthCheckResult.seed_status.demoUsers} demo users
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo User Credentials */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">🔐 Demo User Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Brand Owner</p>
              <p className="text-blue-700">owner@yogaswiss-demo.ch</p>
              <p className="text-blue-600 font-mono">Demo!Owner2025</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Studio Manager</p>
              <p className="text-green-700">manager.zrh@yogaswiss-demo.ch</p>
              <p className="text-green-600 font-mono">Demo!Mgr2025</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-800">Instructor</p>
              <p className="text-purple-700">instructor@yogaswiss-demo.ch</p>
              <p className="text-purple-600 font-mono">Demo!Teach2025</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium text-orange-800">Customer</p>
              <p className="text-orange-700">customer@yogaswiss-demo.ch</p>
              <p className="text-orange-600 font-mono">Demo!Cust2025</p>
            </div>
          </div>
        </div>

        {/* Swiss Features Info */}
        <div className="bg-gradient-to-r from-red-50/50 via-white to-red-50/50 border border-red-100/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">🇨🇭 Swiss Features Included</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>TWINT Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📄</span>
              <span>QR-Bill Invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🗣️</span>
              <span>4-Language Support</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏔️</span>
              <span>Outdoor Classes</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {seedStatus && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={seedStatus.isSeeded ? 'default' : 'secondary'}>
                {seedStatus.isSeeded ? '✅ Demo Ready' : '⏳ Needs Seeding'}
              </Badge>
              {seedStatus.isSeeded && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}