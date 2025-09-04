import { supabase } from './client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// =====================================================
// Realtime Configuration for YogaSwiss
// Live subscriptions for critical business data
// =====================================================

export interface RealtimeConfig {
  table: string;
  filter?: string;
  enabled: boolean;
  description: string;
}

// Define which tables should have realtime enabled
export const realtimeConfigs: RealtimeConfig[] = [
  {
    table: 'class_instances',
    filter: 'status=in.(scheduled,active)',
    enabled: true,
    description: 'Live class schedule updates'
  },
  {
    table: 'class_registrations',
    enabled: true,
    description: 'Live booking updates'
  },
  {
    table: 'waitlists',
    enabled: true,
    description: 'Waitlist position changes'
  },
  {
    table: 'payments',
    filter: 'status=in.(pending,paid,failed)',
    enabled: true,
    description: 'Payment status updates'
  },
  {
    table: 'orders',
    filter: 'status=in.(pending,confirmed)',
    enabled: true,
    description: 'Order status changes'
  },
  {
    table: 'wallets',
    enabled: true,
    description: 'Wallet balance updates'
  },
  {
    table: 'organization_members',
    enabled: true,
    description: 'Team member changes'
  }
];

// =====================================================
// Realtime Event Types
// =====================================================

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeEvent<T = any> {
  eventType: RealtimeEventType;
  new: T;
  old: T;
  table: string;
  timestamp: string;
}

// =====================================================
// Realtime Subscription Manager
// =====================================================

export class RealtimeManager {
  private subscriptions: Map<string, any> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  // Subscribe to table changes
  subscribe<T = any>(
    table: string,
    callback: (event: RealtimeEvent<T>) => void,
    filter?: string,
    organizationId?: string
  ): string {
    const subscriptionKey = `${table}_${filter || 'all'}_${organizationId || 'global'}`;

    // Add callback to list
    if (!this.callbacks.has(subscriptionKey)) {
      this.callbacks.set(subscriptionKey, []);
    }
    this.callbacks.get(subscriptionKey)!.push(callback);

    // Create subscription if it doesn't exist
    if (!this.subscriptions.has(subscriptionKey)) {
      let channelName = `realtime:${table}`;
      if (organizationId) {
        channelName += `:org:${organizationId}`;
      }

      let subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter
          },
          (payload: RealtimePostgresChangesPayload<T>) => {
            const event: RealtimeEvent<T> = {
              eventType: payload.eventType as RealtimeEventType,
              new: payload.new as T,
              old: payload.old as T,
              table: table,
              timestamp: new Date().toISOString()
            };

            // Call all registered callbacks
            const callbacks = this.callbacks.get(subscriptionKey) || [];
            callbacks.forEach(cb => {
              try {
                cb(event);
              } catch (error) {
                console.error('Error in realtime callback:', error);
              }
            });
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionKey, subscription);
    }

    return subscriptionKey;
  }

  // Unsubscribe from table changes
  unsubscribe(subscriptionKey: string, callback?: Function): void {
    const callbacks = this.callbacks.get(subscriptionKey);
    if (callbacks && callback) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    // If no more callbacks, remove subscription
    if (!callbacks || callbacks.length === 0) {
      const subscription = this.subscriptions.get(subscriptionKey);
      if (subscription) {
        supabase.removeChannel(subscription);
        this.subscriptions.delete(subscriptionKey);
        this.callbacks.delete(subscriptionKey);
      }
    }
  }

  // Unsubscribe from all
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
    this.callbacks.clear();
  }

  // Get active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

// Global realtime manager instance
export const realtimeManager = new RealtimeManager();

// =====================================================
// React Hooks for Realtime
// =====================================================

import { useEffect, useRef } from 'react';

// Safe import for auth hook with fallback
let useMultiTenantAuth: any;
try {
  const authModule = require('../../components/auth/MultiTenantAuthProvider');
  useMultiTenantAuth = authModule.useMultiTenantAuth;
} catch (error) {
  // Fallback for when auth provider is not available
  useMultiTenantAuth = () => ({ currentOrg: null, currentUser: null });
}

// Hook for subscribing to table changes
export function useRealtimeSubscription<T = any>(
  table: string,
  callback: (event: RealtimeEvent<T>) => void,
  filter?: string,
  enabled: boolean = true
) {
  const { currentOrg } = useMultiTenantAuth();
  const subscriptionKeyRef = useRef<string | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !currentOrg?.id) {
      return;
    }

    // Subscribe with organization filter
    const orgFilter = filter 
      ? `${filter} AND organization_id=eq.${currentOrg.id}`
      : `organization_id=eq.${currentOrg.id}`;

    subscriptionKeyRef.current = realtimeManager.subscribe(
      table,
      (event: RealtimeEvent<T>) => {
        callbackRef.current(event);
      },
      orgFilter,
      currentOrg.id
    );

    return () => {
      if (subscriptionKeyRef.current) {
        realtimeManager.unsubscribe(subscriptionKeyRef.current, callbackRef.current);
      }
    };
  }, [table, filter, enabled, currentOrg?.id]);
}

