import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  installPrompt: PWAInstallPrompt | null;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    installPrompt: null,
    updateAvailable: false,
    registration: null
  });

  const { toast } = useToast();

  // Check if app is installable
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e as any
      }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
      
      toast({
        title: 'App Installed',
        description: 'Explore Sensei has been installed on your device'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored'
      });
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: 'You\'re Offline',
        description: 'Some features may not be available',
        variant: 'destructive'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setPwaState(prev => ({ ...prev, registration }));
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, updateAvailable: true }));
                  toast({
                    title: 'Update Available',
                    description: 'A new version of the app is available',
                    action: (
                      <button onClick={() => updateApp()}>
                        Update
                      </button>
                    )
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [toast]);

  // Install app
  const installApp = useCallback(async () => {
    if (!pwaState.installPrompt) return;

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: 'Installing App',
          description: 'Explore Sensei is being installed...'
        });
      }
    } catch (error) {
      console.error('Failed to install app:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install the app',
        variant: 'destructive'
      });
    }
  }, [pwaState.installPrompt, toast]);

  // Update app
  const updateApp = useCallback(() => {
    if (pwaState.registration?.waiting) {
      pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [pwaState.registration]);

  // Share content
  const shareContent = useCallback(async (data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        toast({
          title: 'Content Shared',
          description: 'Content has been shared successfully'
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          toast({
            title: 'Share Failed',
            description: 'Failed to share content',
            variant: 'destructive'
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        toast({
          title: 'Link Copied',
          description: 'Link has been copied to clipboard'
        });
      }
    }
  }, [toast]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications Not Supported',
        description: 'This browser does not support notifications',
        variant: 'destructive'
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: 'Notifications Blocked',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive'
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [toast]);

  // Send notification
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    if (pwaState.registration) {
      pwaState.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    } else {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options
      });
    }
  }, [pwaState.registration, requestNotificationPermission]);

  // Get device info
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      isStandalone: pwaState.isStandalone,
      isInstalled: pwaState.isInstalled
    };
  }, [pwaState.isStandalone, pwaState.isInstalled]);

  // Add to home screen (iOS)
  const addToHomeScreen = useCallback(() => {
    toast({
      title: 'Add to Home Screen',
      description: 'Tap the share button and select "Add to Home Screen"',
      duration: 5000
    });
  }, [toast]);

  // Check if running on iOS
  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Check if running on Android
  const isAndroid = useCallback(() => {
    return /Android/.test(navigator.userAgent);
  }, []);

  // Check if running on mobile
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return null;
  }, []);

  // Request persistent storage
  const requestPersistentStorage = useCallback(async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        if (persistent) {
          toast({
            title: 'Storage Granted',
            description: 'Persistent storage has been granted'
          });
        } else {
          toast({
            title: 'Storage Denied',
            description: 'Persistent storage was not granted',
            variant: 'destructive'
          });
        }
        return persistent;
      } catch (error) {
        console.error('Failed to request persistent storage:', error);
        return false;
      }
    }
    return false;
  }, [toast]);

  // Get storage quota
  const getStorageQuota = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota! - estimate.usage!
        };
      } catch (error) {
        console.error('Failed to get storage quota:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    ...pwaState,
    installApp,
    updateApp,
    shareContent,
    sendNotification,
    requestNotificationPermission,
    getDeviceInfo,
    addToHomeScreen,
    isIOS,
    isAndroid,
    isMobile,
    getConnectionInfo,
    requestPersistentStorage,
    getStorageQuota
  };
};
