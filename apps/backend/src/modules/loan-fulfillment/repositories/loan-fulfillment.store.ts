import { randomUUID } from 'node:crypto';

import type { AuthenticatedUser } from '@kuberone/shared-types';
import { UserType } from '@kuberone/shared-types';

import {
  APPROVAL_CHAIN_STEPS,
  CASE_NUMBER_PREFIX,
  STAGE_LABELS,
} from '../constants/loan-fulfillment.constants.js';
import type {
  LoanCase,
  LoanCaseActivity,
  LoanCaseApproval,
  LoanCaseDocument,
  LoanCaseStakeholder,
  LoanCaseTask,
  LoanCaseTimelineEvent,
  LoanRevenueRule,
  PartnerLoanCaseView,
  RequestContext,
} from '../types/loan-fulfillment.types.js';

const cases = new Map<string, LoanCase>();
const revenueRules = new Map<string, LoanRevenueRule>();

let caseSeq = 0;
let seeded = false;

const SEED_PARTNER_A = 'a1000000-0000-4000-8000-000000000001';
const SEED_PARTNER_B = 'a1000000-0000-4000-8000-000000000002';
const SEED_EMPLOYEE = 'e1000000-0000-4000-8000-000000000001';
const SEED_TL = 'e1000000-0000-4000-8000-000000000002';

function nowIso(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return nowIso(-days);
}

export function isPartnerActor(user: AuthenticatedUser | { userType?: string; partnerId?: string }): boolean {
  return user.userType === UserType.PARTNER || user.userType === 'PARTNER';
}

export function nextCaseNumber(year = new Date().getFullYear()): string {
  caseSeq += 1;
  return `${CASE_NUMBER_PREFIX}-${year}-${String(caseSeq).padStart(6, '0')}`;
}

