import { GuideRenderer } from '@/components/api-docs';
import type { GuideSection } from '@/pages/api-docs/content/guide-content';

interface GuidePageProps {
  title: string;
  subtitle: string;
  sections: GuideSection[];
}

export function GuidePage({ title, subtitle, sections }: GuidePageProps) {
  return (
    <div className="api-docs-page">
      <header className="api-docs-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <GuideRenderer sections={sections} />
    </div>
  );
}
