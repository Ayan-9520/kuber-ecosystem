import type { PrismaClient } from '@prisma/client';

const COMPLIANCE_RULES = [
  {
    code: 'DPDP_PII_EXPORT',
    name: 'DPDP — PII Bulk Export Control',
    framework: 'DPDP' as const,
    severity: 'HIGH' as const,
    ruleType: 'DATA_EXPORT',
    condition: { maxRecords: 500, requiresApproval: true },
  },
  {
    code: 'KYC_DOC_VERIFICATION',
    name: 'KYC — Document Verification Mandatory',
    framework: 'KYC' as const,
    severity: 'CRITICAL' as const,
    ruleType: 'DOCUMENT',
    condition: { requiredStatus: 'VERIFIED', entityTypes: ['CUSTOMER', 'APPLICATION'] },
  },
  {
    code: 'AML_HIGH_VALUE',
    name: 'AML — High Value Transaction Review',
    framework: 'AML' as const,
    severity: 'HIGH' as const,
    ruleType: 'TRANSACTION',
    condition: { thresholdAmount: 500000, currency: 'INR' },
  },
  {
    code: 'SEC_FAILED_LOGIN',
    name: 'Security — Failed Login Threshold',
    framework: 'SECURITY' as const,
    severity: 'MEDIUM' as const,
    ruleType: 'AUTH',
    condition: { maxAttempts: 5, windowMinutes: 15 },
  },
  {
    code: 'AI_PROMPT_INJECTION',
    name: 'AI Governance — Prompt Injection Detection',
    framework: 'SECURITY' as const,
    severity: 'HIGH' as const,
    ruleType: 'AI',
    condition: { blockPatterns: ['ignore previous', 'system prompt', 'jailbreak'] },
  },
  {
    code: 'OPS_BULK_DELETE',
    name: 'Operational — Bulk Delete Restriction',
    framework: 'OPERATIONAL' as const,
    severity: 'CRITICAL' as const,
    ruleType: 'BULK_ACTION',
    condition: { maxDeleteCount: 10, requiresDualApproval: true },
  },
];

const RETENTION_POLICIES = [
  { code: 'AUDIT_LOG_7Y', name: 'Audit Logs — 7 Year Retention', entityType: 'audit_event', retentionDays: 2555, action: 'ARCHIVE' as const, framework: 'AUDIT' as const },
  { code: 'KYC_DOC_10Y', name: 'KYC Documents — 10 Year Retention', entityType: 'document', retentionDays: 3650, action: 'ARCHIVE' as const, framework: 'KYC' as const },
  { code: 'PII_ANONYMIZE', name: 'Customer PII — Anonymize After Closure', entityType: 'customer', retentionDays: 1095, action: 'ANONYMIZE' as const, framework: 'DPDP' as const },
  { code: 'AI_LOG_1Y', name: 'AI Request Logs — 1 Year Retention', entityType: 'ai_request', retentionDays: 365, action: 'DELETE' as const, framework: 'SECURITY' as const },
];

const GOVERNANCE_POLICIES = [
  {
    code: 'DATA_GOVERNANCE_V1',
    name: 'Kuber Finserve Data Governance Policy',
    policyType: 'DATA_GOVERNANCE' as const,
    content: 'All PII access must be logged. Bulk exports require compliance approval. Customer data must not leave approved regions.',
  },
  {
    code: 'AI_GOVERNANCE_V1',
    name: 'AI Governance & Responsible Use Policy',
    policyType: 'AI_GOVERNANCE' as const,
    content: 'AI outputs require human review for credit decisions. Prompt injection attempts are blocked and logged. Model usage is tracked per module.',
  },
  {
    code: 'ACCESS_GOVERNANCE_V1',
    name: 'Access Governance & RBAC Policy',
    policyType: 'ACCESS_GOVERNANCE' as const,
    content: 'Role changes require dual approval. Privilege escalations trigger security alerts. Dormant accounts (>90 days) are flagged.',
  },
];

const RISK_REGISTER = [
  {
    code: 'RISK_AI_HALLUCINATION',
    title: 'AI Hallucination in Customer Communications',
    riskType: 'AI' as const,
    severity: 'HIGH' as const,
    likelihood: 40,
    impact: 75,
    riskScore: 55,
    mitigationPlan: 'Mandatory RAG grounding, quality engine validation, human approval for published content.',
  },
  {
    code: 'RISK_PARTNER_FRAUD',
    title: 'Partner Referral Fraud',
    riskType: 'FRAUD' as const,
    severity: 'HIGH' as const,
    likelihood: 35,
    impact: 80,
    riskScore: 58,
    mitigationPlan: 'Duplicate detection, commission hold period, partner score monitoring.',
  },
  {
    code: 'RISK_DATA_BREACH',
    title: 'Unauthorized PII Access',
    riskType: 'SECURITY' as const,
    severity: 'CRITICAL' as const,
    likelihood: 25,
    impact: 95,
    riskScore: 60,
    mitigationPlan: 'RBAC enforcement, data access logging, anomaly detection on bulk exports.',
  },
];

export async function seedGovernance(prisma: PrismaClient): Promise<void> {
  for (const rule of COMPLIANCE_RULES) {
    await prisma.complianceRule.upsert({
      where: { code: rule.code },
      create: rule,
      update: { name: rule.name, condition: rule.condition, isActive: true },
    });
  }

  for (const policy of RETENTION_POLICIES) {
    await prisma.retentionPolicy.upsert({
      where: { code: policy.code },
      create: policy,
      update: { retentionDays: policy.retentionDays, isActive: true },
    });
  }

  for (const policy of GOVERNANCE_POLICIES) {
    await prisma.governancePolicy.upsert({
      where: { code: policy.code },
      create: policy,
      update: { content: policy.content, isActive: true },
    });
  }

  for (const risk of RISK_REGISTER) {
    await prisma.riskRegister.upsert({
      where: { code: risk.code },
      create: { ...risk, status: 'IDENTIFIED' },
      update: { mitigationPlan: risk.mitigationPlan, riskScore: risk.riskScore },
    });
  }

  console.log('  → governance, compliance rules, retention & risk register seeded');
}
