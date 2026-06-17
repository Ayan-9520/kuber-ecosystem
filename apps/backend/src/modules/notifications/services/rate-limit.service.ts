import { redisIncr } from '../../../config/redis.js';

const buckets = new Map<string, { count: number; resetAt: number }>();

function checkLocal(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export const rateLimitService = {
  /** @deprecated Prefer checkAsync for distributed rate limiting */
  check(key: string, limit: number, windowMs = 60_000): boolean {
    return checkLocal(key, limit, windowMs);
  },

  async checkAsync(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
    const redisKey = `rl:${key}`;
    const count = await redisIncr(redisKey, windowMs);
    if (count !== null) {
      return count <= limit;
    }
    return checkLocal(key, limit, windowMs);
  },
};
