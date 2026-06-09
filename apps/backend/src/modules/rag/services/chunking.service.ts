import { createHash } from 'node:crypto';

import { env } from '../../../config/env.js';
import type { ChunkResult } from '../types/rag.types.js';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export const chunkingService = {
  getConfig() {
    return {
      chunkSize: env.RAG_CHUNK_SIZE ?? 800,
      overlap: env.RAG_CHUNK_OVERLAP ?? 100,
    };
  },

  chunk(text: string, _version = 1): ChunkResult[] {
    const { chunkSize, overlap } = this.getConfig();
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    if (!cleaned) return [];

    const chunks: ChunkResult[] = [];
    let start = 0;
    let index = 0;

    while (start < cleaned.length) {
      const end = Math.min(start + chunkSize, cleaned.length);
      let sliceEnd = end;

      if (end < cleaned.length) {
        const breakAt = cleaned.lastIndexOf('\n', end);
        if (breakAt > start + chunkSize * 0.5) sliceEnd = breakAt;
      }

      const content = cleaned.slice(start, sliceEnd).trim();
      if (content.length > 0) {
        chunks.push({
          index,
          content,
          startOffset: start,
          endOffset: sliceEnd,
          tokenCount: estimateTokens(content),
        });
        index++;
      }

      if (sliceEnd >= cleaned.length) break;
      start = Math.max(sliceEnd - overlap, start + 1);
    }

    return chunks.map((c) => ({ ...c, index: c.index }));
  },

  contentHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  },

  extractText(sourceType: string, content: string, mimeType?: string): string {
    if (sourceType === 'HTML' || mimeType === 'text/html') {
      return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return content.trim();
  },
};
