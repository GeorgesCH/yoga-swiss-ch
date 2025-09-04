import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Shield, Settings, User, Database, Bug } from 'lucide-react';
import { useAuth } from './auth/ProductionAuthProvider';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { AuthDebugPanel } from './auth/AuthDebugPanel';

export function DevEnvironmentIndicator() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { user, session, loading, databaseReady } = useAuth();
  const { user: mtUser, currentOrg, loading: mtLoading } = useMultiTenantAuth();

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 max-w-sm">
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-amber-800 dark:text-amber-200">
                Development Mode
              </div>
              <div className="space-y-1 text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>Auth: {user ? `✓ ${user.email}` : '✗ Not signed in'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  <span>Org: {currentOrg ? `✓ ${currentOrg.name}` : '✗ No org'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  <span>DB: {databaseReady ? '✓ Ready' : '⚠ Fallback'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>Loading: {loading || mtLoading ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowDebugPanel(true)}
                className="w-full mt-2 h-6 text-xs"
              >
                <Bug className="h-3 w-3 mr-1" />
                Debug Panel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {showDebugPanel && (
        <AuthDebugPanel onClose={() => setShowDebugPanel(false)} />
      )}
    </>
  );
}