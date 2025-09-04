import React, { useState } from 'react';
import { useAuth } from './auth/ProductionAuthProvider';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Database, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Copy } from 'lucide-react';
import { DatabaseInitializationRunner } from './DatabaseInitializationRunner';
import { runDatabaseInitialization } from '../utils/supabase/run-database-init';

interface DatabaseStatusIndicatorProps {
  showOnlyWhenNotReady?: boolean;
  compact?: boolean;
}

export function DatabaseStatusIndicator({ 
  showOnlyWhenNotReady = true, 
  compact = false 
}: DatabaseStatusIndicatorProps) {
  const { databaseReady } = useAuth();
  const [showInitializer, setShowInitializer] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<string | null>(null);

  const handleQuickInit = async () => {
    setIsInitializing(true);
    setInitResult(null);
    
    try {
      console.log('🚀 Starting database initialization...');
      const result = await runDatabaseInitialization();
      
      if (result.success) {
        setInitResult('Database initialization completed successfully! Check the console for details and SQL scripts.');
      } else {
        setInitResult(`Initialization failed: ${result.error || 'Unknown error'}. Check the console for SQL scripts to run manually.`);
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      setInitResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Check the console for details.`);
    } finally {
      setIsInitializing(false);
    }
  };

  // If we only want to show when not ready, and it is ready, don't render
  if (showOnlyWhenNotReady && databaseReady) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {databaseReady ? (
          <>
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Database Ready</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <span className="text-yellow-600">Database Not Ready</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <Alert variant={databaseReady ? "default" : "destructive"} className="mb-4">
        <Database className="h-4 w-4" />
        <AlertDescription>
          {databaseReady ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <strong>Database is connected and ready</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                All features are available and your data is being saved to Supabase.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <strong>Database Schema Not Initialized</strong>
              </div>
              <p className="text-sm">
                The database schema is not initialized. Features are disabled until setup completes.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    window.open('https://supabase.com/docs/guides/getting-started', '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Supabase Docs
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleQuickInit}
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Database className="h-3 w-3 mr-1" />
                  )}
                  {isInitializing ? 'Initializing...' : 'Quick Setup'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowInitializer(true)}
                  disabled={isInitializing}
                >
                  <Database className="h-3 w-3 mr-1" />
                  Advanced Setup
                </Button>
              </div>
              
              {/* Show initialization result */}
              {initResult && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{initResult}</p>
                  {initResult.includes('SQL scripts') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        window.open('https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql', '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Supabase SQL Editor
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
      
      {/* Database Initialization Dialog */}
      <Dialog open={showInitializer} onOpenChange={setShowInitializer}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              YogaSwiss Database Initialization
            </DialogTitle>
            <DialogDescription>
              Complete database setup for your YogaSwiss platform with step-by-step guidance and real-time progress tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <DatabaseInitializationRunner />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
