import { createHash } from 'node:crypto';

import type { EmbeddingProvider } from '../../types/rag.types.js';

const DIMENSIONS = 384;

function hashToVector(text: string, dims: number): number[] {
  const vec = new Array<number>(dims).fill(0);
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    const hash = createHash('sha256').update(token).digest();
    for (let i = 0; i < dims; i++) {
      const byte = hash[i % hash.length] ?? 0;
      vec[i] = (vec[i] ?? 0) + (byte / 255 - 0.5);
    }
  }

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export const localHashEmbeddingProvider: EmbeddingProvider = {
  name: 'LOCAL_HASH',
  model: 'local-hash-v1',
  dimensions: DIMENSIONS,

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => hashToVector(t, DIMENSIONS));
  },
};
