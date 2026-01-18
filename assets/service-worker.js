// Cache versioning: Use build-time version or commit ref for automatic cache invalidation
// Netlify provides COMMIT_REF, or we can use a timestamp-based version
// This ensures new deployments automatically invalidate old caches
const CACHE_VERSION = 'v4-debug-cleanup'; // Cache version for deployment
const CACHE_NAME = `freeprompt-cache-${CACHE_VERSION}`;

// Cache name for shared files (separate from app cache)
const SHARE_CACHE_NAME = 'freeprompt-share-target';
// URL prefix for cached shared files - used to identify them later
const SHARE_URL_PREFIX = '/shared-media/';

// BroadcastChannel for sending notifications to the app (Google Chrome sample pattern)
// This provides user feedback when files are being processed
const SHARE_CHANNEL_NAME = 'share-target-channel';
const broadcastChannel = 'BroadcastChannel' in self ? new BroadcastChannel(SHARE_CHANNEL_NAME) : null;

// Don't cache index.html or hashed assets - they change with each build
// The browser will cache hashed assets automatically (immutable headers)
// We only cache static assets that don't change
const urlsToCache = [
  '/favicon.png',
  // Don't cache hashed JS/CSS - they're cached by browser with immutable headers
];

self.addEventListener('install', (event) => {
  // Force the new service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Listen for skip waiting message from registration
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const requestPath = url.pathname;
  
  // Handle Web Share Target API POST requests ONLY
  // EXACT match + POST only - this prevents interfering with normal app assets
  if (event.request.method === 'POST' && (requestPath === '/share-target/' || requestPath === '/share-target')) {
    event.respondWith(handleShareTarget(event));
    return;
  }
  
  // Let ALL other fetches pass normally (don't intercept)
});

// Handle Web Share Target API POST requests
// Based on Google Chrome web-share sample pattern
// Store files in Cache API FIRST, then redirect. App reads from cache on load.
async function handleShareTarget(event) {
  try {
    // Notify app that we're processing a shared file
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SHARE_STARTED', message: 'Saving shared media...' });
    }
    
    const formData = await event.request.formData();
    const mediaFile = formData.get('photos'); // Matches manifest.json param name
    
    if (mediaFile && mediaFile instanceof File && mediaFile.name) {
      // Store the shared file in cache
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
      
      // Notify app that file was saved successfully
      if (broadcastChannel) {
        broadcastChannel.postMessage({ 
          type: 'SHARE_COMPLETE', 
          message: `Saved: ${mediaFile.name}`,
          filename: mediaFile.name,
          size: mediaFile.size,
          contentType: mediaFile.type
        });
      }
    } else {
      // No valid file found
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SHARE_ERROR', message: 'No valid file found in share data' });
      }
    }
    
    // Redirect to app - the app will check for shared files in cache on load
    return Response.redirect('/?share=true', 303);
  } catch (error) {
    console.error('SW: Error handling share target:', error);
    
    // Notify app of error
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SHARE_ERROR', message: `Error: ${error.message || error}` });
    }
    
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
  // Clean up old caches: delete all caches that don't match the current cache name
  // IMPORTANT: Keep the share cache (SHARE_CACHE_NAME) for share target functionality!
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old app caches, but KEEP the share cache!
          if (cacheName !== CACHE_NAME && cacheName !== SHARE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});