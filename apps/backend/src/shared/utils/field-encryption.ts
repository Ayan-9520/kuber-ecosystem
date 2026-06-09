import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

import { env } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const secret = env.DATA_ENCRYPTION_KEY ?? env.JWT_ACCESS_SECRET;
  if (env.NODE_ENV === 'production' && !env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY is required in production');
  }
  return createHash('sha256').update(secret).digest();
}

export function encryptField(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptField(cipherText: string): string {
  const [ivHex, tagHex, dataHex] = cipherText.split(':');
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error('Invalid encrypted field format');
  }
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function maskPan(pan: string): string {
  return `${pan.slice(0, 3)}XXXXX${pan.slice(-1)}`;
}

export function maskAadhaar(aadhaar: string): string {
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}
