import { INJECTION_PATTERNS, PII_PATTERNS } from '../constants/ai-platform.constants.js';

export const responseProcessorService = {
  maskPii(text: string): { text: string; masked: boolean } {
    let masked = false;
    let result = text;
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(result)) {
        masked = true;
        result = result.replace(pattern, '[REDACTED]');
      }
    }
    return { text: result, masked };
  },

  sanitizeInput(text: string): string {
    let sanitized = text;
    for (const pattern of INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[filtered]');
    }
    return sanitized.trim();
  },

  processOutput(content: string, options?: { maskPii?: boolean }) {
    if (!options?.maskPii) return { content, piiMasked: false };
    const { text, masked } = this.maskPii(content);
    return { content: text, piiMasked: masked };
  },
};
