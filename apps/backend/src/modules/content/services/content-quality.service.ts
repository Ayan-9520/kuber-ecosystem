const SPAM_PATTERNS = [
  /\b(free money|guaranteed approval|100% approved|click here now|act now|limited time only)\b/gi,
  /\b(urgent!!!|winner|lottery|crypto double)\b/gi,
];

const COMPLIANCE_KEYWORDS = ['rbi', 'nbfc', 'kyc', 'pan', 'aadhaar', 'disclaimer', 'terms'];

export const contentQualityService = {
  validate(content: string, contentType: string) {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!content.trim()) issues.push('Empty content');
    if (content.length < 10) warnings.push('Very short content');

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readabilityScore = Math.min(100, Math.round((wordCount / Math.max(1, content.split(/[.!?]/).length)) * 10));

    if (contentType === 'SMS' && content.length > 160) {
      warnings.push(`SMS length ${content.length} exceeds 160 characters`);
    }
    if (contentType === 'PUSH' && content.length > 240) {
      warnings.push(`Push content may be truncated (${content.length} chars)`);
    }

    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(content)) warnings.push('Potential spam trigger phrases detected');
    }

    const piiPatterns = [
      /\b\d{12}\b/,
      /\b[A-Z]{5}\d{4}[A-Z]\b/,
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    ];
    let piiDetected = false;
    for (const p of piiPatterns) {
      if (p.test(content)) {
        piiDetected = true;
        issues.push('PII detected in generated content');
        break;
      }
    }

    const lower = content.toLowerCase();
    const hasComplianceRef = COMPLIANCE_KEYWORDS.some((k) => lower.includes(k));
    if (['EMAIL', 'CAMPAIGN', 'WHATSAPP'].includes(contentType) && !hasComplianceRef) {
      warnings.push('Consider adding compliance disclaimer or regulatory reference');
    }

    const grammarIssues = (content.match(/\s{2,}|\.{3,}|!!+/g) ?? []).length;
    if (grammarIssues > 2) warnings.push('Possible grammar/formatting issues');

    const brandConsistent =
      lower.includes('kuber') || lower.includes('kuberone') || lower.includes('kuber finserve');
    if (!brandConsistent && ['EMAIL', 'CAMPAIGN', 'LANDING_PAGE'].includes(contentType)) {
      warnings.push('Brand name not referenced — consider including Kuber Finserve / KuberOne');
    }

    const status = issues.length ? 'FAILED' : warnings.length ? 'WARNING' : 'PASSED';

    return {
      status,
      readabilityScore,
      wordCount,
      piiDetected,
      spamRisk: warnings.some((w) => w.includes('spam')) ? 'medium' : 'low',
      issues,
      warnings,
      grammarScore: Math.max(0, 100 - grammarIssues * 10),
      complianceAligned: hasComplianceRef,
      brandConsistent,
    };
  },
};
