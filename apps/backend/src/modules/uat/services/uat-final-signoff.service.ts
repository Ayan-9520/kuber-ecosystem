import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';

import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { opsHubBootstrapService } from '../../ops-hub/services/ops-hub-bootstrap.service.js';
import {
  UAT_CERTIFICATION_DOMAINS,
  UAT_FINAL_SIGNOFF_GATES,
  UAT_REVIEW_AREAS,
  UAT_STAKEHOLDER_GROUPS,
} from '../constants/uat-final-signoff.constants.js';
import { uatRepository } from '../repositories/uat.repository.js';

import { uatSignoffService } from './uat-signoff.service.js';

const ROOT = process.cwd();

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

function pct(approved: number, total: number) {
  return total ? Math.round((approved / total) * 100) : 0;
}

async function resolveCycleId(cycleId?: string) {
  if (cycleId) {
    const cycle = await uatRepository.cycle.findById(cycleId);
    if (!cycle) throw new NotFoundError('UatCycle', cycleId);
    return cycle.id;
  }
  const cycles = await uatRepository.cycle.findMany({
    where: { status: { in: ['IN_PROGRESS', 'PLANNED'] } },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  if (cycles[0]) return cycles[0].id;
  return opsHubBootstrapService.ensureUatCycle();
}

function readJsonReport(path: string): Record<string, unknown> | null {
  const full = join(ROOT, path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const uatFinalSignoffService = {
  async listApprovals(_actor: AuthenticatedUser, query: { page?: number; limit?: number; cycleId?: string; stage?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const cycleId = await resolveCycleId(query.cycleId);
    const where: Prisma.UatApprovalWhereInput = {
      cycleId,
      ...(query.stage ? { stage: query.stage as never } : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.approval.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          stakeholder: true,
          approvedBy: { select: { id: true, email: true } },
        },
      }),
      uatRepository.approval.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total), cycleId };
  },

  async submitApproval(
    actor: AuthenticatedUser,
    input: {
      cycleId: string;
      stakeholderId: string;
      stage: 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REWORK_REQUIRED';
      approverName?: string;
      approverRole?: string;
      department?: string;
      comments?: string;
      checklist?: Record<string, unknown>;
    },
  ) {
    const cycleId = await resolveCycleId(input.cycleId);
    const approval = await uatRepository.approval.findByStakeholder(cycleId, input.stakeholderId);
    if (!approval) throw new NotFoundError('UatApproval', input.stakeholderId);

    if (input.stage === 'APPROVED') {
      const gates = await uatFinalSignoffService.evaluateFinalGates(cycleId);
      if (!gates.canApproveFinalSignoff && approval.stakeholder?.stakeholderGroup === 'MANAGEMENT') {
        throw new ValidationError({ gate: gates.blockers });
      }
    }

    return uatRepository.approval.update(approval.id, {
      stage: input.stage,
      approverName: input.approverName ?? actor.email ?? undefined,
      approverRole: input.approverRole,
      department: input.department,
      comments: input.comments,
      checklist: input.checklist as Prisma.InputJsonValue | undefined,
      approvedAt: input.stage === 'APPROVED' ? new Date() : null,
      approvedBy: input.stage === 'APPROVED' ? { connect: { id: actor.id } } : { disconnect: true },
    });
  },

  async listReviews(_actor: AuthenticatedUser, query: { cycleId?: string }) {
    const cycleId = await resolveCycleId(query.cycleId);
    const items = await uatRepository.review.findMany({
      where: { cycleId },
      orderBy: { reviewArea: 'asc' },
      include: { reviewedBy: { select: { id: true, email: true } } },
    });
    return { items, cycleId };
  },

  async updateReview(
    actor: AuthenticatedUser,
    input: {
      cycleId: string;
      reviewArea: string;
      stage: 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REWORK_REQUIRED';
      score?: number;
      comments?: string;
      checklist?: Record<string, unknown>;
      findings?: Record<string, unknown>;
    },
  ) {
    const cycleId = await resolveCycleId(input.cycleId);
    return uatRepository.review.upsert(cycleId, input.reviewArea, {
      cycle: { connect: { id: cycleId } },
      reviewArea: input.reviewArea as never,
      stage: input.stage,
      score: input.score ?? 0,
      comments: input.comments,
      checklist: input.checklist as Prisma.InputJsonValue | undefined,
      findings: input.findings as Prisma.InputJsonValue | undefined,
      reviewedAt: ['APPROVED', 'REJECTED'].includes(input.stage) ? new Date() : null,
      reviewedBy: { connect: { id: actor.id } },
    }, {
      stage: input.stage,
      score: input.score,
      comments: input.comments,
      checklist: input.checklist as Prisma.InputJsonValue | undefined,
      findings: input.findings as Prisma.InputJsonValue | undefined,
      reviewedAt: ['APPROVED', 'REJECTED'].includes(input.stage) ? new Date() : null,
      reviewedBy: { connect: { id: actor.id } },
    });
  },

  async listRisks(_actor: AuthenticatedUser, query: { page?: number; limit?: number; cycleId?: string; severity?: string; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const cycleId = await resolveCycleId(query.cycleId);
    const where: Prisma.UatRiskWhereInput = {
      cycleId,
      ...(query.severity ? { severity: query.severity as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.risk.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        include: {
          owner: { select: { id: true, email: true } },
          createdBy: { select: { id: true, email: true } },
        },
      }),
      uatRepository.risk.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total), cycleId };
  },

  async createRisk(actor: AuthenticatedUser, input: {
    cycleId: string;
    code: string;
    title: string;
    description: string;
    severity?: string;
    reviewArea?: string;
    mitigation?: string;
  }) {
    const cycleId = await resolveCycleId(input.cycleId);
    return uatRepository.risk.create({
      cycle: { connect: { id: cycleId } },
      code: input.code,
      title: input.title,
      description: input.description,
      severity: (input.severity ?? 'MEDIUM') as never,
      reviewArea: input.reviewArea as never | undefined,
      mitigation: input.mitigation,
      createdBy: { connect: { id: actor.id } },
    });
  },

  async addComment(actor: AuthenticatedUser, input: {
    cycleId: string;
    targetType: string;
    targetId: string;
    body: string;
  }) {
    const cycleId = await resolveCycleId(input.cycleId);
    return uatRepository.comment.create({
      cycle: { connect: { id: cycleId } },
      targetType: input.targetType as never,
      targetId: input.targetId,
      body: input.body,
      author: { connect: { id: actor.id } },
    });
  },

  async evaluateFinalGates(cycleId: string) {
    const [qualityGate, signoffs, approvals, criticalRisks] = await Promise.all([
      uatSignoffService.checkQualityGates(cycleId),
      uatRepository.signoff.findMany({ where: { cycleId } }),
      uatRepository.approval.findManyWithStakeholder({ cycleId }),
      uatRepository.risk.count({ cycleId, severity: 'CRITICAL', status: { notIn: ['CLOSED', 'MITIGATED'] } }),
    ]);

    const securityReport = readJsonReport('security-testing/reports/security-coverage-report.json');
    const securityScan = readJsonReport('security-testing/reports/security-scan-report.json');
    const enterpriseAudit = existsSync(join(ROOT, 'docs/ENTERPRISE_AUDIT_REPORT.md'));

    const blockers: string[] = [...qualityGate.blockers];
    if (criticalRisks > 0) blockers.push(`${criticalRisks} critical UAT risk(s) open`);
    if (securityReport?.criticalFindings && (securityReport.criticalFindings as unknown[]).length > 0) {
      blockers.push('Critical security findings in penetration test report');
    }
    if (securityScan && (securityScan.criticalCount as number) > 0) {
      blockers.push('Critical dependency vulnerabilities');
    }
    if (!enterpriseAudit) blockers.push('Production readiness audit report missing');

    const requiredApprovals = approvals.filter((a) => a.stakeholder?.isRequired);
    const pendingApprovals = requiredApprovals.filter((a) => a.stage !== 'APPROVED');
    if (pendingApprovals.length) {
      blockers.push(`${pendingApprovals.length} stakeholder approval(s) pending`);
    }

    const finalSignoff = signoffs.find((s) => s.signoffType === 'FINAL_UAT');
    if (!finalSignoff || finalSignoff.status !== 'APPROVED') {
      blockers.push('FINAL_UAT signoff not approved');
    }

    const gates = UAT_FINAL_SIGNOFF_GATES.map((g) => {
      let passed = true;
      let detail = 'OK';
      switch (g.check) {
        case 'defects':
          passed = qualityGate.criticalDefects <= 0;
          detail = `${qualityGate.criticalDefects} critical defects`;
          break;
        case 'security':
          passed = !(securityReport?.criticalFindings && (securityReport.criticalFindings as unknown[]).length);
          detail = passed ? 'Security gate clear' : 'Security findings present';
          break;
        case 'production':
          passed = enterpriseAudit;
          detail = enterpriseAudit ? 'Audit report present' : 'Missing audit report';
          break;
        case 'golive':
          passed = existsSync(join(ROOT, 'deployment/go-live/GO_LIVE_FRAMEWORK.md'));
          detail = 'Go-Live framework configured';
          break;
        case 'approvals':
          passed = pendingApprovals.length === 0;
          detail = `${requiredApprovals.length - pendingApprovals.length}/${requiredApprovals.length} approved`;
          break;
        case 'signoff':
          passed = finalSignoff?.status === 'APPROVED';
          detail = finalSignoff?.status ?? 'PENDING';
          break;
      }
      return { ...g, passed, detail };
    });

    return {
      canApproveFinalSignoff: blockers.length === 0,
      blockers,
      gates,
      qualityGate,
    };
  },

  async getStatus(_actor: AuthenticatedUser, query: { cycleId?: string }) {
    const cycleId = await resolveCycleId(query.cycleId);
    const [cycle, readiness, gates, approvals, reviews, risks, signoffs, stakeholders] = await Promise.all([
      uatRepository.cycle.findById(cycleId),
      uatSignoffService.readiness(cycleId),
      uatFinalSignoffService.evaluateFinalGates(cycleId),
      uatRepository.approval.findManyWithStakeholder({ cycleId }),
      uatRepository.review.findMany({ where: { cycleId } }),
      uatRepository.risk.findMany({ where: { cycleId } }),
      uatRepository.signoff.findMany({ where: { cycleId } }),
      uatRepository.stakeholder.findMany({ where: { cycleId }, orderBy: { sortOrder: 'asc' } }),
    ]);

    const approvalApproved = approvals.filter((a) => a.stage === 'APPROVED').length;
    const reviewApproved = reviews.filter((r) => r.stage === 'APPROVED').length;
    const openCriticalRisks = risks.filter((r) => r.severity === 'CRITICAL' && !['CLOSED', 'MITIGATED'].includes(r.status)).length;

    const businessGroups = ['SALES', 'RELATIONSHIP_MANAGER', 'CUSTOMER_JOURNEY', 'DSA_PARTNER', 'CREDIT', 'COMPLIANCE', 'SUPPORT'];
    const techGroups = ['TECHNOLOGY'];
    const opsGroups = ['OPERATIONS'];
    const mgmtGroups = ['MANAGEMENT'];

    const cert = {
      business: pct(
        approvals.filter((a) => businessGroups.includes(a.stakeholder?.stakeholderGroup ?? '') && a.stage === 'APPROVED').length,
        approvals.filter((a) => businessGroups.includes(a.stakeholder?.stakeholderGroup ?? '')).length,
      ),
      technology: pct(
        approvals.filter((a) => techGroups.includes(a.stakeholder?.stakeholderGroup ?? '') && a.stage === 'APPROVED').length,
        Math.max(1, approvals.filter((a) => techGroups.includes(a.stakeholder?.stakeholderGroup ?? '')).length),
      ),
      operations: pct(
        approvals.filter((a) => opsGroups.includes(a.stakeholder?.stakeholderGroup ?? '') && a.stage === 'APPROVED').length,
        Math.max(1, approvals.filter((a) => opsGroups.includes(a.stakeholder?.stakeholderGroup ?? '')).length),
      ),
      security: reviews.find((r) => r.reviewArea === 'SECURITY')?.stage === 'APPROVED' ? 100 : reviews.find((r) => r.reviewArea === 'SECURITY')?.score ?? 0,
      management: pct(
        approvals.filter((a) => mgmtGroups.includes(a.stakeholder?.stakeholderGroup ?? '') && a.stage === 'APPROVED').length,
        Math.max(1, approvals.filter((a) => mgmtGroups.includes(a.stakeholder?.stakeholderGroup ?? '')).length),
      ),
    };

    const goLiveApprovalPct = Math.round(
      (cert.business + cert.technology + cert.operations + cert.security + cert.management) / UAT_CERTIFICATION_DOMAINS.length,
    );

    const finalSignoff = signoffs.find((s) => s.signoffType === 'FINAL_UAT');
    let finalUatStatus: 'NOT APPROVED' | 'PARTIALLY APPROVED' | 'APPROVED FOR GO-LIVE' = 'NOT APPROVED';
    if (goLiveApprovalPct >= 85 && gates.canApproveFinalSignoff && finalSignoff?.status === 'APPROVED') {
      finalUatStatus = 'APPROVED FOR GO-LIVE';
    } else if (goLiveApprovalPct >= 50 || approvalApproved > 0) {
      finalUatStatus = 'PARTIALLY APPROVED';
    }

    return {
      cycleId,
      cycleName: cycle?.name,
      readiness,
      gates,
      stakeholders,
      approvals,
      reviews,
      risks,
      signoffs,
      reviewAreas: UAT_REVIEW_AREAS,
      stakeholderGroups: UAT_STAKEHOLDER_GROUPS,
      certification: cert,
      scores: {
        businessApprovalPercent: cert.business,
        technologyApprovalPercent: cert.technology,
        operationsApprovalPercent: cert.operations,
        securityApprovalPercent: cert.security,
        managementApprovalPercent: cert.management,
        goLiveApprovalPercent: goLiveApprovalPct,
        reviewCompletionPercent: pct(reviewApproved, reviews.length || UAT_REVIEW_AREAS.length),
        stakeholderApprovalPercent: pct(approvalApproved, approvals.length || UAT_STAKEHOLDER_GROUPS.length),
      },
      openCriticalRisks,
      finalUatStatus,
      launchAuthorizationStatus: finalUatStatus === 'APPROVED FOR GO-LIVE' ? 'AUTHORIZED' : 'NOT AUTHORIZED',
      canSignoff: gates.canApproveFinalSignoff,
    };
  },

  async getReports(_actor: AuthenticatedUser, query: { cycleId?: string }) {
    const status = await uatFinalSignoffService.getStatus(_actor, query);
    const now = new Date().toISOString();
    return {
      uatSignoffReport: {
        reportType: 'UAT_SIGNOFF',
        generatedAt: now,
        summary: `UAT signoff ${status.finalUatStatus} — ${status.scores.goLiveApprovalPercent}% go-live approval`,
        details: status,
      },
      businessApprovalReport: {
        reportType: 'BUSINESS_APPROVAL',
        score: status.scores.businessApprovalPercent,
        generatedAt: now,
      },
      stakeholderApprovalReport: {
        reportType: 'STAKEHOLDER_APPROVAL',
        score: status.scores.stakeholderApprovalPercent,
        generatedAt: now,
        stakeholders: status.stakeholders,
        approvals: status.approvals,
      },
      launchApprovalReport: {
        reportType: 'LAUNCH_APPROVAL',
        score: status.scores.goLiveApprovalPercent,
        authorization: status.launchAuthorizationStatus,
        generatedAt: now,
        certification: status.certification,
      },
    };
  },
};
