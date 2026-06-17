import Redis from 'ioredis';

import { logger } from '../shared/observability/logger.js';

import { env } from './env.js';

let client: Redis | null = null;
let connectAttempted = false;

export function isRedisEnabled(): boolean {
  return Boolean(env.REDIS_URL);
}

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    client.on('error', (err) => {
      logger.warn({ err }, 'Redis connection error');
    });
  }
  return client;
}

async function ensureConnected(redis: Redis): Promise<boolean> {
  if (redis.status === 'ready') return true;
  if (connectAttempted && redis.status === 'connecting') return false;
  try {
    connectAttempted = true;
    await redis.connect();
    return true;
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable, using in-memory fallback');
    return false;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis || !(await ensureConnected(redis))) return null;
  try {
    return redis.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !(await ensureConnected(redis))) return;
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    // fallback handled by caller
  }
}

export async function redisIncr(key: string, windowMs: number): Promise<number | null> {
  const redis = getRedisClient();
  if (!redis || !(await ensureConnected(redis))) return null;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }
    return count;
  } catch {
    return null;
  }
}

export async function redisDelByPrefix(prefix: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !(await ensureConnected(redis))) return;
  try {
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
      cursor = next;
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== '0');
  } catch {
    // ignore scan failures
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => client?.disconnect());
    client = null;
    connectAttempted = false;
  }
}
