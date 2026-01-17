// Cache versioning: Use build-time version or commit ref for automatic cache invalidation
// Netlify provides COMMIT_REF, or we can use a timestamp-based version
// This ensures new deployments automatically invalidate old caches
const CACHE_VERSION = 'v1'; // This will be replaced at build time with actual version
const CACHE_NAME = `freeprompt-cache-${CACHE_VERSION}`;

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
  const requestOrigin = url.origin;
  const requestPath = url.pathname;
  
  // CRITICAL: Handle Web Share Target API POST requests FIRST
  // This must be checked before ANY other handlers, including Netlify function checks
  // The path might be '/share-target/' or '/share-target' (with or without trailing slash)
  if (event.request.method === 'POST' && (requestPath === '/share-target/' || requestPath === '/share-target')) {
    // Send debug message immediately
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: '✅ Share target POST intercepted!',
          data: { path: requestPath, url: event.request.url, resultingClientId: event.resultingClientId }
        });
      }
    }).catch(() => {});
    // MUST call respondWith to intercept the request
    event.respondWith(handleShareTarget(event));
    return; // Exit early - don't process further
  }
  
  // Debug: Log ALL POST requests to see what's happening
  if (event.request.method === 'POST') {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: `POST request detected: ${requestPath}`,
          data: { 
            method: event.request.method,
            path: requestPath,
            origin: requestOrigin,
            url: event.request.url,
            mode: event.request.mode,
            credentials: event.request.credentials,
            intercepted: false
          }
        });
      }
    }).catch(() => {});
  }
  
  // Skip Netlify function calls - they should never be cached
  if (requestPath.startsWith('/.netlify/functions/')) {
    return;
  }
  
  // Get the service worker's origin from registration scope
  // Fallback: try self.location.origin, or extract from registration scope
  let serviceWorkerOrigin;
  try {
    // Try to get origin from registration scope
    if (self.registration && self.registration.scope) {
      const scopeUrl = new URL(self.registration.scope);
      serviceWorkerOrigin = scopeUrl.origin;
    } else if (self.location) {
      serviceWorkerOrigin = self.location.origin;
    }
  } catch {
    // If we can't determine origin, be conservative and only handle relative URLs
    serviceWorkerOrigin = null;
  }
  
  // Only intercept same-origin requests
  // Skip external CDN requests, API calls, and other cross-origin resources
  if (serviceWorkerOrigin && requestOrigin !== serviceWorkerOrigin) {
    // Let the browser handle external requests normally
    return;
  }
  
  // Only intercept navigation requests (HTML pages)
  // Let the browser handle all asset requests (JS, CSS, images, etc.) directly
  // This prevents the service worker from interfering with asset loading
  const isNavigationRequest = event.request.mode === 'navigate' || 
                              requestPath === '/' || 
                              requestPath === '/index.html';
  
  if (!isNavigationRequest) {
    // Don't intercept asset requests - let browser handle them directly
    return;
  }

  // Network-first strategy for navigation requests (HTML pages)
  // This ensures we always get the latest HTML with correct asset hashes
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch((_error) => {
        // Fallback to cache only if network fails completely
        return caches.match(event.request);
      })
  );
});

// Handle Web Share Target API POST requests
async function handleShareTarget(event) {
  try {
    const formData = await event.request.formData();
    const file = formData.get('photos'); // Matches manifest.json param name
    const text = formData.get('text');
    const title = formData.get('title');
    const urlParam = formData.get('url');
    
    // Get the client that will receive the response (the new window opened by share target)
    // Use event.resultingClientId if available, otherwise fall back to matching all clients
    let targetClient = null;
    if (event.resultingClientId) {
      try {
        targetClient = await self.clients.get(event.resultingClientId);
        if (targetClient) {
          targetClient.postMessage({
            type: 'DEBUG_MESSAGE',
            prefix: 'SW',
            message: 'Found client via resultingClientId',
            data: { resultingClientId: event.resultingClientId }
          });
        }
      } catch {
        // If we can't get the specific client, try to match all clients
        const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        if (allClients.length > 0) {
          targetClient = allClients[0];
          targetClient.postMessage({
            type: 'DEBUG_MESSAGE',
            prefix: 'SW',
            message: 'Fallback: using first available client',
            data: { clientsCount: allClients.length }
          });
        }
      }
    } else {
      // Fallback: get any available client
      const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      if (allClients.length > 0) {
        targetClient = allClients[0];
        targetClient.postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: 'No resultingClientId, using first available client',
          data: { clientsCount: allClients.length }
        });
      }
    }
    
    // Send debug message about form data
    if (targetClient) {
      targetClient.postMessage({
        type: 'DEBUG_MESSAGE',
        prefix: 'SW',
        message: 'Form data received',
        data: {
          hasFile: !!file,
          fileType: file instanceof File ? file.type : 'not a file',
          fileName: file instanceof File ? file.name : 'N/A',
          fileSize: file instanceof File ? file.size : 0,
          text: text || 'none',
          title: title || 'none',
          url: urlParam || 'none'
        }
      });
    }
    
    // Forward file object directly to the app window via postMessage
    // File objects CAN be transferred via postMessage (they're supported by structured clone)
    if (targetClient && file && file instanceof File) {
      try {
        // Send the File object directly - it can be transferred via postMessage
        targetClient.postMessage({
          type: 'SHARED_CONTENT',
          file: file, // File object passes fully via structured clone
          text: text || null,
          title: title || null,
          url: urlParam || null
        });
        
        targetClient.postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: `✅ File forwarded to app: ${file.name} (${file.size} bytes)`,
          data: { fileName: file.name, fileSize: file.size, fileType: file.type }
        });
      } catch (e) {
        // If File object can't be transferred, log error
        // e is used in the error message below
        if (targetClient) {
          targetClient.postMessage({
            type: 'DEBUG_MESSAGE',
            prefix: 'SW',
            message: `❌ Error forwarding file: ${e.message || String(e)}`,
            data: { error: e.message || String(e) }
          });
        }
      }
    } else if (targetClient && (text || title || urlParam)) {
      // Text-only share
      targetClient.postMessage({
        type: 'SHARED_CONTENT',
        file: null,
        text: text || null,
        title: title || null,
        url: urlParam || null
      });
      
      targetClient.postMessage({
        type: 'DEBUG_MESSAGE',
        prefix: 'SW',
        message: 'Text-only share forwarded to app',
        data: { text: text || 'none', title: title || 'none' }
      });
    } else {
      // No client available or no data
      if (targetClient) {
        targetClient.postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: '⚠️ No file or text data to forward',
          data: { hasFile: !!file, hasText: !!text, hasClient: !!targetClient }
        });
      }
    }
    
    // Redirect to app (this opens the app window)
    const redirectUrl = new URL('/', self.location.origin);
    if (targetClient) {
      targetClient.postMessage({
        type: 'DEBUG_MESSAGE',
        prefix: 'SW',
        message: `Redirecting to: ${redirectUrl.toString()}`,
        data: { redirectUrl: redirectUrl.toString() }
      });
    }
    
    return Response.redirect(redirectUrl.toString(), 303);
  } catch (error) {
    console.error('Error handling share target:', error);
    // Try to send error to client
    try {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'DEBUG_MESSAGE',
          prefix: 'SW',
          message: `❌ Error handling share target: ${error.message || String(error)}`,
          data: { error: error.message || String(error) }
        });
      }
    } catch {
      // Ignore
    }
    // Redirect to app even on error
    return Response.redirect(new URL('/', self.location.origin).toString(), 303);
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