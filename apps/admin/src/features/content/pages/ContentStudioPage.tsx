import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, Card, LoadingSpinner, PageHeader } from '@/components/ui';
import { fieldStr } from '@/lib/utils';
import { contentService } from '@/services/content.service';

import '../content.css';

const CONTENT_TYPES = [
  'EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'CAMPAIGN', 'SALES_SCRIPT', 'CALL_SCRIPT',
  'FOLLOW_UP', 'SUPPORT_RESPONSE', 'KNOWLEDGE_ARTICLE', 'FAQ', 'ONBOARDING', 'SOCIAL_MEDIA',
];

const MODES = ['GENERATE', 'REWRITE', 'EXPAND', 'SUMMARIZE', 'OPTIMIZE', 'PERSONALIZE', 'AB_VARIANT'];
const TONES = ['PREMIUM_FINTECH', 'PROFESSIONAL', 'SALES', 'SUPPORT', 'FRIENDLY', 'URGENT', 'PROMOTIONAL'];
const LANGUAGES = ['EN', 'HI', 'HINGLISH'];

export function ContentStudioPage() {
  const [contentType, setContentType] = useState('EMAIL');
  const [mode, setMode] = useState('GENERATE');
  const [tone, setTone] = useState('PREMIUM_FINTECH');
  const [language, setLanguage] = useState('EN');
  const [prompt, setPrompt] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [product, setProduct] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [variantCount, setVariantCount] = useState(1);

  const templates = useQuery({
    queryKey: ['content', 'templates', { limit: 50 }],
    queryFn: () => contentService.templates({ limit: 50, sortBy: 'usageCount', sortOrder: 'desc' }),
  });

  const generate = useMutation({
    mutationFn: () =>
      contentService.generate({
        contentType,
        mode,
        tone,
        language,
        prompt,
        sourceText: sourceText || undefined,
        ragEnabled,
        variantCount,
        personalization: {
          customerName: customerName || undefined,
          product: product || undefined,
        },
      }),
  });

  const result = generate.data as Record<string, unknown> | undefined;
  const results = (result?.results as Array<Record<string, unknown>>) ?? [];
  const firstResult = results[0];
  const quality = (firstResult?.qualityReport ?? {}) as Record<string, unknown>;

  return (
    <div>
      <PageHeader title="AI Content Studio" subtitle="Generate marketing, sales, and support content with RAG context" />

      <div className="content-studio">
        <div className="content-studio-form">
          <div className="content-studio-field">
            <label>Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="content-studio-field">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="content-studio-field">
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="content-studio-field">
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="content-studio-field">
            <label>Prompt / Brief</label>
            <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the content to generate..." />
          </div>
          {['REWRITE', 'EXPAND', 'SUMMARIZE', 'OPTIMIZE'].includes(mode) && (
            <div className="content-studio-field">
              <label>Source Text</label>
              <textarea rows={5} value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
            </div>
          )}
          <div className="content-studio-field">
            <label>Customer Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="content-studio-field">
            <label>Product</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} />
          </div>
          <div className="content-studio-field">
            <label>A/B Variants</label>
            <input type="number" min={1} max={5} value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value))} />
          </div>
          <div className="content-studio-field">
            <label>
              <input type="checkbox" checked={ragEnabled} onChange={(e) => setRagEnabled(e.target.checked)} /> Use RAG + Knowledge Base
            </label>
          </div>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending || !prompt}>
            {generate.isPending ? 'Generating…' : 'Generate Content'}
          </Button>
        </div>

        <div className="content-studio-output">
          {generate.isPending && <LoadingSpinner />}
          {!generate.isPending && !firstResult && (
            <p style={{ color: 'var(--color-text-muted)' }}>Generated content will appear here with quality validation.</p>
          )}
          {results.map((r, i) => (
            <Card key={i} title={`Variant ${i + 1}`} className="mb-md">
              <span className={`content-quality-badge ${String(r.qualityStatus ?? 'passed').toLowerCase()}`}>
                {fieldStr(r, 'qualityStatus')}
              </span>
              {r.subject ? <p><strong>Subject:</strong> {fieldStr(r, 'subject')}</p> : null}
              {r.title ? <p><strong>Title:</strong> {fieldStr(r, 'title')}</p> : null}
              <div className="content-preview">{fieldStr(r, 'body')}</div>
              {r.ctaLabel ? <p style={{ marginTop: 8 }}><strong>CTA:</strong> {fieldStr(r, 'ctaLabel')}</p> : null}
            </Card>
          ))}
          {firstResult && (
            <Card title="Quality Report" className="mt-md">
              <pre style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {JSON.stringify(quality, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>

      {templates.data?.items?.length ? (
        <Card title="Quick Templates" className="mt-md">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(templates.data.items as Array<Record<string, unknown>>).slice(0, 8).map((t) => (
              <Button
                key={fieldStr(t, 'id')}
                size="sm"
                variant="secondary"
                onClick={() => {
                  setContentType(fieldStr(t, 'contentType'));
                  setPrompt(fieldStr(t, 'userPrompt') || fieldStr(t, 'name'));
                }}
              >
                {fieldStr(t, 'name')}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
