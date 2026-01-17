// Cache versioning: Use build-time version or commit ref for automatic cache invalidation
// Netlify provides COMMIT_REF, or we can use a timestamp-based version
// This ensures new deployments automatically invalidate old caches
const CACHE_VERSION = 'v1'; // This will be replaced at build time with actual version
const CACHE_NAME = `freeprompt-cache-${CACHE_VERSION}`;

// Cache name for shared files (separate from app cache)
const SHARE_CACHE_NAME = 'freeprompt-share-target';
// URL prefix for cached shared files - used to identify them later
const SHARE_URL_PREFIX = '/shared-media/';

// Don't cache index.html - it changes with each build and contains asset hashes
// Caching it causes 404s when old HTML references new asset hashes
const urlsToCache = [
  '/favicon.png',
  '/images/logo-no-bg.png',
  // Add other static assets you want to cache
];

self.addEventListener('install', (event) => {
  // Force the new service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.warn('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Listen for skip waiting message from registration
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'PING') {
    // Respond to ping to confirm service worker is active
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: 'Service Worker is active and responding to PING',
          data: { state: 'active' }
        });
      }
    }).catch(() => {});
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const requestPath = url.pathname;
  
  // CRITICAL: Handle Web Share Target API POST requests ONLY
  // EXACT match + POST only - this prevents interfering with normal app assets
  // This must be checked FIRST before any other fetch handling
  if (event.request.method === 'POST' && requestPath === '/share-target/') {
    // MUST call respondWith to intercept the request immediately
    event.respondWith(handleShareTarget(event));
    return; // Exit early - don't process further
  }
  
  // Let ALL other fetches pass normally (don't intercept)
  // This prevents the service worker from interfering with asset loading
  // and avoids infinite redirect loops
});

// Handle Web Share Target API POST requests
// Based on Google Chrome web-share sample pattern:
// https://github.com/GoogleChrome/samples/blob/gh-pages/web-share/src/js/service-worker.js
// Key insight: Store files in Cache API FIRST, then redirect. App reads from cache on load.
async function handleShareTarget(event) {
  try {
    const formData = await event.request.formData();
    const mediaFile = formData.get('photos'); // Matches manifest.json param name
    
    if (mediaFile && mediaFile instanceof File && mediaFile.name) {
      // Store the shared file in cache (same pattern as Google Chrome sample)
      const cache = await caches.open(SHARE_CACHE_NAME);
      
      // Create a unique cache key using URL prefix + timestamp + filename
      const cacheKey = new URL(
        `${SHARE_URL_PREFIX}${Date.now()}-${mediaFile.name}`,
        self.location
      ).href;
      
      // Store file as a Response object in cache
      await cache.put(
        cacheKey,
        new Response(mediaFile, {
          headers: {
            'content-length': mediaFile.size,
            'content-type': mediaFile.type,
          },
        })
      );
      
      console.warn('SW: File stored in cache:', cacheKey);
    }
    
    // Redirect to app - the app will check for shared files in cache on load
    return Response.redirect('/?share=true', 303);
  } catch (error) {
    console.error('SW: Error handling share target:', error);
    // Redirect to app even on error
    return Response.redirect('/', 303);
  }
}

// Store share data in IndexedDB (not used - kept for potential future use)
async function _storeShareData(shareId, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShareTargetDB', 1);
    
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      // Fallback to sessionStorage if IndexedDB fails
      try {
        sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('shares')) {
        // Database not initialized, use sessionStorage fallback
        try {
          sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
          resolve();
        } catch (e) {
          reject(e);
        }
        return;
      }
      
      const transaction = db.transaction(['shares'], 'readwrite');
      const store = transaction.objectStore('shares');
      const putRequest = store.put(data, shareId);
      
      putRequest.onsuccess = () => {
        // Clean up old shares (older than 1 hour)
        const cleanupTransaction = db.transaction(['shares'], 'readwrite');
        const cleanupStore = cleanupTransaction.objectStore('shares');
        const cleanupRequest = cleanupStore.openCursor();
        
        cleanupRequest.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            if (data.timestamp - cursor.value.timestamp > 3600000) { // 1 hour
              cleanupStore.delete(cursor.primaryKey);
            }
            cursor.continue();
          }
        };
        
        resolve();
      };
      
      putRequest.onerror = () => {
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(`share_${shareId}`, JSON.stringify(data));
          resolve();
        } catch {
          reject(putRequest.error);
        }
      };
    };
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('shares')) {
        // Use shareId as the key directly (no keyPath needed)
        const objectStore = db.createObjectStore('shares');
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

self.addEventListener('activate', (event) => {
  // Send debug message
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'DEBUG_MESSAGE',
        prefix: 'SW',
        message: 'Service Worker activating...',
        data: { cacheName: CACHE_NAME }
      });
    }
  }).catch(() => {});
  
  // Clean up old caches: delete all caches that don't match the current cache name
  // This ensures new deployments automatically invalidate prior PWA caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches that don't match the current cache name
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim().then(() => {
        // Send confirmation
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'DEBUG_MESSAGE',
              prefix: 'SW',
              message: '✅ Service Worker activated and claimed clients',
              data: { clientsCount: clients.length }
            });
          }
        });
      });
    })
  );
});