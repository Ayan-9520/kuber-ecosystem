import { centralAuditService } from '../../governance/services/central-audit.service.js';
import { INJECTION_PATTERNS, PII_PATTERNS } from '../constants/ai-platform.constants.js';

export const responseProcessorService = {
  detectInjection(text: string): { detected: boolean; matched?: string } {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return { detected: true, matched: pattern.source };
      }
    }
    return { detected: false };
  },
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

  sanitizeInput(text: string, ctx?: { actorId?: string; module?: string; ipAddress?: string }): string {
    const detection = this.detectInjection(text);
    if (detection.detected) {
      void centralAuditService.logSecurityEvent({
        eventType: 'AI_PROMPT_ABUSE',
        severity: 'HIGH',
        userId: ctx?.actorId,
        ipAddress: ctx?.ipAddress,
        description: `Prompt injection pattern detected: ${detection.matched}`,
        metadata: { module: ctx?.module, pattern: detection.matched },
      });
      void centralAuditService.logComplianceViolation({
        ruleCode: 'AI_PROMPT_INJECTION',
        description: 'AI prompt injection attempt blocked',
        severity: 'HIGH',
        userId: ctx?.actorId,
        evidence: { pattern: detection.matched, module: ctx?.module },
      });
    }

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
