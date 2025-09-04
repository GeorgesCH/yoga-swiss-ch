import React, { useState } from 'react';
import { isDevelopmentEnvironment } from '../../utils/auth-bypass';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { AuthDebugPanel } from './AuthDebugPanel';

export function EmailBypassIndicator() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [bypassEnabled, setBypassEnabled] = useState(
    localStorage.getItem('yogaswiss-bypass-email-confirmation') === 'true'
  );

  if (!isDevelopmentEnvironment()) {
    return null;
  }

  const handleToggleBypass = (enabled: boolean) => {
    setBypassEnabled(enabled);
    if (enabled) {
      localStorage.setItem('yogaswiss-bypass-email-confirmation', 'true');
    } else {
      localStorage.removeItem('yogaswiss-bypass-email-confirmation');
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 shadow-md">
          <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Development Mode</span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-300 mt-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span>Email Bypass:</span>
              <Switch 
                checked={bypassEnabled}
                onCheckedChange={handleToggleBypass}
              />
            </div>
            <div className="pt-1 border-t border-amber-200 dark:border-amber-700">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-100"
                onClick={() => setShowDebugPanel(true)}
              >
                🔧 Open Debug Panel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showDebugPanel && (
        <AuthDebugPanel onClose={() => setShowDebugPanel(false)} />
      )}
    </>
  );
}