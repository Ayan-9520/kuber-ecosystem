import { createHash, randomBytes, randomInt } from 'crypto';

import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, '0');
}

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, BCRYPT_ROUNDS);
}

export async function compareSecret(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export function hashTokenSha256(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return createHash('sha256')
    .update(`${Date.now()}-${randomBytes(32).toString('hex')}`)
    .digest('hex');
}
