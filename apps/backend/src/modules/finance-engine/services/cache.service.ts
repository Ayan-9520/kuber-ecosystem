import { CACHE_TTL_MS } from '../constants/finance-engine.constants.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const financeCacheService = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  delete(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },
};
