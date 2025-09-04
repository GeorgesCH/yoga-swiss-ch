import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, X, Database } from 'lucide-react';

export function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in development mode by testing API connection
    const checkApiConnection = async () => {
      try {
        const { getSupabaseProjectId, getSupabaseAnonKey } = await import('../utils/supabase/env');
        const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getSupabaseAnonKey()}`,
          },
        });
        
        if (!response.ok) {
          setIsVisible(true);
        }
      } catch (error) {
        setIsVisible(true);
      }
    };

    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('dev-banner-dismissed');
    if (!dismissed) {
      checkApiConnection();
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('dev-banner-dismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <Database className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-800">
            <strong>Backend Unavailable:</strong> Cannot reach Supabase backend. Features are limited until the connection is restored.
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
