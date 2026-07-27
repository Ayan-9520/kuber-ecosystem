import { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Clapperboard,
  Download,
  GraduationCap,
  Kanban,
  LifeBuoy,
  MessageSquareText,
  Palette,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, PageHeader, StatCard, StatusBadge } from '@/components/ui';
import {
  ACADEMY_DASHBOARD_STATS,
  ACADEMY_LEVELS,
  ACADEMY_MODULES,
  type AcademyModuleId,
} from '@/features/academy/data/academy';

const MODULE_ICONS: Record<AcademyModuleId, typeof BookOpen> = {
  learning: BookOpen,
  certifications: Award,
  downloads: Download,
  crm: Kanban,
  marketing: Palette,
  scripts: MessageSquareText,
  videos: Clapperboard,
  ai: Sparkles,
  community: Users,
  leaderboard: Trophy,
  support: LifeBuoy,
  profile: UserRound,
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'modules', label: 'All Modules' },
  { id: 'roadmap', label: 'Learning Roadmap' },
  { id: 'learners', label: 'Partner Progress' },
] as const;

const DEMO_LEARNERS = [
  { name: 'Ananya Mehra', city: 'Gurugram', level: 'L2 Home Loan', progress: 72, tier: 'Silver' },
  { name: 'Rohit Khanna', city: 'Delhi', level: 'L3 LAP', progress: 35, tier: 'Bronze' },
  { name: 'Sana Qureshi', city: 'Noida', level: 'L1 Foundation', progress: 100, tier: 'Bronze' },
  { name: 'Vikram Shah', city: 'Jaipur', level: 'L2 Home Loan', progress: 48, tier: 'Bronze' },
];

export function PartnerAcademyPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview');
  const stats = ACADEMY_DASHBOARD_STATS;

  const activeModules = useMemo(
    () => ACADEMY_MODULES.filter((m) => m.status === 'Active').length,
    [],
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Partner Academy"
        subtitle="Unified learning OS for Kuber Financial Partners — courses, CRM training, marketing toolkit, AI and certifications"
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/partners')}>
            View Partners
          </button>
        }
      />

      <div className="stat-grid">
        <StatCard label="Enrolled Partners" value={stats.enrolledPartners} icon={<GraduationCap size={20} />} />
        <StatCard label="Active Learners" value={stats.activeLearners} icon={<BookOpen size={20} />} />
        <StatCard label="Certificates Issued" value={stats.certificatesIssued} icon={<Award size={20} />} />
        <StatCard label="Avg Progress" value={`${stats.avgProgressPercent}%`} icon={<Trophy size={20} />} />
        <StatCard label="Active Modules" value={activeModules} icon={<Kanban size={20} />} />
        <StatCard label="Webinars (month)" value={stats.webinarsThisMonth} icon={<Users size={20} />} />
      </div>

      <div className="flex flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          <Card title="Suggested features (activated)">
            <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.7 }}>
              <li>Learning roadmap (10 levels) with progress tracking</li>
              <li>Certifications Bronze → Diamond</li>
              <li>CRM Training for KuberOne pipeline</li>
              <li>Marketing Toolkit + Sales Scripts</li>
              <li>Video Library + AI Assistant</li>
              <li>Community, Leaderboard, Support, Profile</li>
            </ul>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', opacity: 0.75 }}>
              Top module this week: <strong>{stats.topModule}</strong>
            </p>
          </Card>
          <Card title="How partners access Academy">
            <ol style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.7 }}>
              <li>KuberOne DSA app → Home → Academy</li>
              <li>Profile → Partner Academy</li>
              <li>Website Partner Academy (marketing + preview)</li>
            </ol>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', opacity: 0.75 }}>
              Completing certifications can sync to partner branding badges (Academy Certified).
            </p>
          </Card>
        </div>
      )}

      {tab === 'modules' && (
        <div className="stat-grid">
          {ACADEMY_MODULES.map((mod) => {
            const Icon = MODULE_ICONS[mod.id];
            return (
              <Card key={mod.id} title={mod.title}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Icon size={20} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>{mod.description}</p>
                    <div style={{ marginTop: '0.5rem' }}>
                      <StatusBadge status={mod.status === 'Active' ? 'ACTIVE' : 'PENDING'} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'roadmap' && (
        <Card title="Learning Roadmap (Levels 1–10)">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {ACADEMY_LEVELS.map((level) => (
              <div
                key={level.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3rem 1fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <strong>L{level.id}</strong>
                <div>
                  <div style={{ fontWeight: 600 }}>{level.title}</div>
                  <div
                    style={{
                      marginTop: 6,
                      height: 8,
                      borderRadius: 999,
                      background: 'var(--color-border, #e2e8f0)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${level.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0d6b57, #00c389)',
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{level.certificate}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'learners' && (
        <Card title="Partner learning progress (sample)">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Partner</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Current level</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Progress</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tier</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_LEARNERS.map((row) => (
                  <tr key={row.name}>
                    <td style={{ padding: '0.5rem' }}>
                      <strong>{row.name}</strong>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{row.city}</div>
                    </td>
                    <td style={{ padding: '0.5rem' }}>{row.level}</td>
                    <td style={{ padding: '0.5rem' }}>{row.progress}%</td>
                    <td style={{ padding: '0.5rem' }}>{row.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
