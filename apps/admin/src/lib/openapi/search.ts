import { API_MODULES } from './categories';
import type { OpenApiEndpoint, SearchResult } from './types';

import { GUIDE_INDEX } from '@/pages/api-docs/content/guides-index';

function scoreMatch(query: string, ...fields: (string | undefined)[]): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  let score = 0;
  for (const field of fields) {
    if (!field) continue;
    const f = field.toLowerCase();
    if (f === q) score += 100;
    else if (f.startsWith(q)) score += 60;
    else if (f.includes(q)) score += 30;
    else if (q.split(/\s+/).every((w) => f.includes(w))) score += 20;
  }
  return score;
}

export function searchApiDocs(
  query: string,
  endpoints: OpenApiEndpoint[],
  limit = 30,
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const ep of endpoints) {
    const score = scoreMatch(
      q,
      ep.path,
      ep.summary,
      ep.description,
      ep.method,
      ep.operationId,
      ep.tags.join(' '),
    );
    if (score > 0) {
      results.push({
        type: 'endpoint',
        id: ep.id,
        title: `${ep.method.toUpperCase()} ${ep.path}`,
        subtitle: ep.summary,
        path: `/developer-portal/api/reference/${ep.moduleId}/endpoint/${encodeURIComponent(ep.id)}`,
        score,
      });
    }
  }

  for (const mod of API_MODULES) {
    const score = scoreMatch(q, mod.name, mod.description, mod.id);
    if (score > 0) {
      results.push({
        type: 'module',
        id: mod.id,
        title: mod.name,
        subtitle: mod.description,
        path: `/developer-portal/api/reference/${mod.id}`,
        score: score - 5,
      });
    }
  }

  for (const guide of GUIDE_INDEX) {
    const score = scoreMatch(q, guide.title, guide.description, guide.keywords.join(' '));
    if (score > 0) {
      results.push({
        type: 'guide',
        id: guide.id,
        title: guide.title,
        subtitle: guide.description,
        path: guide.path,
        score: score - 3,
      });
    }
  }

  const errorCodes = ['400', '401', '403', '404', '409', '422', '429', '500'];
  for (const code of errorCodes) {
    if (code.includes(q) || q.includes(code)) {
      results.push({
        type: 'error',
        id: code,
        title: `HTTP ${code}`,
        subtitle: 'Error catalog entry',
        path: '/developer-portal/api/guides/errors',
        score: 25,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
