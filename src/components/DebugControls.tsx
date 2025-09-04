import React from 'react';

interface DebugControlsProps {
  appMode: 'admin' | 'portal';
  debugMode: boolean;
  demoMode: boolean;
  showStudioAuth: boolean;
  setAppMode: (mode: 'admin' | 'portal') => void;
  setDebugMode: (debug: boolean) => void;
  setDemoMode: (demo: boolean) => void;
  setShowStudioAuth: (show: boolean) => void;
  position: 'portal' | 'admin' | 'studio-auth';
}

export function DebugControls({
  appMode,
  debugMode,
  demoMode,
  showStudioAuth,
  setAppMode,
  setDebugMode,
  setDemoMode,
  setShowStudioAuth,
  position
}: DebugControlsProps) {
  const handleReloadApp = () => {
    window.location.reload();
  };

  if (position === 'portal') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setAppMode('admin')}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          Admin Mode
        </button>
        <button
          onClick={() => {
            console.log('Quick demo access: switching to admin demo mode...');
            setAppMode('admin');
            setDemoMode(true);
            setShowStudioAuth(false);
            setDebugMode(false);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          🚀 Demo
        </button>
        <button
          onClick={() => {
            console.log('Direct admin bypass...');
            setAppMode('admin');
            setShowStudioAuth(false);
            setDebugMode(true);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          🔧 Debug
        </button>
        <button
          onClick={handleReloadApp}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          🔄 Reload A
        </button>
      </div>
    );
  }

  if (position === 'studio-auth') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => {
            setShowStudioAuth(false);
            setAppMode('portal');
            setDebugMode(false);
            setDemoMode(false);
          }}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          ← Portal
        </button>
        <button
          onClick={handleReloadApp}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          🔄 Reload A
        </button>
      </div>
    );
  }

  if (position === 'admin') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => {
            setAppMode('portal');
            setDebugMode(false);
            setDemoMode(false);
          }}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          Portal
        </button>
        {debugMode && (
          <div className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm border border-red-200">
            🔧 Debug
          </div>
        )}
        {demoMode && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm border border-green-200">
            🚀 Demo
          </div>
        )}
        <button
          onClick={handleReloadApp}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm opacity-75 hover:opacity-100 transition-opacity"
        >
          🔄 Reload A
        </button>
      </div>
    );
  }

  return null;
}