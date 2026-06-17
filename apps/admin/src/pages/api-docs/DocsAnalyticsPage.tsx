import { BarChart3, Search, Eye, Download } from 'lucide-react';

import { Card, StatCard } from '@/components/ui';
import { getDocAnalytics, clearDocAnalytics } from '@/lib/openapi/analytics';

export function DocsAnalyticsPage() {
  const analytics = getDocAnalytics();
  const totalViews = analytics.pageViews.reduce((s, v) => s + v.count, 0);
  const totalEndpointViews = analytics.endpointViews.reduce((s, v) => s + v.count, 0);
  const totalSearches = analytics.searches.reduce((s, v) => s + v.count, 0);

  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>Documentation Analytics</h1>
        <p>Usage tracking for API documentation (stored locally in your browser).</p>
      </header>

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard label="Page Views" value={totalViews} icon={<Eye size={20} />} />
        <StatCard label="Endpoint Views" value={totalEndpointViews} icon={<BarChart3 size={20} />} />
        <StatCard label="Searches" value={totalSearches} icon={<Search size={20} />} />
        <StatCard label="Downloads" value={analytics.downloads.reduce((s, v) => s + v.count, 0)} icon={<Download size={20} />} />
      </div>

      <div className="grid-2">
        <Card title="Most Viewed Pages">
          {analytics.pageViews.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Page</th><th>Views</th></tr></thead>
              <tbody>
                {analytics.pageViews.slice(0, 10).map((v) => (
                  <tr key={v.key}><td><code>{v.key}</code></td><td>{v.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Most Viewed Endpoints">
          {analytics.endpointViews.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Endpoint</th><th>Views</th></tr></thead>
              <tbody>
                {analytics.endpointViews.slice(0, 10).map((v) => (
                  <tr key={v.key}><td>{v.label ?? v.key}</td><td>{v.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Top Search Queries">
          {analytics.searches.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No searches yet.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Query</th><th>Count</th></tr></thead>
              <tbody>
                {analytics.searches.slice(0, 10).map((v) => (
                  <tr key={v.key}><td>{v.key}</td><td>{v.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Downloads">
          {analytics.downloads.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No downloads yet.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Asset</th><th>Count</th></tr></thead>
              <tbody>
                {analytics.downloads.map((v) => (
                  <tr key={v.key}><td>{v.key}</td><td>{v.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <button type="button" className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={clearDocAnalytics}>
        Clear Analytics Data
      </button>
    </div>
  );
}
