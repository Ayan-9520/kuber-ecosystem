/**
 * KuberOne UAT Business Scenario & Test Case Library
 * Covers all 12 business flows with positive, negative, boundary, business rule, and exception cases.
 */

type BusinessFlow =
  | 'AUTH' | 'CUSTOMER' | 'DSA' | 'LMS' | 'LOS' | 'DOCUMENT'
  | 'REFERRAL' | 'COMMISSION' | 'SUPPORT' | 'CAMPAIGN' | 'AI' | 'ANALYTICS';

type UserGroup =
  | 'CUSTOMER' | 'DSA_PARTNER' | 'SALES_EXECUTIVE' | 'RELATIONSHIP_MANAGER'
  | 'CREDIT_EXECUTIVE' | 'OPERATIONS_EXECUTIVE' | 'BRANCH_MANAGER'
  | 'REGIONAL_MANAGER' | 'COMPLIANCE_OFFICER' | 'MANAGEMENT' | 'ADMIN';

type TestCaseType = 'POSITIVE' | 'NEGATIVE' | 'BOUNDARY' | 'BUSINESS_RULE' | 'EXCEPTION';

export interface UatScenarioDef {
  code: string;
  name: string;
  description: string;
  businessFlow: BusinessFlow;
  userGroup: UserGroup;
  acceptanceCriteria: string[];
  priority: number;
  sortOrder: number;
}

export interface UatTestCaseDef {
  scenarioCode: string;
  code: string;
  title: string;
  testType: TestCaseType;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  businessRule?: string;
  priority: number;
  sortOrder: number;
}

const TEST_TYPES: TestCaseType[] = ['POSITIVE', 'NEGATIVE', 'BOUNDARY', 'BUSINESS_RULE', 'EXCEPTION'];

function buildTestCases(scenario: UatScenarioDef): UatTestCaseDef[] {
  const typeLabels: Record<TestCaseType, string> = {
    POSITIVE: 'Valid happy-path execution',
    NEGATIVE: 'Invalid input or unauthorized access',
    BOUNDARY: 'Edge values and limits',
    BUSINESS_RULE: 'Business policy enforcement',
    EXCEPTION: 'System error and recovery handling',
  };

  return TEST_TYPES.map((testType, idx) => ({
    scenarioCode: scenario.code,
    code: `${scenario.code}-TC-${testType.slice(0, 3)}`,
    title: `${scenario.name} — ${typeLabels[testType]}`,
    testType,
    preconditions: `User logged in as ${scenario.userGroup.replace(/_/g, ' ')} with appropriate permissions`,
    steps: [
      `Navigate to ${scenario.businessFlow} module`,
      `Execute ${scenario.name} workflow step`,
      `Verify system response for ${testType.toLowerCase().replace('_', ' ')} case`,
      'Capture evidence and actual result',
    ],
    expectedResult:
      testType === 'POSITIVE'
        ? `${scenario.name} completes successfully per acceptance criteria`
        : testType === 'NEGATIVE'
          ? 'System rejects invalid action with clear error message'
          : testType === 'BOUNDARY'
            ? 'System handles boundary values correctly without data corruption'
            : testType === 'BUSINESS_RULE'
              ? 'Business rule is enforced as per KuberOne policy'
              : 'System recovers gracefully and logs exception for audit',
    businessRule:
      testType === 'BUSINESS_RULE'
        ? `KuberOne ${scenario.businessFlow} policy must be enforced for ${scenario.userGroup}`
        : undefined,
    priority: scenario.priority,
    sortOrder: idx,
  }));
}

function scenario(
  flow: BusinessFlow,
  slug: string,
  name: string,
  userGroup: UserGroup,
  criteria: string[],
  sortOrder: number,
): UatScenarioDef {
  const code = `UAT-${flow}-${slug}`;
  return {
    code,
    name,
    description: `UAT validation for ${name} in ${flow} business flow`,
    businessFlow: flow,
    userGroup,
    acceptanceCriteria: criteria,
    priority: 1,
    sortOrder,
  };
}

