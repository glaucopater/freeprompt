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
// Based on Google Chrome web-share sample pattern
async function handleShareTarget(event) {
  const url = new URL(event.request.url);
  
  try {
    // Extract form data
    const formData = await event.request.formData();
    const file = formData.get('photos'); // Matches manifest.json param name
    const text = formData.get('text');
    const title = formData.get('title');
    const urlParam = formData.get('url');
    
    // Wait for client to be available with retry logic
    // When PWA opens from share, the client might not be ready immediately
    let targetClient = null;
    const maxRetries = 10;
    const retryDelay = 100; // 100ms between retries
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Try resultingClientId first (most reliable when available)
      if (event.resultingClientId) {
        try {
          targetClient = await self.clients.get(event.resultingClientId);
          if (targetClient) {
            break; // Found client, exit retry loop
          }
        } catch {
          // Client not available yet, continue to fallback
        }
      }
      
      // Fallback: try to match all clients
      const allClients = await self.clients.matchAll({ 
        includeUncontrolled: true, 
        type: 'window' 
      });
      
      if (allClients.length > 0) {
        targetClient = allClients[0];
        break; // Found client, exit retry loop
      }
      
      // If no client found, wait and retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
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
        
        // Wait a bit to ensure message is sent before redirect
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (targetClient) {
          targetClient.postMessage({
            type: 'DEBUG_MESSAGE',
            prefix: 'SW',
            message: `✅ File forwarded to app: ${file.name} (${file.size} bytes)`,
            data: { fileName: file.name, fileSize: file.size, fileType: file.type }
          });
        }
      } catch (e) {
        // If File object can't be transferred, try cache API as fallback
        if (targetClient) {
          targetClient.postMessage({
            type: 'DEBUG_MESSAGE',
            prefix: 'SW',
            message: `❌ Error forwarding file via postMessage, trying cache fallback: ${e.message || String(e)}`,
            data: { error: e.message || String(e) }
          });
        }
        
        // Fallback: Store in cache and notify client to retrieve
        try {
          const cache = await caches.open('share-target-cache');
          const blob = await file.arrayBuffer();
          await cache.put(`share-file-${Date.now()}`, new Response(blob, {
            headers: { 'Content-Type': file.type }
          }));
          
          if (targetClient) {
            targetClient.postMessage({
              type: 'SHARED_CONTENT',
              file: null, // File not in message, use cache instead
              fileCacheKey: `share-file-${Date.now()}`,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              text: text || null,
              title: title || null,
              url: urlParam || null
            });
          }
        } catch (cacheError) {
          // Cache also failed, send error
          if (targetClient) {
            targetClient.postMessage({
              type: 'DEBUG_MESSAGE',
              prefix: 'SW',
              message: `❌ Cache fallback also failed: ${cacheError.message || String(cacheError)}`,
              data: { error: cacheError.message || String(cacheError) }
            });
          }
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
    // Use absolute URL to avoid redirect loops
    // Wait a bit more to ensure messages are processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const redirectUrl = new URL('/', url.origin);
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
    // Use absolute URL to avoid redirect loops
    return Response.redirect(new URL('/', url.origin).toString(), 303);
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