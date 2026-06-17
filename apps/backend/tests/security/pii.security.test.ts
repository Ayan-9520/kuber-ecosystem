import { PII_SAMPLES, detectPiiLeakage } from '@kuberone/security-testing';

import { responseProcessorService } from '../../src/modules/ai-platform/services/response-processor.service.js';
import { sanitizeDocumentResponse } from '../../src/modules/documents/utils/documents.utils.js';

describe('Security — PII Protection', () => {
  it('masks PAN in AI processor output', () => {
    const text = `Applicant PAN is ${PII_SAMPLES.pan}`;
    const { content, piiMasked } = responseProcessorService.processOutput(text, { maskPii: true });
    expect(piiMasked).toBe(true);
    expect(content).not.toContain(PII_SAMPLES.pan);
  });

  it('masks Aadhaar in AI processor output', () => {
    const text = `Aadhaar ${PII_SAMPLES.aadhaar} on file`;
    const { content } = responseProcessorService.processOutput(text, { maskPii: true });
    expect(content).not.toContain(PII_SAMPLES.aadhaar);
  });

  it('masks card numbers in AI output', () => {
    const text = `Card ${PII_SAMPLES.card}`;
    const { content } = responseProcessorService.processOutput(text, { maskPii: true });
    expect(content).not.toContain(PII_SAMPLES.card.replace(/\s/g, ''));
  });

  it('masks mobile and email in AI output', () => {
    const text = `Call ${PII_SAMPLES.mobile} or ${PII_SAMPLES.email}`;
    const { content, piiMasked } = responseProcessorService.processOutput(text, { maskPii: true });
    expect(piiMasked).toBe(true);
    expect(detectPiiLeakage(content)).toHaveLength(0);
  });

  it('strips sensitive document fields from API response', () => {
    const doc = {
      id: 'doc-1',
      fileName: 'pan.pdf',
      internalNotes: 'secret verifier notes',
      verificationRaw: { raw: 'ocr' },
      ocrRawPayload: { pan: PII_SAMPLES.pan },
    };
    const sanitized = sanitizeDocumentResponse(doc);
    expect(sanitized).not.toHaveProperty('internalNotes');
    expect(sanitized).not.toHaveProperty('verificationRaw');
    expect(sanitized).not.toHaveProperty('ocrRawPayload');
    expect(sanitized).toHaveProperty('fileName');
  });

  it('detectPiiLeakage identifies exposed patterns', () => {
    const leaked = `PAN ${PII_SAMPLES.pan} mobile ${PII_SAMPLES.mobile}`;
    const findings = detectPiiLeakage(leaked);
    expect(findings).toContain('pan');
    expect(findings).toContain('mobile');
  });
});
