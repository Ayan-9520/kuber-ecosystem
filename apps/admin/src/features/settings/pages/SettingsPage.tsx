import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { PageHeader, Tabs, TableSkeleton } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { fieldStr } from '@/lib/utils';
import { settingsService } from '@/services';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';

type TabId = 'appearance' | 'system' | 'security' | 'notification' | 'ai';

const TABS: { id: TabId; label: string; category?: string }[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'system', label: 'System', category: 'system' },
  { id: 'security', label: 'Security', category: 'security' },
  { id: 'notification', label: 'Notification', category: 'notification' },
  { id: 'ai', label: 'AI', category: 'ai' },
];

export function SettingsPage() {
  const [tab, setTab] = useState<TabId>('appearance');
  const category = TABS.find((t) => t.id === tab)?.category ?? 'system';

  const { data, isLoading } = useQuery({
    queryKey: ['settings', category],
    queryFn: () => settingsService.list({ category, limit: 100 }),
    enabled: tab !== 'appearance',
  });

  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    return items.reduce<Record<string, Record<string, unknown>[]>>((acc, item) => {
      const key = fieldStr(item, 'key').split('.')[0] || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [data]);

  return (
    <div className="page-container">
      <PageHeader title="Settings" subtitle="System, security, notification, and AI configuration" />

      <Tabs tabs={TABS.map(({ id, label }) => ({ id, label }))} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'appearance' && (
        <Card title="Theme" className="detail-section">
          <p className="page-subtitle">
            Choose light, dark, or system theme. Your preference is saved and applied across the CRM.
          </p>
          <ThemeSwitcher />
        </Card>
      )}

      {tab !== 'appearance' && isLoading ? (
        <TableSkeleton rows={6} cols={2} />
      ) : tab !== 'appearance' && (data?.items?.length ?? 0) === 0 ? (
        <Card title={`${TABS.find((t) => t.id === tab)?.label} Settings`}>
          <p className="page-subtitle">No settings found for this category.</p>
        </Card>
      ) : tab !== 'appearance' ? (
        Object.entries(grouped).map(([group, items]) => (
          <Card key={group} title={group} className="detail-section">
            <div className="info-grid">
              {items.map((item) => (
                <div key={String(item.id)}>
                  <div className="info-item-label">{fieldStr(item, 'key')}</div>
                  <div className="info-item-value">
                    <pre
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                      }}
                    >
                      {typeof item.value === 'object'
                        ? JSON.stringify(item.value, null, 2)
                        : String(item.value ?? '—')}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      ) : null}
    </div>
  );
}
