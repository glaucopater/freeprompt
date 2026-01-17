/**
 * Browser-side logging utility to capture console errors and resource failures
 * Logs are written to localStorage and can be retrieved for debugging
 */

interface LogEntry {
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  data?: unknown;
  url?: string;
  line?: number;
  col?: number;
}

const MAX_LOGS = 100;
const LOG_STORAGE_KEY = 'freeprompt-debug-logs';

function saveLog(entry: LogEntry): void {
  try {
    const existing = localStorage.getItem(LOG_STORAGE_KEY);
    const logs: LogEntry[] = existing ? JSON.parse(existing) : [];
    logs.push(entry);
    // Keep only the last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    // Silently fail if localStorage is not available
    console.warn('Failed to save log to localStorage:', error);
  }
}

export function initBrowserLogger(): void {
  // Capture console errors
  const originalError = console.error;
  console.error = function (...args: unknown[]) {
    saveLog({
      timestamp: Date.now(),
      level: 'error',
      message: args.map(arg => String(arg)).join(' '),
      data: args.length > 1 ? args.slice(1) : undefined,
    });
    originalError.apply(console, args);
  };

  // Capture console warnings
  const originalWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    saveLog({
      timestamp: Date.now(),
      level: 'warn',
      message: args.map(arg => String(arg)).join(' '),
      data: args.length > 1 ? args.slice(1) : undefined,
    });
    originalWarn.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    saveLog({
      timestamp: Date.now(),
      level: 'error',
      message: event.message || 'Unhandled error',
      url: event.filename,
      line: event.lineno,
      col: event.colno,
      data: {
        error: event.error?.toString(),
        stack: event.error?.stack,
      },
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    saveLog({
      timestamp: Date.now(),
      level: 'error',
      message: 'Unhandled promise rejection',
      data: {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      },
    });
  });

  // Capture resource load failures
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as HTMLElement).tagName) {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      let resourceUrl: string | undefined;
      
      if (tagName === 'SCRIPT' || tagName === 'IMG') {
        resourceUrl = (target as HTMLScriptElement | HTMLImageElement).src;
      } else if (tagName === 'LINK') {
        resourceUrl = (target as HTMLLinkElement).href;
      }
      
      if (resourceUrl) {
        saveLog({
          timestamp: Date.now(),
          level: 'error',
          message: `Failed to load resource: ${tagName}`,
          url: resourceUrl,
          data: {
            tagName,
            id: target.id,
            className: target.className,
          },
        });
      }
    }
  }, true); // Use capture phase to catch all errors

  console.warn('Browser logger initialized. Use getBrowserLogs() to retrieve logs.');
}

export function getBrowserLogs(): LogEntry[] {
  try {
    const logs = localStorage.getItem(LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

export function clearBrowserLogs(): void {
  try {
    localStorage.removeItem(LOG_STORAGE_KEY);
    console.warn('Browser logs cleared');
  } catch {
    // Silently fail
  }
}

export function exportBrowserLogs(): string {
  const logs = getBrowserLogs();
  return JSON.stringify(logs, null, 2);
}

export function inspectElement(selector: string): Record<string, unknown> {
  const element = document.querySelector(selector);
  if (!element) {
    return { error: `Element not found: ${selector}` };
  }

  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return {
    selector,
    tagName: element.tagName,
    id: element.id,
    className: element.className,
    dimensions: {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      top: `${rect.top}px`,
      left: `${rect.left}px`,
    },
    computedStyles: {
      display: styles.display,
      position: styles.position,
      height: styles.height,
      minHeight: styles.minHeight,
      maxHeight: styles.maxHeight,
      width: styles.width,
      minWidth: styles.minWidth,
      maxWidth: styles.maxWidth,
      overflow: styles.overflow,
      visibility: styles.visibility,
    },
    children: Array.from(element.children).map(child => ({
      tagName: child.tagName,
      id: child.id,
      className: child.className,
    })),
  };
}

export function inspectPageLayout(): Record<string, unknown> {
  return {
    html: inspectElement('html'),
    body: inspectElement('body'),
    app: inspectElement('#app'),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    document: {
      readyState: document.readyState,
      bodyHeight: document.body.scrollHeight,
      bodyOffsetHeight: document.body.offsetHeight,
      bodyClientHeight: document.body.clientHeight,
    },
  };
}

// Make it available globally for easy access in console
if (typeof window !== 'undefined') {
  const globalWindow = window as unknown as {
    getBrowserLogs: typeof getBrowserLogs;
    clearBrowserLogs: typeof clearBrowserLogs;
    exportBrowserLogs: typeof exportBrowserLogs;
    inspectElement: typeof inspectElement;
    inspectPageLayout: typeof inspectPageLayout;
  };
  globalWindow.getBrowserLogs = getBrowserLogs;
  globalWindow.clearBrowserLogs = clearBrowserLogs;
  globalWindow.exportBrowserLogs = exportBrowserLogs;
  globalWindow.inspectElement = inspectElement;
  globalWindow.inspectPageLayout = inspectPageLayout;
}
