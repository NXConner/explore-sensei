// Service Worker for Explore Sensei PWA
const CACHE_NAME = 'explore-sensei-v1.0.0';
const STATIC_CACHE_NAME = 'explore-sensei-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'explore-sensei-dynamic-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache (align with Supabase REST and ML API)
const SUPABASE_HOST_MATCH = /https:\/\/[^.]+\.supabase\.co\//;
const API_CACHE_PATTERNS = [
  /\/api\/jobs/,
  /\/api\/time-entries/,
  /\/api\/vehicles/,
  /\/api\/invoices/,
  /\/api\/weather/,
  /\/api\/route-optimization/,
  SUPABASE_HOST_MATCH, // Supabase REST (tables, auth)
  /\/functions\/v1\//, // Supabase Edge Functions
  /:\/\/.*:\\d{2,5}\/$/.source // placeholder; will not match
];

// Install event - cache static assets
// Gate verbose logging to development only
(function(){
  try {
    const host = (self && self.location && self.location.hostname) || '';
    const isDev = host === 'localhost' || host === '127.0.0.1';
    const originalLog = console.log;
    const originalDebug = console.debug || console.log;
    const originalInfo = console.info || console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    console.log = (...args) => { if (isDev) originalLog.apply(console, args); };
    console.debug = (...args) => { if (isDev) originalDebug.apply(console, args); };
    console.info = (...args) => { if (isDev) originalInfo.apply(console, args); };
    console.warn = (...args) => { if (isDev) originalWarn.apply(console, args); };
    // keep errors visible in all envs
    console.error = (...args) => { originalError.apply(console, args); };
  } catch (_) {}
})();

self.addEventListener('install', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        // eslint-disable-next-line no-console
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              // eslint-disable-next-line no-console
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(url.href) || pattern.test(url.pathname);
    return false;
  });
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle static assets - cache first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error handling static asset', error);
    return new Response('Offline - Static asset not available', { status: 503 });
  }
}

// Handle API requests - network first with cache fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Service Worker: Network failed, trying cache for API request');
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests - cache first with network fallback
async function handleNavigationRequest(request) {
  try {
    // SPA fallback: serve index.html from network first to avoid stale routes
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.error('Service Worker: Error handling navigation request', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Explore Sensei - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #000; 
              color: #fff; 
            }
            .offline-message { 
              max-width: 400px; 
              margin: 0 auto; 
            }
            .icon { 
              font-size: 4rem; 
              margin-bottom: 1rem; 
            }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <div class="icon">📱</div>
            <h1>Explore Sensei</h1>
            <p>You're currently offline. Some features may not be available.</p>
            <p>Please check your internet connection and try again.</p>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle other requests - network first
async function handleOtherRequest(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return response;
  } catch (error) {
    console.error('Service Worker: Error handling other request', error);
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'time-entry-sync') {
    event.waitUntil(syncTimeEntries());
  } else if (event.tag === 'fleet-location-sync') {
    event.waitUntil(syncFleetLocations());
  } else if (event.tag === 'weather-data-sync') {
    event.waitUntil(syncWeatherData());
  }
});

// Sync time entries when back online
async function syncTimeEntries() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const timeEntryRequests = requests.filter(req => 
      req.url.includes('/api/time-entries') && req.method === 'POST'
    );
    
    for (const request of timeEntryRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
        // eslint-disable-next-line no-console
        console.log('Service Worker: Synced time entry');
      } catch (error) {
        console.error('Service Worker: Failed to sync time entry', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing time entries', error);
  }
}

// Sync fleet locations when back online
async function syncFleetLocations() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const fleetRequests = requests.filter(req => 
      req.url.includes('/api/vehicles') && req.method === 'PUT'
    );
    
    for (const request of fleetRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
        // eslint-disable-next-line no-console
        console.log('Service Worker: Synced fleet location');
      } catch (error) {
        console.error('Service Worker: Failed to sync fleet location', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing fleet locations', error);
  }
}

// Sync weather data when back online
async function syncWeatherData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const weatherRequests = requests.filter(req => 
      req.url.includes('/api/weather')
    );
    
    for (const request of weatherRequests) {
      try {
        await fetch(request);
        // eslint-disable-next-line no-console
        console.log('Service Worker: Synced weather data');
      } catch (error) {
        console.error('Service Worker: Failed to sync weather data', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing weather data', error);
  }
}

// Push notifications for important updates
self.addEventListener('push', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/explore-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Explore Sensei', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  // eslint-disable-next-line no-console
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'weather-update') {
    event.waitUntil(updateWeatherData());
  } else if (event.tag === 'fleet-location-update') {
    event.waitUntil(updateFleetLocations());
  }
});

// Update weather data periodically
async function updateWeatherData() {
  try {
    const response = await fetch('/api/weather/update');
    if (response.ok) {
      // eslint-disable-next-line no-console
      console.log('Service Worker: Weather data updated');
    }
  } catch (error) {
    console.error('Service Worker: Failed to update weather data', error);
  }
}

// Update fleet locations periodically
async function updateFleetLocations() {
  try {
    const response = await fetch('/api/fleet/locations/update');
    if (response.ok) {
      // eslint-disable-next-line no-console
      console.log('Service Worker: Fleet locations updated');
    }
  } catch (error) {
    console.error('Service Worker: Failed to update fleet locations', error);
  }
}
