// Centralized debug configuration
// Enable debug mode via VITE_ENABLE_DEBUG=true in .env

/**
 * Debug mode flag - controls all debug UI and verbose logging
 * Set VITE_ENABLE_DEBUG=true in your .env file to enable
 */
export const DEBUG_ENABLED = import.meta.env.VITE_ENABLE_DEBUG === 'true';

/**
 * Debug log - only logs when DEBUG_ENABLED is true
 */
export function debugLog(prefix: string, message: string, data?: unknown) {
  if (!DEBUG_ENABLED) return;
  
  if (data) {
    console.warn(`[${prefix}] ${message}`, data);
  } else {
    console.warn(`[${prefix}] ${message}`);
  }
}

/**
 * Debug error - only logs when DEBUG_ENABLED is true
 */
export function debugError(prefix: string, message: string, error?: unknown) {
  if (!DEBUG_ENABLED) return;
  
  console.error(`[${prefix}] ${message}`, error);
}
