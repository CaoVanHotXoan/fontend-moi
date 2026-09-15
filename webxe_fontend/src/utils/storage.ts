/**
 * Safe Client Storage Utility for Next.js SSR & Client State Persistence
 * Handles SSR (window check), JSON parse error recovery, and clean cleanup.
 */

export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
      return fallback;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      // JWT tokens are stored as plain strings, not JSON values.
      if (key === 'token') {
        return raw as T;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to parse key "${key}". Clearing corrupted value.`, error);
      this.removeItem(key);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
      return true;
    } catch (error) {
      console.error(`[SafeStorage] Failed to set key "${key}":`, error);
      return false;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[SafeStorage] Failed to remove key "${key}":`, error);
    }
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('profile');
      window.localStorage.removeItem('cart');
      window.localStorage.removeItem('savedVehicles');
    } catch (error) {
      console.error('[SafeStorage] Failed to clear app storage:', error);
    }
  },
};
