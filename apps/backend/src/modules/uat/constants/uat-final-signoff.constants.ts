export const UAT_STAKEHOLDER_GROUPS = [
  { group: 'MANAGEMENT', label: 'Management', department: 'Executive' },
  { group: 'SALES', label: 'Sales Team', department: 'Sales' },
  { group: 'RELATIONSHIP_MANAGER', label: 'Relationship Managers', department: 'Sales' },
  { group: 'CREDIT', label: 'Credit Team', department: 'Credit' },
  { group: 'OPERATIONS', label: 'Operations Team', department: 'Operations' },
  { group: 'COMPLIANCE', label: 'Compliance Team', department: 'Compliance' },
  { group: 'SUPPORT', label: 'Support Team', department: 'Support' },
  { group: 'DSA_PARTNER', label: 'DSA Partners', department: 'Channel' },
  { group: 'CUSTOMER_JOURNEY', label: 'Customer Journey Owners', department: 'Product' },
  { group: 'TECHNOLOGY', label: 'Technology Team', department: 'Technology' },
] as const;

export const UAT_REVIEW_AREAS = [
  { area: 'CUSTOMER_JOURNEY', label: 'Customer Journey', weight: 12 },
  { area: 'DSA_JOURNEY', label: 'DSA Journey', weight: 10 },
  { area: 'CRM_JOURNEY', label: 'CRM Journey', weight: 12 },
  { area: 'BUSINESS_WORKFLOWS', label: 'Business Workflows', weight: 10 },
  { area: 'AI_WORKFLOWS', label: 'AI Workflows', weight: 8 },
  { area: 'NOTIFICATIONS', label: 'Notifications', weight: 8 },
  { area: 'SECURITY', label: 'Security Approval', weight: 12 },
  { area: 'OPERATIONS', label: 'Operations Approval', weight: 10 },
  { area: 'PERFORMANCE', label: 'Performance Approval', weight: 8 },
] as const;

export const UAT_FINAL_SIGNOFF_GATES = [
  { id: 'critical_defects', label: 'Critical defects = 0', check: 'defects' },
  { id: 'security_gate', label: 'Penetration test / security gate passed', check: 'security' },
  { id: 'production_audit', label: 'Production readiness audit passed', check: 'production' },
  { id: 'go_live_gate', label: 'Go-Live checklist passed', check: 'golive' },
  { id: 'stakeholder_approvals', label: 'All required stakeholder approvals', check: 'approvals' },
  { id: 'final_uat_signoff', label: 'FINAL_UAT signoff approved', check: 'signoff' },
] as const;

export const UAT_CERTIFICATION_DOMAINS = [
  'business',
  'technology',
  'operations',
  'security',
  'management',
] as const;
