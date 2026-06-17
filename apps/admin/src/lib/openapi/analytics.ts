import type { DocAnalyticsEvent } from './types';

const STORAGE_KEY = 'kuberone_doc_analytics';
const MAX_EVENTS = 2000;

function readEvents(): DocAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocAnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: DocAnalyticsEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
}

export function trackDocEvent(
  type: DocAnalyticsEvent['type'],
  key: string,
  label?: string,
): void {
  const events = readEvents();
  events.push({ type, key, label, timestamp: Date.now() });
  writeEvents(events);
}

export function getDocAnalytics(): {
  pageViews: Array<{ key: string; label?: string; count: number }>;
  endpointViews: Array<{ key: string; label?: string; count: number }>;
  searches: Array<{ key: string; count: number }>;
  downloads: Array<{ key: string; count: number }>;
} {
  const events = readEvents();
  const countBy = (type: DocAnalyticsEvent['type']) => {
    const map = new Map<string, { label?: string; count: number }>();
    for (const e of events.filter((x) => x.type === type)) {
      const cur = map.get(e.key) ?? { label: e.label, count: 0 };
      cur.count += 1;
      if (e.label) cur.label = e.label;
      map.set(e.key, cur);
    }
    return [...map.entries()]
      .map(([key, v]) => ({ key, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    pageViews: countBy('page_view'),
    endpointViews: countBy('endpoint_view'),
    searches: countBy('search').map(({ key, count }) => ({ key, count })),
    downloads: countBy('download').map(({ key, count }) => ({ key, count })),
  };
}

export function clearDocAnalytics(): void {
  localStorage.removeItem(STORAGE_KEY);
}
