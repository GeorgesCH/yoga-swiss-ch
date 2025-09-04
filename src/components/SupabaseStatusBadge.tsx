import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Database, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { getSupabaseHealth } from '../utils/supabase/setup-verification';

interface SupabaseStatusBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
}

export function SupabaseStatusBadge({ 
  size = 'sm', 
  showIcon = true, 
  onClick 
}: SupabaseStatusBadgeProps) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    
    // Check every 2 minutes
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const healthStatus = await getSupabaseHealth();
      setHealth(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        connected: false,
        authenticated: false,
        schemaReady: false,
        functionsReady: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (loading) {
      return {
        status: 'loading',
        text: 'Checking...',
        color: 'bg-gray-100 text-gray-700',
        icon: Loader2,
        iconClass: 'animate-spin'
      };
    }

    if (!health) {
      return {
        status: 'unknown',
        text: 'Unknown',
        color: 'bg-gray-100 text-gray-700',
        icon: Database,
        iconClass: ''
      };
    }

    const { connected, authenticated, schemaReady, functionsReady } = health;

    if (!connected) {
      return {
        status: 'offline',
        text: 'Offline',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        iconClass: ''
      };
    }

    if (!authenticated || !schemaReady) {
      return {
        status: 'degraded',
        text: 'Limited',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: AlertTriangle,
        iconClass: ''
      };
    }

    if (!functionsReady) {
      return {
        status: 'partial',
        text: 'Partial',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: AlertTriangle,
        iconClass: ''
      };
    }

    return {
      status: 'online',
      text: 'Online',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      iconClass: ''
    };
  };

  const status = getStatus();
  const IconComponent = status.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      className={`${status.color} ${sizeClasses[size]} border cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={onClick}
      title={`Supabase Status: ${status.text}`}
    >
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <IconComponent 
            className={`${iconSizes[size]} ${status.iconClass}`} 
          />
        )}
        <span>Supabase {status.text}</span>
      </div>
    </Badge>
  );
}