import type { DocumentResolutionResult } from '../types/product.types.js';

interface DocumentRuleRecord {
  documentTypeId: string;
  isMandatory: boolean;
  stage: string;
  documentType: { code: string; name: string; category: string };
}

export const documentEngineService = {
  resolve(rules: DocumentRuleRecord[], riskLevel?: string): DocumentResolutionResult {
    const mandatoryDocuments: DocumentResolutionResult['mandatoryDocuments'] = [];
    const optionalDocuments: DocumentResolutionResult['optionalDocuments'] = [];
    const additionalDocuments: DocumentResolutionResult['additionalDocuments'] = [];
    const riskDocuments: DocumentResolutionResult['riskDocuments'] = [];

    const seen = new Set<string>();

    for (const rule of rules) {
      if (seen.has(rule.documentTypeId)) continue;
      seen.add(rule.documentTypeId);

      const doc = {
        documentTypeId: rule.documentTypeId,
        code: rule.documentType.code,
        name: rule.documentType.name,
        stage: rule.stage,
      };

      if (rule.isMandatory) {
        mandatoryDocuments.push(doc);
      } else {
        optionalDocuments.push(doc);
      }
    }

    if (riskLevel === 'HIGH') {
      const highRiskCodes = ['BANK_STATEMENT', 'ITR', 'GST', 'PROPERTY_DOCS', 'VEHICLE_RC'];
      for (const code of highRiskCodes) {
        const match = rules.find((r) => r.documentType.code.includes(code) || code.includes(r.documentType.code));
        if (match && !seen.has(match.documentTypeId)) {
          riskDocuments.push({
            documentTypeId: match.documentTypeId,
            code: match.documentType.code,
            name: match.documentType.name,
            stage: match.stage,
          });
        }
      }
    }

    const kycDocs = rules.filter((r) => r.documentType.category === 'KYC');
    for (const rule of kycDocs) {
      if (!mandatoryDocuments.some((d) => d.documentTypeId === rule.documentTypeId)) {
        additionalDocuments.push({
          documentTypeId: rule.documentTypeId,
          code: rule.documentType.code,
          name: rule.documentType.name,
          stage: rule.stage,
        });
      }
    }

    return { mandatoryDocuments, optionalDocuments, additionalDocuments, riskDocuments };
  },
};
