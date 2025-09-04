import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { usePortal } from './PortalProvider';

interface RealTimeUpdatesProps {
  children: React.ReactNode;
}

export function RealTimeUpdates({ children }: RealTimeUpdatesProps) {
  const { currentLocation } = usePortal();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Using the imported supabase client directly

  useEffect(() => {
    // Set up real-time subscriptions for live updates
    const setupRealTimeSubscriptions = () => {
      // Subscribe to class updates
      const classesChannel = supabase
        .channel('classes-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'classes',
            filter: currentLocation ? `location=eq.${currentLocation.name}` : undefined
          }, 
          (payload) => {
            console.log('🔴 Real-time class update:', payload);
            setLastUpdate(new Date());
            
            // Trigger data refresh in PortalProvider
            window.dispatchEvent(new CustomEvent('yogaswiss-data-update', {
              detail: { type: 'classes', data: payload }
            }));
          }
        )
        .subscribe((status) => {
          console.log('📡 Classes subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });

      // Subscribe to booking updates (for availability changes)
      const bookingsChannel = supabase
        .channel('bookings-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'bookings' 
          }, 
          (payload) => {
            console.log('🔴 Real-time booking update:', payload);
            setLastUpdate(new Date());
            
            // Trigger availability refresh
            window.dispatchEvent(new CustomEvent('yogaswiss-availability-update', {
              detail: { type: 'bookings', data: payload }
            }));
          }
        )
        .subscribe();

      // Subscribe to instructor availability updates
      const availabilityChannel = supabase
        .channel('instructor-availability')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'instructor_availability' 
          }, 
          (payload) => {
            console.log('🔴 Real-time availability update:', payload);
            setLastUpdate(new Date());
            
            // Trigger instructor data refresh
            window.dispatchEvent(new CustomEvent('yogaswiss-instructor-update', {
              detail: { type: 'availability', data: payload }
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(classesChannel);
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(availabilityChannel);
      };
    };

    const cleanup = setupRealTimeSubscriptions();
    return cleanup;
  }, [currentLocation, supabase]);

  // Heartbeat to maintain connection
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (isConnected) {
        // Send a lightweight ping to maintain connection
        supabase.from('kv_store_f0b2daa4')
          .select('key')
          .limit(1)
          .then(() => {
            // Connection is alive
          })
          .catch(() => {
            setIsConnected(false);
          });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeat);
  }, [isConnected, supabase]);

  return (
    <>
      {children}
      

    </>
  );
}

// Hook for components to listen to real-time updates
export function useRealTimeUpdates() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateType, setUpdateType] = useState<string | null>(null);

  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      setLastUpdate(new Date());
      setUpdateType(event.detail.type);
      
      // Clear update type after 3 seconds
      setTimeout(() => setUpdateType(null), 3000);
    };

    window.addEventListener('yogaswiss-data-update', handleDataUpdate as EventListener);
    window.addEventListener('yogaswiss-availability-update', handleDataUpdate as EventListener);
    window.addEventListener('yogaswiss-instructor-update', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('yogaswiss-data-update', handleDataUpdate as EventListener);
      window.removeEventListener('yogaswiss-availability-update', handleDataUpdate as EventListener);
      window.removeEventListener('yogaswiss-instructor-update', handleDataUpdate as EventListener);
    };
  }, []);

  return { lastUpdate, updateType };
}