export const UAT_SCENARIOS: UatScenarioDef[] = [
  // AUTH (6)
  scenario('AUTH', 'CUST-LOGIN', 'Customer Login', 'CUSTOMER', ['Valid credentials authenticate', 'Session created', 'Redirect to dashboard'], 1),
  scenario('AUTH', 'DSA-LOGIN', 'DSA Login', 'DSA_PARTNER', ['DSA credentials validated', 'Partner dashboard accessible'], 2),
  scenario('AUTH', 'EMP-LOGIN', 'Employee Login', 'SALES_EXECUTIVE', ['Employee SSO/password login works', 'RBAC permissions loaded'], 3),
  scenario('AUTH', 'OTP-LOGIN', 'OTP Login', 'CUSTOMER', ['OTP sent to registered mobile', 'OTP verified within TTL'], 4),
  scenario('AUTH', 'PWD-RESET', 'Password Reset', 'CUSTOMER', ['Reset link/OTP sent', 'New password meets policy', 'Old sessions invalidated'], 5),
  scenario('AUTH', 'SESSION', 'Session Management', 'ADMIN', ['Session timeout enforced', 'Concurrent session policy applied', 'Logout clears tokens'], 6),

  // CUSTOMER (10)
  scenario('CUSTOMER', 'REG', 'Registration', 'CUSTOMER', ['Mobile/email verified', 'Profile created', 'Welcome notification sent'], 1),
  scenario('CUSTOMER', 'KYC', 'KYC', 'CUSTOMER', ['PAN/Aadhaar captured', 'KYC status updated', 'Compliance checks passed'], 2),
  scenario('CUSTOMER', 'PROFILE', 'Profile Completion', 'CUSTOMER', ['Mandatory fields validated', 'Profile completeness score updated'], 3),
  scenario('CUSTOMER', 'ELIG', 'Eligibility Check', 'CUSTOMER', ['Product eligibility calculated', 'Reason codes displayed'], 4),
  scenario('CUSTOMER', 'EMI', 'EMI Calculation', 'CUSTOMER', ['EMI computed correctly', 'Rate/tenure applied per product'], 5),
  scenario('CUSTOMER', 'APP-SUB', 'Application Submission', 'CUSTOMER', ['Application created', 'Status set to submitted', 'Timeline entry logged'], 6),
  scenario('CUSTOMER', 'DOC-UP', 'Document Upload', 'CUSTOMER', ['File type/size validated', 'Document linked to application'], 7),
  scenario('CUSTOMER', 'TICKET', 'Support Ticket', 'CUSTOMER', ['Ticket created with category', 'Acknowledgement sent'], 8),
  scenario('CUSTOMER', 'REF', 'Referral', 'CUSTOMER', ['Referral code generated', 'Referral tracked in system'], 9),
  scenario('CUSTOMER', 'AI-ADV', 'AI Advisor', 'CUSTOMER', ['AI responds with product guidance', 'Conversation logged'], 10),

  // DSA (8)
  scenario('DSA', 'LOGIN', 'Login', 'DSA_PARTNER', ['Partner authenticated', 'Commission dashboard visible'], 1),
  scenario('DSA', 'LEAD-CR', 'Lead Creation', 'DSA_PARTNER', ['Lead captured with source DSA', 'Duplicate check performed'], 2),
  scenario('DSA', 'LEAD-AS', 'Lead Assignment', 'DSA_PARTNER', ['Lead assigned to executive', 'Notification sent'], 3),
  scenario('DSA', 'CUST-TR', 'Customer Tracking', 'DSA_PARTNER', ['Customer status visible', 'PII masked per policy'], 4),
  scenario('DSA', 'APP-TR', 'Application Tracking', 'DSA_PARTNER', ['Application stages visible', 'No unauthorized data exposed'], 5),
  scenario('DSA', 'COMM-TR', 'Commission Tracking', 'DSA_PARTNER', ['Commission ledger accurate', 'Payout status visible'], 6),
  scenario('DSA', 'REF-TR', 'Referral Tracking', 'DSA_PARTNER', ['Referral conversions tracked', 'Reward status shown'], 7),
  scenario('DSA', 'SUPPORT', 'Support', 'DSA_PARTNER', ['Partner support ticket raised', 'SLA timer started'], 8),

  // LMS (5)
  scenario('LMS', 'LEAD-CR', 'Lead Creation', 'SALES_EXECUTIVE', ['Lead created with source', 'Scoring triggered'], 1),
  scenario('LMS', 'LEAD-AS', 'Lead Assignment', 'RELATIONSHIP_MANAGER', ['Round-robin/manual assignment works', 'Assignee notified'], 2),
  scenario('LMS', 'FOLLOW', 'Lead Follow-up', 'SALES_EXECUTIVE', ['Follow-up scheduled', 'Activity logged on timeline'], 3),
  scenario('LMS', 'CONV', 'Lead Conversion', 'SALES_EXECUTIVE', ['Lead converted to application', 'Conversion metrics updated'], 4),
  scenario('LMS', 'ANALYTICS', 'Lead Analytics', 'BRANCH_MANAGER', ['Funnel metrics accurate', 'Export available'], 5),

  // LOS (7)
  scenario('LOS', 'APP-CR', 'Application Creation', 'SALES_EXECUTIVE', ['Application draft created', 'Product/lender mapped'], 1),
  scenario('LOS', 'ELIG', 'Eligibility', 'CREDIT_EXECUTIVE', ['Eligibility rules evaluated', 'Decision recorded'], 2),
  scenario('LOS', 'DOC-VER', 'Document Verification', 'OPERATIONS_EXECUTIVE', ['Documents verified', 'Deficiencies flagged'], 3),
  scenario('LOS', 'CREDIT', 'Credit Review', 'CREDIT_EXECUTIVE', ['Credit assessment completed', 'Risk score recorded'], 4),
  scenario('LOS', 'SANCTION', 'Sanction', 'CREDIT_EXECUTIVE', ['Sanction letter generated', 'Terms captured'], 5),
  scenario('LOS', 'DISB', 'Disbursement', 'OPERATIONS_EXECUTIVE', ['Disbursement initiated', 'Ledger updated'], 6),
  scenario('LOS', 'CLOSE', 'Closure', 'OPERATIONS_EXECUTIVE', ['Application closed', 'Final status archived'], 7),

  // DOCUMENT (6)
  scenario('DOCUMENT', 'UPLOAD', 'Upload', 'CUSTOMER', ['Upload succeeds for allowed types', 'Virus scan passed'], 1),
  scenario('DOCUMENT', 'OCR', 'OCR', 'OPERATIONS_EXECUTIVE', ['OCR extracts fields', 'Confidence score recorded'], 2),
  scenario('DOCUMENT', 'VERIFY', 'Verification', 'OPERATIONS_EXECUTIVE', ['Verification checklist completed', 'Status updated'], 3),
  scenario('DOCUMENT', 'APPROVE', 'Approval', 'CREDIT_EXECUTIVE', ['Document approved', 'Audit trail created'], 4),
  scenario('DOCUMENT', 'REJECT', 'Rejection', 'CREDIT_EXECUTIVE', ['Rejection reason captured', 'Customer notified'], 5),
  scenario('DOCUMENT', 'DOWNLOAD', 'Download', 'CUSTOMER', ['Authorized download only', 'Download logged'], 6),

  // REFERRAL (4)
  scenario('REFERRAL', 'CREATE', 'Referral Creation', 'CUSTOMER', ['Referral link/code created', 'Terms displayed'], 1),
  scenario('REFERRAL', 'CONV', 'Referral Conversion', 'DSA_PARTNER', ['Conversion tracked on application sanction', 'Attribution correct'], 2),
  scenario('REFERRAL', 'REWARD-APP', 'Reward Approval', 'BRANCH_MANAGER', ['Reward approved per policy', 'Approval audit logged'], 3),
  scenario('REFERRAL', 'REWARD-PAY', 'Reward Payment', 'OPERATIONS_EXECUTIVE', ['Reward disbursed', 'Payment reference recorded'], 4),

  // COMMISSION (5)
  scenario('COMMISSION', 'CALC', 'Calculation', 'OPERATIONS_EXECUTIVE', ['Commission calculated per rule', 'Breakdown visible'], 1),
  scenario('COMMISSION', 'APPROVE', 'Approval', 'BRANCH_MANAGER', ['Commission batch approved', 'Lock applied post-approval'], 2),
  scenario('COMMISSION', 'PAY', 'Payment', 'OPERATIONS_EXECUTIVE', ['Payout processed', 'Partner notified'], 3),
  scenario('COMMISSION', 'RECOVER', 'Recovery', 'OPERATIONS_EXECUTIVE', ['Clawback processed', 'Ledger reconciled'], 4),
  scenario('COMMISSION', 'REPORT', 'Reports', 'MANAGEMENT', ['Commission reports accurate', 'Export matches ledger'], 5),

  // SUPPORT (5)
  scenario('SUPPORT', 'CREATE', 'Ticket Creation', 'CUSTOMER', ['Ticket created with priority', 'Auto-acknowledgement sent'], 1),
  scenario('SUPPORT', 'ASSIGN', 'Assignment', 'OPERATIONS_EXECUTIVE', ['Ticket assigned to agent', 'SLA clock started'], 2),
  scenario('SUPPORT', 'ESCAL', 'Escalation', 'RELATIONSHIP_MANAGER', ['Escalation rules triggered', 'Manager notified'], 3),
  scenario('SUPPORT', 'RESOLVE', 'Resolution', 'OPERATIONS_EXECUTIVE', ['Resolution notes captured', 'Customer satisfaction survey triggered'], 4),
  scenario('SUPPORT', 'CLOSE', 'Closure', 'CUSTOMER', ['Ticket closed', 'Reopen window enforced'], 5),

  // CAMPAIGN (4)
  scenario('CAMPAIGN', 'CREATE', 'Campaign Creation', 'SALES_EXECUTIVE', ['Campaign draft saved', 'Audience segment defined'], 1),
  scenario('CAMPAIGN', 'APPROVE', 'Approval', 'BRANCH_MANAGER', ['Campaign approved', 'Compliance check passed'], 2),
  scenario('CAMPAIGN', 'EXEC', 'Execution', 'SALES_EXECUTIVE', ['Campaign executed on schedule', 'Delivery metrics captured'], 3),
  scenario('CAMPAIGN', 'ANALYTICS', 'Analytics', 'MANAGEMENT', ['Open/click/conversion tracked', 'ROI calculated'], 4),

  // AI (6)
  scenario('AI', 'ADVISOR', 'AI Advisor', 'CUSTOMER', ['Contextual advice provided', 'Guardrails enforced'], 1),
  scenario('AI', 'VOICE', 'Voice AI', 'SALES_EXECUTIVE', ['Voice session transcribed', 'Action items captured'], 2),
  scenario('AI', 'SCORING', 'Lead Scoring', 'SALES_EXECUTIVE', ['Score computed', 'Grade assigned'], 3),
  scenario('AI', 'RECO', 'Recommendations', 'RELATIONSHIP_MANAGER', ['Product recommendations shown', 'Explainability available'], 4),
  scenario('AI', 'KB', 'Knowledge Base', 'SALES_EXECUTIVE', ['Article retrieved', 'Version/approval status correct'], 5),
  scenario('AI', 'RAG', 'RAG', 'SALES_EXECUTIVE', ['Retrieval augmented response', 'Source citations included'], 6),

  // ANALYTICS (4)
  scenario('ANALYTICS', 'EXEC', 'Executive Analytics', 'MANAGEMENT', ['KPIs accurate', 'Drill-down works'], 1),
  scenario('ANALYTICS', 'BRANCH', 'Branch Analytics', 'BRANCH_MANAGER', ['Branch metrics scoped correctly', 'Targets comparison shown'], 2),
  scenario('ANALYTICS', 'REGION', 'Regional Analytics', 'REGIONAL_MANAGER', ['Regional rollup accurate', 'Cross-branch view available'], 3),
  scenario('ANALYTICS', 'MGMT', 'Management Analytics', 'MANAGEMENT', ['Board-level metrics available', 'Export compliant'], 4),
];