// Hook for class schedule updates
export function useClassScheduleUpdates(
  callback: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription(
    'class_instances',
    callback,
    'status=in.(scheduled,active)',
    enabled
  );
}

// Hook for registration updates
export function useRegistrationUpdates(
  callback: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription('class_registrations', callback, undefined, enabled);
}

// Hook for waitlist updates
export function useWaitlistUpdates(
  callback: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription('waitlists', callback, undefined, enabled);
}

// Hook for payment updates
export function usePaymentUpdates(
  callback: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription(
    'payments',
    callback,
    'status=in.(pending,paid,failed)',
    enabled
  );
}

// Hook for wallet updates
export function useWalletUpdates(
  callback: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription('wallets', callback, undefined, enabled);
}

// =====================================================
// Realtime Event Helpers
// =====================================================

// Format realtime event for notifications
export function formatRealtimeNotification(event: RealtimeEvent): {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
} {
  const { eventType, table, new: newData, old: oldData } = event;

  switch (table) {
    case 'class_registrations':
      if (eventType === 'INSERT') {
        return {
          title: 'New Registration',
          message: `Someone registered for a class`,
          type: 'success'
        };
      } else if (eventType === 'UPDATE' && oldData?.status !== newData?.status) {
        return {
          title: 'Registration Updated',
          message: `Registration status changed to ${newData?.status}`,
          type: 'info'
        };
      }
      break;

    case 'waitlists':
      if (eventType === 'INSERT') {
        return {
          title: 'Waitlist Addition',
          message: `Someone joined the waitlist`,
          type: 'info'
        };
      }
      break;

    case 'payments':
      if (eventType === 'UPDATE' && oldData?.status !== newData?.status) {
        if (newData?.status === 'paid') {
          return {
            title: 'Payment Received',
            message: `Payment of CHF ${(newData?.amount_cents / 100).toFixed(2)} confirmed`,
            type: 'success'
          };
        } else if (newData?.status === 'failed') {
          return {
            title: 'Payment Failed',
            message: `Payment failed - please retry`,
            type: 'error'
          };
        }
      }
      break;

    case 'class_instances':
      if (eventType === 'UPDATE' && oldData?.status !== newData?.status) {
        return {
          title: 'Class Status Update',
          message: `Class status changed to ${newData?.status}`,
          type: 'info'
        };
      }
      break;
  }

  return {
    title: 'Update',
    message: `${table} was ${eventType.toLowerCase()}d`,
    type: 'info'
  };
}

// Check if event is relevant for current user
export function isEventRelevantForUser(
  event: RealtimeEvent,
  userId: string,
  userRole: string
): boolean {
  const { table, new: newData } = event;

  // Customers only see their own data
  if (userRole === 'customer') {
    switch (table) {
      case 'class_registrations':
      case 'waitlists':
      case 'wallets':
        return newData?.customer_id === userId;
      case 'payments':
      case 'orders':
        return newData?.customer_id === userId;
      default:
        return false;
    }
  }

  // Staff see organization data
  if (['owner', 'studio_manager', 'front_desk', 'instructor'].includes(userRole)) {
    return true;
  }

  return false;
}

// =====================================================
// Realtime Health Monitoring
// =====================================================

export interface RealtimeHealth {
  connected: boolean;
  subscriptions: number;
  lastEventAt?: string;
  errors: string[];
}

export function getRealtimeHealth(): RealtimeHealth {
  const subscriptions = realtimeManager.getActiveSubscriptions();
  
  return {
    connected: supabase.realtime.isConnected(),
    subscriptions: subscriptions.length,
    errors: [] // Would track connection errors in production
  };
}

// =====================================================
// Realtime Setup Function
// =====================================================

export async function initializeRealtimeForOrganization(
  organizationId: string,
  userRole: string
): Promise<void> {
  // Enable realtime for relevant tables based on user role
  const relevantConfigs = realtimeConfigs.filter(config => {
    if (userRole === 'customer') {
      return ['class_instances', 'class_registrations', 'waitlists', 'payments', 'wallets'].includes(config.table);
    }
    return config.enabled;
  });

  // This would be called when user logs in or switches organization
  console.log(`Initializing realtime for org ${organizationId} with role ${userRole}`);
  console.log('Relevant tables:', relevantConfigs.map(c => c.table));
}