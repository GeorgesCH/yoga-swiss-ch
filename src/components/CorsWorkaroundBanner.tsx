import { useState, useEffect } from 'react';
import { AlertCircle, X, ExternalLink, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './auth/ProductionAuthProvider';

export function CorsWorkaroundBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const { session } = useAuth();

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/health');
        setApiStatus(response.ok ? 'healthy' : 'unhealthy');
      } catch (error) {
        setApiStatus('unhealthy');
      }
    };

    checkApiStatus();
  }, []);

  if (dismissed) return null;

  const getStatusInfo = () => {
    if (apiStatus === 'checking') {
      return {
        icon: <Wifi className="h-4 w-4 animate-pulse" />,
        color: 'border-blue-200 bg-blue-50 text-blue-800',
        title: 'Checking API Status...',
        message: 'Verifying backend connection...'
      };
    }
    
    if (apiStatus === 'healthy') {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'border-green-200 bg-green-50 text-green-800',
        title: 'Development Mode Active',
        message: `Backend API is reachable${session ? ' and authenticated' : ' but needs authentication setup'}. Using demo data until database is initialized.`
      };
    }
    
    return {
      icon: <WifiOff className="h-4 w-4" />,
      color: 'border-amber-200 bg-amber-50 text-amber-800',
      title: 'Development Mode - API Unavailable',
      message: 'Backend API is not reachable. Using demo data for development.'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Alert className={`mb-4 ${statusInfo.color}`}>
      {statusInfo.icon}
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1 mr-4">
          <span className="font-semibold">{statusInfo.title}:</span> {statusInfo.message}
          
          {apiStatus === 'healthy' && (
            <div className="mt-1 text-sm">
              <span>Next steps: Deploy database schema and update authentication.</span>
            </div>
          )}
          
          {apiStatus === 'unhealthy' && (
            <div className="mt-1 text-sm">
              <span>Deploy the Edge Function to enable live data.</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-1 hover:bg-opacity-20 ${
            apiStatus === 'healthy' 
              ? 'text-green-600 hover:text-green-800 hover:bg-green-100' 
              : apiStatus === 'unhealthy'
              ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
          }`}
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </AlertDescription>
    </Alert>
  );
}