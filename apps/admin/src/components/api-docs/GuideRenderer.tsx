import { CodeBlock } from './CodeBlock';

import type { GuideSection } from '@/pages/api-docs/content/guide-content';


interface GuideRendererProps {
  sections: GuideSection[];
}

export function GuideRenderer({ sections }: GuideRendererProps) {
  return (
    <div className="api-guide-content">
      {sections.map((section) => (
        <article key={section.id} id={section.id} className="api-guide-section">
          <h2>{section.title}</h2>
          {section.body
            ? section.body.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))
            : null}
          {section.code ? (
            <CodeBlock code={section.code} language={section.language} />
          ) : null}
        </article>
      ))}
    </div>
  );
}
