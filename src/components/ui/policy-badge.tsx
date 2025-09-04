import React from 'react';
import { Badge } from './badge';
import { Clock, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface PolicyBadgeProps {
  type: 'cancellation' | 'reschedule' | 'late' | 'noshow' | 'refund';
  timeLimit?: string; // e.g., "24h", "2h", "1h"
  policy?: string; // Full policy text
  severity?: 'info' | 'warning' | 'strict';
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

export function PolicyBadge({ 
  type, 
  timeLimit = "24h", 
  policy, 
  severity = "info",
  className = "",
  showIcon = true,
  showTooltip = true
}: PolicyBadgeProps) {
  
  const getPolicyConfig = () => {
    switch (type) {
      case 'cancellation':
        return {
          icon: Clock,
          label: `Free cancellation ${timeLimit} before`,
          color: severity === 'strict' ? 'destructive' : severity === 'warning' ? 'outline' : 'secondary',
          fullPolicy: policy || `Free cancellation up to ${timeLimit} before class start. Late cancellations may incur fees.`
        };
      case 'reschedule':
        return {
          icon: Clock,
          label: `Free reschedule ${timeLimit} before`,
          color: 'secondary',
          fullPolicy: policy || `Free rescheduling up to ${timeLimit} before class start.`
        };
      case 'late':
        return {
          icon: AlertTriangle,
          label: `Late arrival policy`,
          color: 'outline',
          fullPolicy: policy || `Please arrive at least 5 minutes early. Late arrivals may not be admitted.`
        };
      case 'noshow':
        return {
          icon: AlertTriangle,
          label: `No-show policy`,
          color: 'destructive',
          fullPolicy: policy || `No-shows will be charged the full class fee and credits will not be refunded.`
        };
      case 'refund':
        return {
          icon: CheckCircle,
          label: `Refund policy`,
          color: 'secondary',
          fullPolicy: policy || `Refunds processed according to cancellation timeline and payment method.`
        };
      default:
        return {
          icon: Info,
          label: `Policy applies`,
          color: 'secondary',
          fullPolicy: policy || 'Policy information available.'
        };
    }
  };

  const config = getPolicyConfig();
  const IconComponent = config.icon;

  const badge = (
    <Badge 
      variant={config.color as any}
      className={`flex items-center gap-1 text-xs ${className}`}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      {config.label}
    </Badge>
  );

  if (showTooltip && config.fullPolicy) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{config.fullPolicy}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

// Convenience components for common policies
export function CancellationPolicyBadge({ timeLimit = "24h", className = "" }: { timeLimit?: string; className?: string }) {
  return (
    <PolicyBadge 
      type="cancellation" 
      timeLimit={timeLimit}
      className={className}
      policy={`Free cancellation up to ${timeLimit} before class start. Cancellations within ${timeLimit} may incur a CHF 10 late cancellation fee.`}
    />
  );
}

export function ReschedulePolicyBadge({ timeLimit = "24h", className = "" }: { timeLimit?: string; className?: string }) {
  return (
    <PolicyBadge 
      type="reschedule" 
      timeLimit={timeLimit}
      className={className}
      policy={`Free rescheduling up to ${timeLimit} before class start. Late reschedules may incur fees.`}
    />
  );
}

export function NoShowPolicyBadge({ className = "" }: { className?: string }) {
  return (
    <PolicyBadge 
      type="noshow"
      className={className}
      severity="strict"
      policy="No-shows will be charged the full class fee. Credits or passes will not be refunded for missed classes without proper cancellation."
    />
  );
}

export function LateArrivalPolicyBadge({ className = "" }: { className?: string }) {
  return (
    <PolicyBadge 
      type="late"
      className={className}
      severity="warning"
      policy="Please arrive at least 5 minutes before class start. Late arrivals may not be admitted to maintain the quality of the session for all participants."
    />
  );
}