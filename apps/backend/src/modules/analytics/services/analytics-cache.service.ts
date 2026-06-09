const store = new Map<string, { expiresAt: number; value: unknown }>();

export const analyticsCacheService = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },

  set(key: string, value: unknown, ttlMs: number): void {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  invalidate(prefix?: string): void {
    if (!prefix) {
      store.clear();
      return;
    }
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },
};
