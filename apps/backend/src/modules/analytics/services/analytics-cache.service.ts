import { redisDelByPrefix, redisGet, redisSet } from '../../../config/redis.js';

const store = new Map<string, { expiresAt: number; value: unknown }>();

function getLocal<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setLocal(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export const analyticsCacheService = {
  get<T>(key: string): T | undefined {
    return getLocal<T>(key);
  },

  set(key: string, value: unknown, ttlMs: number): void {
    setLocal(key, value, ttlMs);
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    void redisSet(`cache:${key}`, JSON.stringify(value), ttlSeconds);
  },

  async getAsync<T>(key: string): Promise<T | undefined> {
    const local = getLocal<T>(key);
    if (local !== undefined) return local;

    const raw = await redisGet(`cache:${key}`);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },

  invalidate(prefix?: string): void {
    if (!prefix) {
      store.clear();
      void redisDelByPrefix('cache:');
      return;
    }
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
    void redisDelByPrefix(`cache:${prefix}`);
  },
};
