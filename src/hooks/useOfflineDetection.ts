import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);

  // Check Supabase connection on mount and when online status changes
  useEffect(() => {
    const checkConnection = async () => {
      if (navigator.onLine) {
        try {
          const connected = await checkSupabaseConnection();
          setIsSupabaseConnected(connected);
          if (!connected) {
            console.warn('Supabase connection check failed');
          }
        } catch (error) {
          console.error('Error checking Supabase connection:', error);
          setIsSupabaseConnected(false);
        }
      } else {
        setIsSupabaseConnected(false);
      }
    };

    checkConnection();
    
    // Recheck connection periodically when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Check Supabase connection when coming back online
      try {
        const connected = await checkSupabaseConnection();
        setIsSupabaseConnected(connected);
        if (connected) {
          toast.success('Connection restored');
        } else {
          toast.warning('Online but Supabase connection unavailable');
        }
      } catch (error) {
        setIsSupabaseConnected(false);
        toast.warning('Online but connection check failed');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSupabaseConnected(false);
      toast.error('You are offline. Some features may not be available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Return true if offline (for isOffline usage)
  // This means: return true when NOT online OR when Supabase is not connected
  return !isOnline || !isSupabaseConnected;
};