export const UAT_TEST_CASES: UatTestCaseDef[] = UAT_SCENARIOS.flatMap(buildTestCases);

export const UAT_SIGNOFF_CHECKLISTS: Record<string, { item: string }[]> = {
  SALES: [
    { item: 'All sales workflows validated by business users' },
    { item: 'Lead-to-application conversion flows verified' },
    { item: 'No critical/high defects open in sales modules' },
  ],
  CREDIT: [
    { item: 'Credit assessment and sanction flows validated' },
    { item: 'Eligibility rules verified with sample cases' },
    { item: 'Document verification workflow approved' },
  ],
  OPERATIONS: [
    { item: 'Disbursement and operations workflows validated' },
    { item: 'Document OCR and verification approved' },
    { item: 'Support ticket lifecycle verified' },
  ],
  COMPLIANCE: [
    { item: 'KYC/AML compliance checks validated' },
    { item: 'Audit trail completeness verified' },
    { item: 'Data privacy (DPDP) requirements met' },
    { item: 'No open critical compliance defects' },
  ],
  MANAGEMENT: [
    { item: 'Executive analytics reviewed and accurate' },
    { item: 'Business readiness report reviewed' },
    { item: 'Go-live quality gates assessed' },
  ],
  FINAL_UAT: [
    { item: 'All business flows executed with pass rate ≥ 95%' },
    { item: 'Zero critical defects open' },
    { item: 'High defects within threshold (≤ 5)' },
    { item: 'All stakeholder signoffs obtained' },
    { item: 'Rollback plan documented and approved' },
  ],
};

export const UAT_TEMPLATE_DEFS = UAT_SCENARIOS.map((s) => ({
  code: `TMPL-${s.code}`,
  name: `${s.name} Template`,
  description: `Reusable UAT template for ${s.name}`,
  businessFlow: s.businessFlow,
  userGroup: s.userGroup,
  scenarioTemplate: {
    name: s.name,
    description: s.description,
    acceptanceCriteria: s.acceptanceCriteria,
  },
  testCaseTemplates: buildTestCases(s).map((tc) => ({
    title: tc.title,
    testType: tc.testType,
    steps: tc.steps,
    expectedResult: tc.expectedResult,
  })),
  acceptanceCriteria: s.acceptanceCriteria,
  signoffChecklist: UAT_SIGNOFF_CHECKLISTS.FINAL_UAT,
}));