function syncCaseSeqFromExisting(): void {
  let max = 0;
  for (const c of Array.from(cases.values())) {
    const m = /^KF-(\d{4})-(\d+)$/.exec(c.caseNumber);
    if (m) {
      const n = Number(m[2]);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  caseSeq = Math.max(caseSeq, max);
}

function buildApprovalChain(loanCaseId: string, upToStep?: string): LoanCaseApproval[] {
  let reachedCurrent = false;
  return APPROVAL_CHAIN_STEPS.map((step, idx) => {
    const id = randomUUID();
    if (!upToStep) {
      return {
        id,
        loanCaseId,
        step,
        status: 'NOT_REQUIRED' as const,
        createdAt: daysAgo(10 - idx),
      };
    }
    if (step === upToStep) {
      reachedCurrent = true;
      return {
        id,
        loanCaseId,
        step,
        status: 'PENDING' as const,
        createdAt: daysAgo(10 - idx),
      };
    }
    if (reachedCurrent) {
      return {
        id,
        loanCaseId,
        step,
        status: 'NOT_REQUIRED' as const,
        createdAt: daysAgo(10 - idx),
      };
    }
    return {
      id,
      loanCaseId,
      step,
      status: 'APPROVED' as const,
      comment: `${step} approved`,
      actedById: SEED_EMPLOYEE,
      actedByName: step === 'Employee' ? 'Rahul Sharma' : `${step} Lead`,
      actedAt: daysAgo(9 - idx),
      createdAt: daysAgo(10 - idx),
    };
  });
}

function defaultStakeholders(
  loanCaseId: string,
  partnerId: string,
  partnerName: string,
  baseAmount: number,
  opts?: { partnerPaid?: boolean },
): LoanCaseStakeholder[] {
  const rows: Array<{
    type: LoanCaseStakeholder['stakeholderType'];
    name: string;
    refId?: string;
    pct: number;
  }> = [
    { type: 'PARTNER', name: partnerName, refId: partnerId, pct: 40 },
    { type: 'EMPLOYEE', name: 'Rahul Sharma', refId: SEED_EMPLOYEE, pct: 15 },
    { type: 'TEAM_LEADER', name: 'Priya Nair', refId: SEED_TL, pct: 10 },
    { type: 'SALES_MANAGER', name: 'Amit Verma', pct: 5 },
    { type: 'COMPANY', name: 'KuberOne Platform', pct: 30 },
  ];
  const ts = daysAgo(14);
  return rows.map((r) => {
    const amount = Math.round((baseAmount * r.pct) / 100);
    const isPartner = r.type === 'PARTNER';
    const paid = Boolean(opts?.partnerPaid && isPartner);
    return {
      id: randomUUID(),
      loanCaseId,
      stakeholderType: r.type,
      stakeholderName: r.name,
      stakeholderRefId: r.refId ?? null,
      sharePercent: r.pct,
      amount,
      approvalStatus: paid ? 'APPROVED' : 'PENDING',
      paymentStatus: paid ? 'PAID' : 'PENDING',
      paidAt: paid ? daysAgo(2) : null,
      transactionRef: paid ? `UTR${Date.now().toString().slice(-8)}` : null,
      createdAt: ts,
      updatedAt: ts,
    };
  });
}

function appendTimeline(
  loanCaseId: string,
  stages: Array<{ stage: LoanCase['stage']; daysAgo: number; description?: string }>,
): LoanCaseTimelineEvent[] {
  return stages.map((s) => ({
    id: randomUUID(),
    loanCaseId,
    stage: s.stage,
    title: STAGE_LABELS[s.stage],
    description: s.description ?? null,
    performedBy: 'System',
    performedById: null,
    metadata: null,
    createdAt: daysAgo(s.daysAgo),
  }));
}

function makeCase(partial: Omit<LoanCase, 'timeline' | 'documents' | 'stakeholders' | 'approvals' | 'tasks' | 'activities'> & {
  timeline: LoanCaseTimelineEvent[];
  documents: LoanCaseDocument[];
  stakeholders: LoanCaseStakeholder[];
  approvals: LoanCaseApproval[];
  tasks: LoanCaseTask[];
  activities: LoanCaseActivity[];
}): LoanCase {
  return partial;
}

export function seedCases(): void {
  if (seeded) return;
  seeded = true;

  const case1Id = 'c1000000-0000-4000-8000-000000000001';
  const case2Id = 'c1000000-0000-4000-8000-000000000002';
  const case3Id = 'c1000000-0000-4000-8000-000000000003';
  const revenueBase1 = 85000;
  const revenueBase2 = 62000;
  const revenueBase3 = 95000;

  const c1Stakeholders = defaultStakeholders(case1Id, SEED_PARTNER_A, 'Skyline DSA', revenueBase1);
  const c2Stakeholders = defaultStakeholders(case2Id, SEED_PARTNER_A, 'Skyline DSA', revenueBase2);
  const c3Stakeholders = defaultStakeholders(case3Id, SEED_PARTNER_B, 'Horizon Connectors', revenueBase3, {
    partnerPaid: true,
  });

  const case1 = makeCase({
    id: case1Id,
    caseNumber: 'KF-2026-000001',
    stage: 'BANK_PROCESSING',
    product: 'HOME_LOAN',
    lenderName: 'HDFC Bank',
    lenderId: null,
    branchName: 'Andheri West',
    branchId: null,
    applicationId: null,
    leadId: null,
    customerId: null,
    partnerId: SEED_PARTNER_A,
    connectorId: null,
    relationshipManagerId: SEED_EMPLOYEE,
    salesEmployeeId: SEED_EMPLOYEE,
    customerName: 'Suresh Mehta',
    pan: 'ABCDE1234F',
    aadhaarMasked: 'XXXX-XXXX-4321',
    mobile: '9876543210',
    email: 'suresh.mehta@example.com',
    occupation: 'Salaried',
    employer: 'Infosys Ltd',
    annualIncome: 1800000,
    propertyAddress: 'Flat 1204, Palm Residency, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    referralSource: 'Partner',
    projectName: 'Palm Residency',
    loanAmount: 6500000,
    requestedAmount: 7000000,
    eligibleAmount: 6800000,
    sanctionAmount: null,
    disbursementAmount: null,
    interestRate: 8.45,
    tenureMonths: 240,
    emiAmount: null,
    bankApplicationNumber: 'HDFC-HL-982341',
    loanAccountNumber: null,
    expectedSanctionDate: nowIso(14),
    expectedDisbursementDate: nowIso(28),
    expectedRevenue: revenueBase1,
    expectedCommission: c1Stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.amount ?? 34000,
    revenueGenerated: null,
    gstAmount: Math.round(revenueBase1 * 0.18),
    tdsAmount: Math.round(revenueBase1 * 0.05),
    netRevenue: revenueBase1 + Math.round(revenueBase1 * 0.18) - Math.round(revenueBase1 * 0.05),
    companyMargin: Math.round(revenueBase1 * 0.3),
    employeeIncentiveTotal: Math.round(revenueBase1 * 0.15),
    approvalStatus: 'PENDING',
    paymentStatus: 'NOT_DUE',
    aiEligibilityScore: 82,
    aiRiskScore: 28,
    aiBankRecommendation: 'HDFC Bank — strong salary profile fit',
    aiCaseSummary: 'Home loan mid-journey; bank processing login docs.',
    remarks: 'Customer prefers evening calls',
    internalNotes: 'Company margin protected — do not share with partner',
    metadata: { seed: true },
    version: 1,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(1),
    createdById: SEED_EMPLOYEE,
    updatedById: SEED_EMPLOYEE,
    deletedAt: null,
    deletedById: null,
    timeline: appendTimeline(case1Id, [
      { stage: 'LEAD_CREATED', daysAgo: 21, description: 'Lead captured from partner app' },
      { stage: 'ASSIGNED', daysAgo: 20, description: 'Assigned to RM Rahul Sharma' },
      { stage: 'ELIGIBILITY', daysAgo: 18, description: 'Eligibility cleared at ₹68L' },
      { stage: 'DOCUMENT_COLLECTION', daysAgo: 16 },
      { stage: 'DOCUMENTS_VERIFIED', daysAgo: 12 },
      { stage: 'LOAN_LOGIN', daysAgo: 8, description: 'Logged into HDFC portal' },
      { stage: 'BANK_PROCESSING', daysAgo: 1, description: 'Under bank credit appraisal' },
    ]),
    documents: [
      {
        id: randomUUID(),
        loanCaseId: case1Id,
        documentType: 'PAN',
        fileName: 'suresh-pan.pdf',
        storageKey: 'loan-cases/c1/pan.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 120_400,
        version: 1,
        uploadedById: SEED_PARTNER_A,
        uploadedByName: 'Skyline DSA',
        verifiedAt: daysAgo(12),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(16),
      },
      {
        id: randomUUID(),
        loanCaseId: case1Id,
        documentType: 'SALARY_SLIP',
        fileName: 'salary-last-3m.pdf',
        storageKey: 'loan-cases/c1/salary.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 340_200,
        version: 1,
        uploadedById: SEED_PARTNER_A,
        uploadedByName: 'Skyline DSA',
        verifiedAt: daysAgo(12),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(15),
      },
      {
        id: randomUUID(),
        loanCaseId: case1Id,
        documentType: 'PROPERTY_PAPERS',
        fileName: 'palm-residency-docs.pdf',
        storageKey: 'loan-cases/c1/property.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 890_100,
        version: 1,
        uploadedById: SEED_EMPLOYEE,
        uploadedByName: 'Rahul Sharma',
        verifiedAt: daysAgo(11),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(14),
      },
    ],
    stakeholders: c1Stakeholders,
    approvals: buildApprovalChain(case1Id, 'Operations'),
    tasks: [
      {
        id: randomUUID(),
        loanCaseId: case1Id,
        title: 'Follow up bank credit query',
        description: 'HDFC asked for updated Form 16',
        priority: 'HIGH',
        status: 'OPEN',
        dueAt: nowIso(2),
        assignedToId: SEED_EMPLOYEE,
        assignedToName: 'Rahul Sharma',
        completedAt: null,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ],
    activities: [
      {
        id: randomUUID(),
        loanCaseId: case1Id,
        action: 'CASE_SEEDED',
        detail: 'Demo home loan case created',
        userId: SEED_EMPLOYEE,
        userName: 'System',
        createdAt: daysAgo(21),
      },
    ],
  });

  const case2 = makeCase({
    id: case2Id,
    caseNumber: 'KF-2026-000002',
    stage: 'SANCTIONED',
    product: 'LOAN_AGAINST_PROPERTY',
    lenderName: 'Bajaj Housing Finance',
    lenderId: null,
    branchName: 'Pune Camp',
    branchId: null,
    applicationId: null,
    leadId: null,
    customerId: null,
    partnerId: SEED_PARTNER_A,
    connectorId: null,
    relationshipManagerId: SEED_EMPLOYEE,
    salesEmployeeId: SEED_EMPLOYEE,
    customerName: 'Neha Kulkarni',
    pan: 'PQRST5678K',
    aadhaarMasked: 'XXXX-XXXX-7788',
    mobile: '9988776655',
    email: 'neha.k@example.com',
    occupation: 'Self Employed',
    employer: 'Kulkarni Traders',
    annualIncome: 2400000,
    propertyAddress: 'Shop 12, MG Road, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    referralSource: 'Walk-in',
    projectName: null,
    loanAmount: 4500000,
    requestedAmount: 5000000,
    eligibleAmount: 4700000,
    sanctionAmount: 4500000,
    disbursementAmount: null,
    interestRate: 9.75,
    tenureMonths: 180,
    emiAmount: 47850,
    bankApplicationNumber: 'BAJAJ-LAP-44120',
    loanAccountNumber: null,
    expectedSanctionDate: daysAgo(3),
    expectedDisbursementDate: nowIso(10),
    expectedRevenue: revenueBase2,
    expectedCommission: c2Stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.amount ?? 24800,
    revenueGenerated: null,
    gstAmount: Math.round(revenueBase2 * 0.18),
    tdsAmount: Math.round(revenueBase2 * 0.05),
    netRevenue: revenueBase2 + Math.round(revenueBase2 * 0.18) - Math.round(revenueBase2 * 0.05),
    companyMargin: Math.round(revenueBase2 * 0.3),
    employeeIncentiveTotal: Math.round(revenueBase2 * 0.15),
    approvalStatus: 'APPROVED',
    paymentStatus: 'NOT_DUE',
    aiEligibilityScore: 76,
    aiRiskScore: 35,
    aiBankRecommendation: 'Bajaj HFC — LAP fit for commercial property',
    aiCaseSummary: 'LAP sanctioned; awaiting disbursement schedule.',
    remarks: 'Sanction letter shared with customer',
    internalNotes: 'Hold 5% company buffer pending legal search',
    metadata: { seed: true },
    version: 2,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(2),
    createdById: SEED_EMPLOYEE,
    updatedById: SEED_EMPLOYEE,
    deletedAt: null,
    deletedById: null,
    timeline: appendTimeline(case2Id, [
      { stage: 'LEAD_CREATED', daysAgo: 35 },
      { stage: 'ASSIGNED', daysAgo: 34 },
      { stage: 'ELIGIBILITY', daysAgo: 32 },
      { stage: 'DOCUMENT_COLLECTION', daysAgo: 28 },
      { stage: 'DOCUMENTS_VERIFIED', daysAgo: 24 },
      { stage: 'LOAN_LOGIN', daysAgo: 20 },
      { stage: 'BANK_PROCESSING', daysAgo: 14 },
      { stage: 'BANK_QUERY_RAISED', daysAgo: 10, description: 'Title search clarification' },
      { stage: 'QUERY_RESOLVED', daysAgo: 7 },
      { stage: 'SANCTIONED', daysAgo: 3, description: 'Sanctioned for ₹45L' },
    ]),
    documents: [
      {
        id: randomUUID(),
        loanCaseId: case2Id,
        documentType: 'PROPERTY_PAPERS',
        fileName: 'shop-title-deed.pdf',
        storageKey: 'loan-cases/c2/title.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 512_000,
        version: 1,
        uploadedById: SEED_PARTNER_A,
        uploadedByName: 'Skyline DSA',
        verifiedAt: daysAgo(24),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(28),
      },
      {
        id: randomUUID(),
        loanCaseId: case2Id,
        documentType: 'SANCTION_LETTER',
        fileName: 'bajaj-sanction.pdf',
        storageKey: 'loan-cases/c2/sanction.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 210_000,
        version: 1,
        uploadedById: SEED_EMPLOYEE,
        uploadedByName: 'Rahul Sharma',
        verifiedAt: daysAgo(3),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(3),
      },
    ],
    stakeholders: c2Stakeholders,
    approvals: buildApprovalChain(case2Id).map((a, i) =>
      i < 3
        ? {
            ...a,
            status: 'APPROVED' as const,
            actedAt: daysAgo(5 - i),
            actedByName: a.step,
            comment: 'OK',
          }
        : { ...a, status: 'PENDING' as const },
    ),
    tasks: [
      {
        id: randomUUID(),
        loanCaseId: case2Id,
        title: 'Schedule disbursement',
        description: 'Coordinate with Bajaj ops for disbursement slot',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueAt: nowIso(5),
        assignedToId: SEED_EMPLOYEE,
        assignedToName: 'Rahul Sharma',
        completedAt: null,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
      },
    ],
    activities: [
      {
        id: randomUUID(),
        loanCaseId: case2Id,
        action: 'CASE_SEEDED',
        detail: 'Demo LAP case created',
        userId: SEED_EMPLOYEE,
        userName: 'System',
        createdAt: daysAgo(35),
      },
    ],
  });

  const case3 = makeCase({
    id: case3Id,
    caseNumber: 'KF-2026-000003',
    stage: 'DISBURSED',
    product: 'BUSINESS_LOAN',
    lenderName: 'ICICI Bank',
    lenderId: null,
    branchName: 'Bengaluru Koramangala',
    branchId: null,
    applicationId: null,
    leadId: null,
    customerId: null,
    partnerId: SEED_PARTNER_B,
    connectorId: null,
    relationshipManagerId: SEED_EMPLOYEE,
    salesEmployeeId: SEED_EMPLOYEE,
    customerName: 'Arjun Reddy',
    pan: 'XYZAB9012C',
    aadhaarMasked: 'XXXX-XXXX-1199',
    mobile: '9123456780',
    email: 'arjun.reddy@example.com',
    occupation: 'Business',
    employer: 'Reddy Manufacturing',
    annualIncome: 5200000,
    propertyAddress: null,
    city: 'Bengaluru',
    state: 'Karnataka',
    referralSource: 'Partner',
    projectName: null,
    loanAmount: 8000000,
    requestedAmount: 8500000,
    eligibleAmount: 8200000,
    sanctionAmount: 8000000,
    disbursementAmount: 8000000,
    interestRate: 11.25,
    tenureMonths: 60,
    emiAmount: 174800,
    bankApplicationNumber: 'ICICI-BL-77321',
    loanAccountNumber: 'ICIC0007788123',
    expectedSanctionDate: daysAgo(20),
    expectedDisbursementDate: daysAgo(5),
    expectedRevenue: revenueBase3,
    expectedCommission: c3Stakeholders.find((s) => s.stakeholderType === 'PARTNER')?.amount ?? 38000,
    revenueGenerated: revenueBase3,
    gstAmount: Math.round(revenueBase3 * 0.18),
    tdsAmount: Math.round(revenueBase3 * 0.05),
    netRevenue: revenueBase3 + Math.round(revenueBase3 * 0.18) - Math.round(revenueBase3 * 0.05),
    companyMargin: Math.round(revenueBase3 * 0.3),
    employeeIncentiveTotal: Math.round(revenueBase3 * 0.15),
    approvalStatus: 'APPROVED',
    paymentStatus: 'PAID',
    aiEligibilityScore: 88,
    aiRiskScore: 22,
    aiBankRecommendation: 'ICICI BL — strong cashflow',
    aiCaseSummary: 'Business loan disbursed; partner commission paid.',
    remarks: 'Disbursed to current account',
    internalNotes: 'Commission already booked in finance ledger FY26-Q1',
    metadata: { seed: true, commissionGenerated: true },
    version: 4,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
    createdById: SEED_EMPLOYEE,
    updatedById: SEED_EMPLOYEE,
    deletedAt: null,
    deletedById: null,
    timeline: appendTimeline(case3Id, [
      { stage: 'LEAD_CREATED', daysAgo: 45 },
      { stage: 'ASSIGNED', daysAgo: 44 },
      { stage: 'ELIGIBILITY', daysAgo: 42 },
      { stage: 'DOCUMENT_COLLECTION', daysAgo: 38 },
      { stage: 'DOCUMENTS_VERIFIED', daysAgo: 34 },
      { stage: 'LOAN_LOGIN', daysAgo: 30 },
      { stage: 'BANK_PROCESSING', daysAgo: 26 },
      { stage: 'SANCTIONED', daysAgo: 20 },
      { stage: 'DISBURSEMENT_SCHEDULED', daysAgo: 8 },
      { stage: 'DISBURSED', daysAgo: 5, description: '₹80L disbursed' },
      { stage: 'COMMISSION_GENERATED', daysAgo: 3, description: 'Revenue distribution computed' },
    ]),
    documents: [
      {
        id: randomUUID(),
        loanCaseId: case3Id,
        documentType: 'ITR',
        fileName: 'itr-3y.pdf',
        storageKey: 'loan-cases/c3/itr.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 640_000,
        version: 1,
        uploadedById: SEED_PARTNER_B,
        uploadedByName: 'Horizon Connectors',
        verifiedAt: daysAgo(34),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(38),
      },
      {
        id: randomUUID(),
        loanCaseId: case3Id,
        documentType: 'DISBURSEMENT_LETTER',
        fileName: 'icici-disbursement.pdf',
        storageKey: 'loan-cases/c3/disbursement.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 180_000,
        version: 1,
        uploadedById: SEED_EMPLOYEE,
        uploadedByName: 'Rahul Sharma',
        verifiedAt: daysAgo(5),
        verifiedById: SEED_EMPLOYEE,
        createdAt: daysAgo(5),
      },
    ],
    stakeholders: c3Stakeholders,
    approvals: buildApprovalChain(case3Id).map((a) => ({
      ...a,
      status: 'APPROVED' as const,
      actedAt: daysAgo(4),
      actedByName: a.step,
      comment: 'Approved',
    })),
    tasks: [
      {
        id: randomUUID(),
        loanCaseId: case3Id,
        title: 'Confirm partner payout',
        description: 'UTR shared with partner',
        priority: 'LOW',
        status: 'COMPLETED',
        dueAt: daysAgo(1),
        assignedToId: SEED_EMPLOYEE,
        assignedToName: 'Finance Desk',
        completedAt: daysAgo(1),
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
      },
    ],
    activities: [
      {
        id: randomUUID(),
        loanCaseId: case3Id,
        action: 'CASE_SEEDED',
        detail: 'Demo business loan case with commission',
        userId: SEED_EMPLOYEE,
        userName: 'System',
        createdAt: daysAgo(45),
      },
      {
        id: randomUUID(),
        loanCaseId: case3Id,
        action: 'COMMISSION_PAID',
        detail: 'Partner share marked PAID',
        userId: SEED_EMPLOYEE,
        userName: 'Finance Desk',
        createdAt: daysAgo(2),
      },
    ],
  });

  cases.set(case1.id, case1);
  cases.set(case2.id, case2);
  cases.set(case3.id, case3);
  syncCaseSeqFromExisting();

  const rule1: LoanRevenueRule = {
    id: 'd1000000-0000-4000-8000-000000000001',
    name: 'HDFC Home Loan Standard',
    lenderName: 'HDFC Bank',
    lenderId: null,
    product: 'HOME_LOAN',
    revenuePercent: 1.25,
    gstPercent: 18,
    tdsPercent: 5,
    platformSharePercent: 0,
    partnerSharePercent: 40,
    employeeSharePercent: 15,
    teamSharePercent: 10,
    managerSharePercent: 5,
    companySharePercent: 30,
    isActive: true,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    createdById: SEED_EMPLOYEE,
  };
  const rule2: LoanRevenueRule = {
    id: 'd1000000-0000-4000-8000-000000000002',
    name: 'Bajaj LAP Standard',
    lenderName: 'Bajaj Housing Finance',
    lenderId: null,
    product: 'LOAN_AGAINST_PROPERTY',
    revenuePercent: 1.5,
    gstPercent: 18,
    tdsPercent: 5,
    platformSharePercent: 0,
    partnerSharePercent: 40,
    employeeSharePercent: 15,
    teamSharePercent: 10,
    managerSharePercent: 5,
    companySharePercent: 30,
    isActive: true,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    createdById: SEED_EMPLOYEE,
  };
  revenueRules.set(rule1.id, rule1);
  revenueRules.set(rule2.id, rule2);
}

export function toPartnerView(loanCase: LoanCase, partnerId: string): PartnerLoanCaseView {
  const {
    internalNotes: _internalNotes,
    companyMargin: _companyMargin,
    employeeIncentiveTotal: _employeeIncentiveTotal,
    gstAmount: _gstAmount,
    tdsAmount: _tdsAmount,
    netRevenue: _netRevenue,
    revenueGenerated: _revenueGenerated,
    stakeholders,
    ...rest
  } = loanCase;

  const partnerStakeholders = stakeholders.filter(
    (s) =>
      s.stakeholderType === 'PARTNER' &&
      (s.stakeholderRefId === partnerId || loanCase.partnerId === partnerId),
  );

  const paidCommission = partnerStakeholders
    .filter((s) => s.paymentStatus === 'PAID')
    .reduce((sum, s) => sum + s.amount, 0);
  const expectedCommission =
    rest.expectedCommission ?? partnerStakeholders.reduce((s, r) => s + r.amount, 0);
  const pendingCommission = Math.max(0, Math.round((expectedCommission - paidCommission) * 100) / 100);

  return {
    ...rest,
    stakeholders: partnerStakeholders,
    expectedCommission,
    paidCommission,
    pendingCommission,
    myCommission: {
      expected: expectedCommission,
      pending: pendingCommission,
      paid: paidCommission,
    },
  };
}

export function listAllCases(): LoanCase[] {
  return Array.from(cases.values()).filter((c) => !c.deletedAt);
}

export function getCaseById(id: string): LoanCase | undefined {
  const c = cases.get(id);
  if (!c || c.deletedAt) return undefined;
  return c;
}

export function saveCase(loanCase: LoanCase): LoanCase {
  cases.set(loanCase.id, loanCase);
  return loanCase;
}

export function deleteCase(id: string, deletedById?: string): boolean {
  const existing = cases.get(id);
  if (!existing || existing.deletedAt) return false;
  cases.set(id, {
    ...existing,
    deletedAt: new Date().toISOString(),
    deletedById: deletedById ?? null,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export function listAllRevenueRules(): LoanRevenueRule[] {
  return Array.from(revenueRules.values());
}

export function getRevenueRuleById(id: string): LoanRevenueRule | undefined {
  return revenueRules.get(id);
}

export function saveRevenueRule(rule: LoanRevenueRule): LoanRevenueRule {
  revenueRules.set(rule.id, rule);
  return rule;
}

export function pushTimeline(
  loanCase: LoanCase,
  event: Omit<LoanCaseTimelineEvent, 'id' | 'loanCaseId' | 'createdAt'> & { createdAt?: string },
): LoanCaseTimelineEvent {
  const row: LoanCaseTimelineEvent = {
    id: randomUUID(),
    loanCaseId: loanCase.id,
    stage: event.stage,
    title: event.title,
    description: event.description ?? null,
    performedBy: event.performedBy ?? null,
    performedById: event.performedById ?? null,
    metadata: event.metadata ?? null,
    createdAt: event.createdAt ?? new Date().toISOString(),
  };
  loanCase.timeline.push(row);
  return row;
}

export function pushActivity(
  loanCase: LoanCase,
  action: string,
  detail: string | null | undefined,
  ctx?: RequestContext,
  metadata?: Record<string, unknown> | null,
): LoanCaseActivity {
  const row: LoanCaseActivity = {
    id: randomUUID(),
    loanCaseId: loanCase.id,
    action,
    detail: detail ?? null,
    userId: ctx?.actorId ?? null,
    userName: ctx?.actorName ?? null,
    ipAddress: ctx?.ipAddress ?? null,
    metadata: metadata ?? null,
    createdAt: new Date().toISOString(),
  };
  loanCase.activities.push(row);
  return row;
}

export function cloneCase(loanCase: LoanCase): LoanCase {
  return {
    ...loanCase,
    timeline: [...loanCase.timeline],
    documents: [...loanCase.documents],
    stakeholders: loanCase.stakeholders.map((s) => ({ ...s })),
    approvals: loanCase.approvals.map((a) => ({ ...a })),
    tasks: [...loanCase.tasks],
    activities: [...loanCase.activities],
    metadata: loanCase.metadata ? { ...loanCase.metadata } : null,
  };
}

/** Test/reset helper */
export function resetStore(): void {
  cases.clear();
  revenueRules.clear();
  caseSeq = 0;
  seeded = false;
}

seedCases();
