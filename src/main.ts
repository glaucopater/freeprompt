import "./style.css";
import { updateHealthcheckStatusInterval, setupEvents } from "./setup.ts";
import { addDebugMessage } from "./utils/debug-panel.ts";

// IMMEDIATE DEBUG: Log URL and sessionStorage state at the very start
// This helps debug share target issues
console.warn('[SHARE DEBUG] Page loaded with URL:', window.location.href);
console.warn('[SHARE DEBUG] Search params:', window.location.search);
console.warn('[SHARE DEBUG] SessionStorage sharedContent:', sessionStorage.getItem('sharedContent') ? 'EXISTS' : 'EMPTY');
console.warn('[SHARE DEBUG] All sessionStorage keys:', Object.keys(sessionStorage));

// Also check localStorage in case it ended up there
console.warn('[SHARE DEBUG] All localStorage keys:', Object.keys(localStorage));

// ============================================
// VISIBLE DEBUG PANEL FOR MOBILE TESTING
// Shows debug info directly on the page
// ============================================
function showMobileDebug(message: string, data?: Record<string, unknown>) {
  let debugDiv = document.getElementById('mobile-debug-panel');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'mobile-debug-panel';
    debugDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      max-height: 50vh;
      overflow-y: auto;
      background: rgba(0,0,0,0.9);
      color: #0f0;
      font-family: monospace;
      font-size: 11px;
      padding: 8px;
      z-index: 999999;
      white-space: pre-wrap;
      word-break: break-all;
    `;
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X Close Debug';
    closeBtn.style.cssText = 'position:sticky;top:0;background:red;color:white;border:none;padding:4px 8px;margin-bottom:8px;';
    closeBtn.onclick = () => debugDiv?.remove();
    debugDiv.appendChild(closeBtn);
    debugDiv.appendChild(document.createElement('hr'));
    document.body.appendChild(debugDiv);
  }
  const line = document.createElement('div');
  line.style.borderBottom = '1px solid #333';
  line.style.paddingBottom = '4px';
  line.style.marginBottom = '4px';
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  line.textContent = `[${timestamp}] ${message}`;
  if (data) {
    line.textContent += '\n' + JSON.stringify(data, null, 2);
  }
  debugDiv.appendChild(line);
}

// Show initial page state
showMobileDebug('PAGE LOADED', {
  url: window.location.href,
  search: window.location.search,
  pathname: window.location.pathname,
  hasShareParam: window.location.search.includes('share'),
  sessionStorageKeys: Object.keys(sessionStorage),
  hasSharedContent: !!sessionStorage.getItem('sharedContent')
});

// Check caches immediately
if ('caches' in window) {
  caches.keys().then(names => {
    showMobileDebug('CACHE NAMES', { caches: names });
    // Check share cache specifically
    caches.open('freeprompt-share-target').then(cache => {
      cache.keys().then(keys => {
        showMobileDebug('SHARE CACHE CONTENTS', { 
          count: keys.length,
          urls: keys.map(k => k.url)
        });
      });
    });
  });
}

// Expose showMobileDebug globally for use elsewhere
(window as unknown as { showMobileDebug: typeof showMobileDebug }).showMobileDebug = showMobileDebug;

// Wait for DOM to be ready before initializing debug panel
// The debug panel needs document.body to exist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addDebugMessage('APP', 'Main script loading...', {
      url: window.location.href,
      search: window.location.search,
      hasSessionStorage: !!sessionStorage.getItem('sharedContent')
    });
  });
} else {
  // DOM already loaded
  addDebugMessage('APP', 'Main script loading...', {
    url: window.location.href,
    search: window.location.search,
    hasSessionStorage: !!sessionStorage.getItem('sharedContent')
  });
}

// Debug: Check service worker registration status
if ('serviceWorker' in navigator) {
  // Listen for service worker registration events
  window.addEventListener('sw-registered', (event: Event) => {
    const customEvent = event as CustomEvent;
    const registration = customEvent.detail;
    addDebugMessage('APP', 'Service Worker registered', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting
    });
  });
  
  window.addEventListener('sw-activated', () => {
    addDebugMessage('APP', '✅ Service Worker activated');
  });
  
  window.addEventListener('sw-error', (event: Event) => {
    const customEvent = event as CustomEvent;
    addDebugMessage('APP', '❌ Service Worker registration failed', { error: String(customEvent.detail) });
  });
  
  navigator.serviceWorker.ready.then(registration => {
    addDebugMessage('APP', 'Service Worker ready', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting
    });
  }).catch(err => {
    addDebugMessage('APP', 'Service Worker not ready', { error: String(err) });
  });
  
  // Check if service worker is controlling the page
  if (navigator.serviceWorker.controller) {
    addDebugMessage('APP', 'Service Worker is controlling page', {
      scriptURL: navigator.serviceWorker.controller.scriptURL,
      state: navigator.serviceWorker.controller.state
    });
  } else {
    addDebugMessage('APP', '⚠️ Service Worker is NOT controlling page');
  }
  
  // Monitor service worker controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    addDebugMessage('APP', 'Service Worker controller changed', {
      hasController: !!navigator.serviceWorker.controller
    });
  });
  
  // Ping service worker to confirm it's active
  setTimeout(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'PING' });
      addDebugMessage('APP', 'Sent PING to service worker');
    } else {
      addDebugMessage('APP', '⚠️ Cannot ping service worker - no controller');
    }
  }, 1000);
  
  // Check URL for share target indicators
  const currentUrl = window.location.href;
  if (currentUrl.includes('share-target') || currentUrl.includes('shareId')) {
    addDebugMessage('APP', 'Share target URL detected', { url: currentUrl });
  }
}

import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";
import { Footer } from "./components/Footer.ts";
import { Status } from "./components/Status.ts";
import { Header } from "./components/Header.ts";
import { VisionExperiment } from "./components/VideoExperiment.ts";
import { UploadFilesCard } from "./components/UploadImageCard.ts";
import { UploadProgressModal } from "./components/UploadProgressModal.ts";
import { GenerateMediaCard } from "./components/GenerateMediaCard.ts";

const isMediaGeneratorEnabled =
  import.meta.env.VITE_ENABLE_MEDIA_GENERATOR === "true";

const mediaGeneratorTab = isMediaGeneratorEnabled
  ? `
 <li class="nav-item" role="presentation">
    <button class="nav-link" id="generate-tab" data-bs-toggle="tab" data-bs-target="#generate-tab-pane" type="button" role="tab" aria-controls="generate-tab-pane" aria-selected="false">Generate Image</button>
 </li>`
  : "";

const mediaGeneratorContent = isMediaGeneratorEnabled
  ? `<div class="tab-pane" id="generate-tab-pane" role="tabpanel" aria-labelledby="generate-tab" tabindex="0">'
    ${GenerateMediaCard()}
  </div>`
  : "";

function renderShareTargetContent() {
  return `
    <div class="container mt-4">
      <h2>Content Received</h2>
      <p>Your shared content has been received and is being processed.</p>
      <p>Please check the Netlify Function logs for details.</p>
    </div>
  `;
}

// Helper function to convert base64 to Blob
function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

const appDiv = document.querySelector<HTMLDivElement>("#app")!;

// Render the main app structure first
appDiv.innerHTML = `
  <div class="min-vh-100 d-flex flex-column">
    ${Header(logo)}
    <div class="container mt-4">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="analyze-tab" data-bs-toggle="tab" data-bs-target="#analyze-tab-pane" type="button" role="tab" aria-controls="analyze-tab-pane" aria-selected="true">Analyze Media</button>
        </li>
         ${mediaGeneratorTab}           
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane show active" id="analyze-tab-pane" role="tabpanel" aria-labelledby="analyze-tab" tabindex="0">
          ${VisionExperiment(UploadFilesCard(UploadProgressModal()))}
        </div>
        ${mediaGeneratorContent}      
      </div>
    </div>

    ${Status()}
    ${Footer(appDetails)}
  </div>
`;

// Handle shared content after the DOM is rendered
const urlParams = new URLSearchParams(window.location.search);
const shareId = urlParams.get("shareId");

// Interface for share data structure
interface ShareFileData {
  base64: string;
  filename: string;
  mimetype: string;
  size: number;
  type: 'image' | 'audio' | 'unknown';
}

interface ShareData {
  file: ShareFileData | null;
  text: string | null;
  title: string | null;
  url: string | null;
  timestamp: number;
}

// Function to retrieve share data from IndexedDB or sessionStorage
async function getShareData(shareId: string): Promise<ShareData | null> {
  addDebugMessage('APP', `getShareData: ${shareId}`);
  // Try IndexedDB first
  return new Promise((resolve) => {
    const request = indexedDB.open('ShareTargetDB', 1);
    
    request.onsuccess = () => {
      addDebugMessage('APP', 'IndexedDB opened');
      const db = request.result;
      if (db.objectStoreNames.contains('shares')) {
        const transaction = db.transaction(['shares'], 'readonly');
        const store = transaction.objectStore('shares');
        const getRequest = store.get(shareId);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const resultInfo = {
              hasFile: !!getRequest.result.file,
              fileName: getRequest.result.file?.filename || 'N/A'
            };
            addDebugMessage('APP', '✅ Data found in IndexedDB', resultInfo);
            // Delete after retrieval
            const deleteTransaction = db.transaction(['shares'], 'readwrite');
            const deleteStore = deleteTransaction.objectStore('shares');
            deleteStore.delete(shareId);
            resolve(getRequest.result);
            return;
          }
          addDebugMessage('APP', '❌ No data in IndexedDB');
          // Fallback to sessionStorage
          try {
            const sessionData = sessionStorage.getItem(`share_${shareId}`);
            if (sessionData) {
              addDebugMessage('APP', 'Data found in sessionStorage');
              sessionStorage.removeItem(`share_${shareId}`);
              resolve(JSON.parse(sessionData));
              return;
            }
            addDebugMessage('APP', 'No data in sessionStorage either');
          } catch (e) {
            addDebugMessage('APP', `Failed to read from sessionStorage: ${String(e)}`);
          }
          addDebugMessage('APP', 'Resolving with null - no share data found');
          resolve(null);
        };
        
        getRequest.onerror = () => {
          // Fallback to sessionStorage
          try {
            const sessionData = sessionStorage.getItem(`share_${shareId}`);
            if (sessionData) {
              addDebugMessage('APP', 'Data found in sessionStorage (onerror)');
              sessionStorage.removeItem(`share_${shareId}`);
              resolve(JSON.parse(sessionData));
              return;
            }
            addDebugMessage('APP', 'No data in sessionStorage (onerror)');
          } catch (e) {
            addDebugMessage('APP', `Failed to read from sessionStorage (onerror): ${String(e)}`);
          }
          addDebugMessage('APP', 'Resolving with null (onerror)');
          resolve(null);
        };
      } else {
        // Fallback to sessionStorage
        try {
          const sessionData = sessionStorage.getItem(`share_${shareId}`);
          if (sessionData) {
            addDebugMessage('APP', 'Data found in sessionStorage (no object store)');
            sessionStorage.removeItem(`share_${shareId}`);
            resolve(JSON.parse(sessionData));
            return;
          }
          addDebugMessage('APP', 'No data in sessionStorage (no object store)');
        } catch (e) {
          addDebugMessage('APP', `Failed to read from sessionStorage (no object store): ${String(e)}`);
        }
        addDebugMessage('APP', 'Resolving with null (no object store)');
        resolve(null);
      }
    };
    
    request.onerror = () => {
      // Fallback to sessionStorage
      try {
        const sessionData = sessionStorage.getItem(`share_${shareId}`);
        if (sessionData) {
          addDebugMessage('APP', 'Data found in sessionStorage (open error)');
          sessionStorage.removeItem(`share_${shareId}`);
          resolve(JSON.parse(sessionData));
          return;
        }
        addDebugMessage('APP', 'No data in sessionStorage (open error)');
      } catch (e) {
        addDebugMessage('APP', `Failed to read from sessionStorage (open error): ${String(e)}`);
      }
      addDebugMessage('APP', 'Resolving with null (open error)');
      resolve(null);
    };
    
    request.onupgradeneeded = () => {
      // Database not initialized, try sessionStorage
      try {
        const sessionData = sessionStorage.getItem(`share_${shareId}`);
        if (sessionData) {
          addDebugMessage('APP', 'Data found in sessionStorage (upgrade needed)');
          sessionStorage.removeItem(`share_${shareId}`);
          resolve(JSON.parse(sessionData));
          return;
        }
        addDebugMessage('APP', 'No data in sessionStorage (upgrade needed)');
      } catch (e) {
        addDebugMessage('APP', `Failed to read from sessionStorage (upgrade needed): ${String(e)}`);
      }
      addDebugMessage('APP', 'Resolving with null (upgrade needed)');
      resolve(null);
    };
  });
}

// Function to process shared file
function processSharedFile(fileData: ShareFileData) {
  if (!fileData) {
    addDebugMessage('APP', 'processSharedFile: no data');
    return;
  }
  
  const fileInfo = {
    filename: fileData.filename,
    type: fileData.type,
    mimetype: fileData.mimetype,
    size: fileData.size
  };
  addDebugMessage('APP', 'processSharedFile called', fileInfo);
  
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (!fileInput) {
    console.error("[APP] File input element not found.");
    addDebugMessage('APP', 'ERROR: File input not found');
    return;
  }
  
  addDebugMessage('APP', 'Converting base64 to blob...');
  const blob = b64toBlob(fileData.base64, fileData.mimetype);
  const file = new File([blob], fileData.filename, { type: fileData.mimetype });
  
  addDebugMessage('APP', 'Adding file to input...');
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  
  addDebugMessage('APP', 'Dispatching change event...');
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  addDebugMessage('APP', `✅ File added successfully: ${fileData.filename}`);
}

// Handle shareId from service worker (new robust method)
if (shareId) {
  addDebugMessage('APP', `ShareId detected: ${shareId}`);
  getShareData(shareId).then((shareData) => {
    const shareInfo = {
      hasData: !!shareData,
      hasFile: !!(shareData && shareData.file),
      fileName: shareData?.file?.filename || 'N/A',
      fileType: shareData?.file?.type || 'N/A'
    };
    addDebugMessage('APP', 'Retrieved share data', shareInfo);
    if (shareData && shareData.file) {
      addDebugMessage('APP', `Processing file: ${shareData.file.filename}`);
      processSharedFile(shareData.file);
    } else {
      addDebugMessage('APP', 'No file data found in share data');
    }
    // Clean up URL
    history.replaceState({}, document.title, window.location.pathname);
  }).catch((error) => {
    console.error('[APP] Error retrieving share data:', error);
    addDebugMessage('APP', `Error: ${error.message || String(error)}`);
  });
}

// Legacy support: Handle shared content from URL parameters (for backward compatibility)
const sharedImageBase64 = urlParams.get("sharedImage");
const sharedFilename = urlParams.get("filename");
const sharedMimetype = urlParams.get("mimetype");

const sharedAudioBase64 = urlParams.get("sharedAudio");
const sharedAudioFilename = urlParams.get("filename"); // Filename is generic
const sharedAudioMimetype = urlParams.get("mimetype"); // Mimetype is generic

if (sharedImageBase64 && sharedFilename && sharedMimetype) {
  console.warn("Shared image detected in URL parameters.");
  const imageBlob = b64toBlob(sharedImageBase64, sharedMimetype);
  const imageFile = new File([imageBlob], sharedFilename, { type: sharedMimetype });

  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(imageFile);
    fileInput.files = dataTransfer.files;

    // Dispatch a change event to trigger existing listeners
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.warn("Shared image programmatically added to file input.");
  } else {
    console.error("File input element not found.");
  }
  // Clean up the URL after processing
  history.replaceState({}, document.title, window.location.pathname);
} else if (sharedAudioBase64 && sharedAudioFilename && sharedAudioMimetype) {
  console.warn("Shared audio detected in URL parameters.");
  const audioBlob = b64toBlob(sharedAudioBase64, sharedAudioMimetype);
  const audioFile = new File([audioBlob], sharedAudioFilename, { type: sharedAudioMimetype });

  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(audioFile);
    fileInput.files = dataTransfer.files;

    // Dispatch a change event to trigger existing listeners
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.warn("Shared audio programmatically added to file input.");
  } else {
    console.error("File input element not found.");
  }
  // Clean up the URL after processing
  history.replaceState({}, document.title, window.location.pathname);
} else if (window.location.pathname === "/share-target/") {
  // This block handles the case where the share target was hit, but no sharedImage/Audio param was found
  // (e.g., if the Netlify function redirected without an image/audio, or if it was a text share)
  appDiv.innerHTML = `
    <div class="min-vh-100 d-flex flex-column">
      ${Header(logo)}
      ${renderShareTargetContent()}
      ${Status()}
      ${Footer(appDetails)}
    </div>
  `;
  history.replaceState({}, document.title, "/");
}


// Log page layout info on load to help debug layout issues
import { inspectPageLayout } from './utils/browser-logger.ts';
window.addEventListener('load', () => {
  const layout = inspectPageLayout();
  // Layout inspection for debugging (silent in production)
  if (import.meta.env.DEV) {
    console.warn('Page layout info:', layout);
  }
  
  // Check if html has 0 height (common issue)
  if (layout.html && typeof layout.html === 'object' && 'dimensions' in layout.html) {
    const htmlDims = layout.html.dimensions as { height?: string };
    if (htmlDims?.height === '0px') {
      console.warn('⚠️ HTML element has height 0px - this may cause layout issues');
    }
  }
});

// Constants for share target (must match service-worker.js)
const SHARE_CACHE_NAME = 'freeprompt-share-target';
const SHARE_URL_PREFIX = '/shared-media/';

// Check for shared files in cache (Google Chrome sample pattern)
// This is called when the app loads with ?share=true query parameter
async function checkForSharedFiles() {
  console.warn('[SHARE DEBUG] checkForSharedFiles called');
  showMobileDebug('checkForSharedFiles called');
  addDebugMessage('APP', 'Checking for shared files in cache...');
  
  try {
    // First, list all caches to see what exists
    const allCacheNames = await caches.keys();
    console.warn('[SHARE DEBUG] All cache names:', allCacheNames);
    showMobileDebug('All caches', { names: allCacheNames });
    
    const cache = await caches.open(SHARE_CACHE_NAME);
    const keys = await cache.keys();
    
    console.warn('[SHARE DEBUG] Share cache keys:', keys.map(r => r.url));
    showMobileDebug('Share cache contents', { 
      count: keys.length,
      urls: keys.map(r => r.url)
    });
    addDebugMessage('APP', `Found ${keys.length} items in share cache`);
    
    // Find entries with our share URL prefix
    const sharedFileKeys = keys.filter(request => 
      request.url.includes(SHARE_URL_PREFIX)
    );
    
    if (sharedFileKeys.length === 0) {
      addDebugMessage('APP', 'No shared files found in cache');
      return;
    }
    
    addDebugMessage('APP', `Found ${sharedFileKeys.length} shared files`);
    
    // Process the most recent shared file (last one)
    const mostRecentKey = sharedFileKeys[sharedFileKeys.length - 1];
    const response = await cache.match(mostRecentKey);
    
    if (response) {
      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Extract filename from cache key URL
      const urlParts = mostRecentKey.url.split('/');
      const filenameWithTimestamp = urlParts[urlParts.length - 1];
      // Remove timestamp prefix (format: timestamp-filename)
      const filename = filenameWithTimestamp.replace(/^\d+-/, '') || 'shared-file';
      
      const file = new File([blob], filename, { type: contentType });
      
      addDebugMessage('APP', `Retrieved shared file: ${filename} (${file.size} bytes, ${contentType})`);
      
      // Add file to input
      const addFileToInput = () => {
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          addDebugMessage('APP', `✅ Shared file added to input: ${filename}`);
        } else {
          // Retry if file input not found yet
          setTimeout(addFileToInput, 100);
        }
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addFileToInput);
      } else {
        addFileToInput();
      }
      
      // Clean up: delete processed file from cache
      await cache.delete(mostRecentKey);
      addDebugMessage('APP', 'Cleaned up shared file from cache');
    }
    
    // Clean up URL (remove ?share=true)
    if (window.location.search.includes('share=true')) {
      history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addDebugMessage('APP', `❌ Error checking shared files: ${errorMessage}`);
  }
}

// Check for shared files from sessionStorage (Netlify function fallback)
// The Netlify function stores file in sessionStorage when SW isn't installed
function checkSessionStorageForSharedFiles() {
  console.warn('[SHARE DEBUG] checkSessionStorageForSharedFiles called');
  showMobileDebug('checkSessionStorageForSharedFiles called');
  addDebugMessage('APP', 'Checking sessionStorage for shared files...');
  
  try {
    const sharedContentStr = sessionStorage.getItem('sharedContent');
    console.warn('[SHARE DEBUG] sessionStorage sharedContent:', sharedContentStr ? `Found (${sharedContentStr.length} chars)` : 'NOT FOUND');
    showMobileDebug('sessionStorage.sharedContent', { 
      exists: !!sharedContentStr,
      length: sharedContentStr?.length || 0
    });
    
    if (!sharedContentStr) {
      addDebugMessage('APP', 'No shared content in sessionStorage');
      showMobileDebug('❌ No sharedContent in sessionStorage');
      return false;
    }
    
    const sharedContent = JSON.parse(sharedContentStr);
    addDebugMessage('APP', 'Found shared content in sessionStorage', {
      filename: sharedContent.filename,
      type: sharedContent.type,
      mimetype: sharedContent.mimetype,
      size: sharedContent.base64?.length || 0
    });
    
    // Remove from sessionStorage immediately to prevent re-processing
    sessionStorage.removeItem('sharedContent');
    
    if (sharedContent.base64 && sharedContent.filename && sharedContent.mimetype) {
      // Convert base64 to File and add to input
      const addFileToInput = () => {
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) {
          const blob = b64toBlob(sharedContent.base64, sharedContent.mimetype);
          const file = new File([blob], sharedContent.filename, { type: sharedContent.mimetype });
          
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          addDebugMessage('APP', `✅ Shared file from sessionStorage added: ${sharedContent.filename}`);
        } else {
          // Retry if file input not found yet
          setTimeout(addFileToInput, 100);
        }
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addFileToInput);
      } else {
        addFileToInput();
      }
      
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addDebugMessage('APP', `❌ Error reading sessionStorage: ${errorMessage}`);
  }
  
  return false;
}

// Check for shared files on page load
// Service worker redirects to /?share=true, Netlify function redirects to /?shared=true
const hasShareParam = window.location.search.includes('share=true') || window.location.search.includes('shared=true');

console.warn('[SHARE DEBUG] hasShareParam:', hasShareParam, 'search:', window.location.search);
showMobileDebug('SHARE PARAM CHECK', { 
  hasShareParam, 
  search: window.location.search,
  includes_share: window.location.search.includes('share')
});

if (hasShareParam) {
  showMobileDebug('✅ SHARE PARAM DETECTED - Starting file check...');
  console.warn('[SHARE DEBUG] Share param detected! Checking for shared files...');
  addDebugMessage('APP', 'Share redirect detected', { url: window.location.search });
  
  // First, check sessionStorage (from Netlify function fallback)
  showMobileDebug('Checking sessionStorage...');
  const foundInSessionStorage = checkSessionStorageForSharedFiles();
  showMobileDebug('SessionStorage result', { found: foundInSessionStorage });
  
  if (!foundInSessionStorage) {
    // If not in sessionStorage, check Cache Storage (from service worker)
    showMobileDebug('Not in sessionStorage, checking Cache Storage...');
    addDebugMessage('APP', 'Not in sessionStorage, checking Cache Storage...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        showMobileDebug('SW ready, calling checkForSharedFiles...');
        checkForSharedFiles();
      }).catch((err) => {
        showMobileDebug('SW not ready, trying anyway...', { error: String(err) });
        // Try anyway even if service worker isn't ready
        checkForSharedFiles();
      });
    } else {
      showMobileDebug('No SW support, calling checkForSharedFiles...');
      checkForSharedFiles();
    }
  } else {
    showMobileDebug('✅ Found in sessionStorage!');
    // Clean up URL
    if (window.location.search) {
      history.replaceState({}, document.title, window.location.pathname);
    }
  }
} else {
  showMobileDebug('❌ NO share param in URL');
}

// Set up BroadcastChannel listener for share target notifications
// This matches the channel used by the service worker
const SHARE_CHANNEL_NAME = 'share-target-channel';
if ('BroadcastChannel' in window) {
  const shareChannel = new BroadcastChannel(SHARE_CHANNEL_NAME);
  shareChannel.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type) {
      switch (data.type) {
        case 'SHARE_STARTED':
          addDebugMessage('SW', '📥 ' + (data.message || 'Processing shared content...'));
          break;
        case 'SHARE_COMPLETE':
          addDebugMessage('SW', '✅ ' + (data.message || 'Share complete'), {
            filename: data.filename,
            size: data.size,
            contentType: data.contentType
          });
          break;
        case 'SHARE_ERROR':
          addDebugMessage('SW', '❌ ' + (data.message || 'Share error'));
          break;
        default:
          addDebugMessage('SW', 'Share channel message', data);
      }
    }
  });
  addDebugMessage('APP', 'BroadcastChannel listener set up for share notifications');
}

// Also set up message listener for debug messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DEBUG_MESSAGE') {
      addDebugMessage(event.data.prefix || 'SW', event.data.message, event.data.data);
    }
  });
}

// Also listen for window messages (for compatibility)
window.addEventListener('message', (event) => {
  // Handle debug messages from service worker
  if (event.data && event.data.type === 'DEBUG_MESSAGE') {
    addDebugMessage(event.data.prefix || 'SW', event.data.message, event.data.data);
    return;
  }
  
  // Process SHARED_CONTENT messages (fallback for window messages)
  if (event.data && event.data.type === 'SHARED_CONTENT') {
    addDebugMessage('APP', 'SHARED_CONTENT received via window message', { 
      hasFile: !!(event.data.file),
      hasText: !!event.data.text 
    });
    // The navigator.serviceWorker message handler above will handle the actual processing
  }
});
setupEvents();
updateHealthcheckStatusInterval();