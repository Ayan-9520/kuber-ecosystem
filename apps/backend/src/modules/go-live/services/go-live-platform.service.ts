import type { Prisma } from '@kuberone/database';

import { productionService } from '../../production/services/production.service.js';
import {
  APPROVAL_WORKFLOW,
  GO_LIVE_SECTIONS,
  LAUNCH_CHECKLISTS,
  QUALITY_GATES,
  READINESS_THRESHOLDS,
} from '../constants/go-live.constants.js';
import { goLiveRepository } from '../repositories/go-live.repository.js';

function scoreSection(items: { status: string; weight: number; isBlocking: boolean }[]) {
  if (!items.length) return 100;
  const total = items.reduce((s, i) => s + i.weight, 0);
  const passed = items
    .filter((i) => i.status === 'PASSED' || i.status === 'WAIVED')
    .reduce((s, i) => s + i.weight, 0);
  return Math.round((passed / total) * 100);
}

export class GoLivePlatformService {
  async evaluateQualityGates(launchExecutionId: string) {
    const productionGates = await productionService.evaluateGoLiveGates();
    const now = new Date();

    const gateResults = await Promise.all(
      QUALITY_GATES.map(async (gate) => {
        const prodGate = productionGates.gates.find((g) => g.id === gate.gateCode || g.check === gate.check);
        const passed = prodGate?.passed ?? false;
        const detail = prodGate?.detail ?? gate.label;

        await goLiveRepository.upsertGate(launchExecutionId, gate.gateCode, {
          label: gate.label,
          status: passed ? 'PASSED' : 'FAILED',
          detail,
          isBlocking: gate.isBlocking,
          evaluatedAt: now,
        });

        return { ...gate, passed, detail, status: passed ? 'PASSED' : 'FAILED' };
      }),
    );

    const blocked = gateResults.filter((g) => g.isBlocking && !g.passed);
    return {
      ready: blocked.length === 0,
      gates: gateResults,
      blockedReasons: blocked.map((g) => g.label),
    };
  }

  async getReadiness() {
    const [items] = await goLiveRepository.listChecklist({}, 0, 500);
    const launch = await goLiveRepository.getActiveLaunch();

    const sectionScores = GO_LIVE_SECTIONS.map((section) => {
      const sectionItems = items.filter((i) => i.section === section.id);
      return {
        section: section.id,
        label: section.label,
        score: scoreSection(sectionItems),
        total: sectionItems.length,
        passed: sectionItems.filter((i) => i.status === 'PASSED' || i.status === 'WAIVED').length,
        blockingFailed: sectionItems.filter((i) => i.isBlocking && i.status === 'FAILED').length,
      };
    });

    const totalWeight = GO_LIVE_SECTIONS.reduce((s, sec) => s + sec.weight, 0);
    const weightedScore = Math.round(
      sectionScores.reduce((s, sec, idx) => s + sec.score * GO_LIVE_SECTIONS[idx]!.weight, 0) / totalWeight,
    );

    let gateEvaluation = { ready: false, gates: [] as unknown[], blockedReasons: [] as string[] };
    if (launch) {
      gateEvaluation = await this.evaluateQualityGates(launch.id);
    }

    const approvals = launch?.approvals ?? [];
    const approvalsComplete = approvals.filter((a) => a.status === 'APPROVED').length;
    const approvalsTotal = approvals.length;

    const blockers: string[] = [];
    if (weightedScore < READINESS_THRESHOLDS.goLiveMinimum) {
      blockers.push(`Overall readiness ${weightedScore}% below ${READINESS_THRESHOLDS.goLiveMinimum}% threshold`);
    }
    blockers.push(...gateEvaluation.blockedReasons);
    sectionScores
      .filter((s) => s.blockingFailed > 0)
      .forEach((s) => blockers.push(`${s.label}: ${s.blockingFailed} blocking item(s) failed`));

    const allApproved = approvals.length > 0 && approvals.every((a) => a.status === 'APPROVED');

    const goLiveReady =
      weightedScore >= READINESS_THRESHOLDS.goLiveMinimum &&
      gateEvaluation.ready &&
      allApproved;

    return {
      goLiveReadinessPercent: weightedScore,
      goLiveReady,
      sectionScores,
      dimensions: {
        backend: sectionScores.find((s) => s.section === 'APPLICATION')?.score ?? 0,
        crm: sectionScores.find((s) => s.section === 'CRM')?.score ?? 0,
        customerApp: sectionScores.find((s) => s.section === 'CUSTOMER_APP')?.score ?? 0,
        dsaApp: sectionScores.find((s) => s.section === 'DSA_APP')?.score ?? 0,
        database: sectionScores.find((s) => s.section === 'DATABASE')?.score ?? 0,
        api: sectionScores.find((s) => s.section === 'API')?.score ?? 0,
        security: sectionScores.find((s) => s.section === 'SECURITY')?.score ?? 0,
        infrastructure: sectionScores.find((s) => s.section === 'INFRASTRUCTURE')?.score ?? 0,
        ai: sectionScores.find((s) => s.section === 'AI')?.score ?? 0,
        notifications: sectionScores.find((s) => s.section === 'NOTIFICATIONS')?.score ?? 0,
        compliance: sectionScores.find((s) => s.section === 'COMPLIANCE')?.score ?? 0,
        performance: sectionScores.find((s) => s.section === 'PERFORMANCE')?.score ?? 0,
      },
      qualityGates: gateEvaluation.gates,
      approvals: {
        complete: approvalsComplete,
        total: approvalsTotal,
        pending: approvals.filter((a) => a.status === 'PENDING').map((a) => a.approvalType),
        workflow: APPROVAL_WORKFLOW,
      },
      blockers,
      thresholds: READINESS_THRESHOLDS,
      launch: launch ? { id: launch.id, code: launch.code, status: launch.status } : null,
    };
  }

  async getDashboard() {
    const [readiness, reports, launch] = await Promise.all([
      this.getReadiness(),
      goLiveRepository.listReports(5),
      goLiveRepository.getActiveLaunch(),
    ]);

    const recentAudits = launch ? await goLiveRepository.listAudits(launch.id, 10) : [];

    return {
      ...readiness,
      launchExecution: launch,
      recentReports: reports,
      recentAudits,
      launchChecklists: LAUNCH_CHECKLISTS,
      approvalWorkflow: APPROVAL_WORKFLOW,
    };
  }

  async listChecklist(query: { page: number; limit: number; section?: string; status?: string }) {
    const where: Prisma.GoLiveChecklistWhereInput = {};
    if (query.section) where.section = query.section;
    if (query.status) where.status = query.status as never;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await goLiveRepository.listChecklist(where, skip, query.limit);
    return { items, total, page: query.page, limit: query.limit };
  }

  async updateChecklistItem(
    itemCode: string,
    input: { status: string; evidence?: Record<string, unknown> },
    actorId?: string,
  ) {
    const item = await goLiveRepository.findChecklistByCode(itemCode);
    if (!item) throw Object.assign(new Error('Checklist item not found'), { statusCode: 404 });

    const updated = await goLiveRepository.updateChecklist(itemCode, {
      status: input.status as never,
      evidence: input.evidence as Prisma.InputJsonValue | undefined,
      verifiedAt: ['PASSED', 'WAIVED'].includes(input.status) ? new Date() : null,
      verifiedBy: actorId ? { connect: { id: actorId } } : { disconnect: true },
    });

    const launch = await goLiveRepository.getActiveLaunch();
    if (launch) {
      await goLiveRepository.createAudit({
        action: 'CHECKLIST_UPDATE',
        compliance: 'go-live',
        actor: actorId ? { connect: { id: actorId } } : undefined,
        launchExecution: { connect: { id: launch.id } },
        details: { itemCode, status: input.status },
      });
    }

    return updated;
  }

  async listApprovals(launchExecutionId?: string) {
    const launch = launchExecutionId
      ? await goLiveRepository.findLaunchById(launchExecutionId)
      : await goLiveRepository.getActiveLaunch();
    if (!launch) return { items: [], workflow: APPROVAL_WORKFLOW };

    return {
      launchId: launch.id,
      launchCode: launch.code,
      items: launch.approvals,
      workflow: APPROVAL_WORKFLOW,
      allApproved: launch.approvals.every((a) => a.status === 'APPROVED'),
    };
  }

  async decideApproval(
    launchExecutionId: string,
    approvalType: string,
    input: { status: 'APPROVED' | 'REJECTED'; comments?: string; checklist?: Record<string, unknown> },
    actorId: string,
  ) {
    const approval = await goLiveRepository.findApproval(launchExecutionId, approvalType);
    if (!approval) throw Object.assign(new Error('Approval not found'), { statusCode: 404 });

    const updated = await goLiveRepository.updateApproval(approval.id, {
      status: input.status,
      comments: input.comments,
      checklist: input.checklist as Prisma.InputJsonValue | undefined,
      approvedAt: input.status === 'APPROVED' ? new Date() : null,
      approvedBy: { connect: { id: actorId } },
    });

    await goLiveRepository.createAudit({
      action: 'APPROVAL_DECIDE',
      compliance: 'go-live',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launchExecutionId } },
      details: { approvalType, status: input.status },
    });

    return updated;
  }

  async startLaunch(actorId: string, launchExecutionId?: string) {
    const launch = launchExecutionId
      ? await goLiveRepository.findLaunchById(launchExecutionId)
      : await goLiveRepository.getActiveLaunch();
    if (!launch) throw Object.assign(new Error('No active launch execution'), { statusCode: 404 });

    const readiness = await this.getReadiness();
    if (!readiness.goLiveReady) {
      throw Object.assign(new Error(`Go-Live blocked: ${readiness.blockers.join('; ')}`), { statusCode: 422 });
    }

    const updated = await goLiveRepository.updateLaunch(launch.id, {
      status: 'IN_PROGRESS',
      currentStep: 'PRODUCTION_FREEZE',
      launchedAt: new Date(),
      readinessPct: readiness.goLiveReadinessPercent,
      blockers: readiness.blockers,
      executedBy: { connect: { id: actorId } },
    });

    await goLiveRepository.createWarRoom({
      launchExecution: { connect: { id: launch.id } },
      code: `WR-${launch.code}`,
      status: 'STANDBY',
      teams: [
        { id: 'launch', label: 'Launch Team' },
        { id: 'engineering', label: 'Engineering Team' },
        { id: 'operations', label: 'Operations Team' },
        { id: 'security', label: 'Security Team' },
        { id: 'management', label: 'Management Team' },
      ],
      communicationMatrix: [
        { severity: 'SEV_1', channels: ['email', 'sms', 'whatsapp'] },
        { severity: 'SEV_2', channels: ['email', 'sms'] },
      ],
      bridgeUrl: 'https://bridge.kuberone.com/go-live',
    });

    await goLiveRepository.createEvent({
      launchExecution: { connect: { id: launch.id } },
      eventType: 'SYSTEM',
      title: 'Launch execution started',
      message: `Go-Live command center activated at ${readiness.goLiveReadinessPercent}% readiness`,
      actor: { connect: { id: actorId } },
    });

    await goLiveRepository.createAudit({
      action: 'LAUNCH_START',
      compliance: 'go-live',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launch.id } },
      details: { readinessPct: readiness.goLiveReadinessPercent },
    });

    return { launch: updated, readiness };
  }

  async completeLaunch(
    launchExecutionId: string,
    input: { rolledBack: boolean; notes?: string },
    actorId: string,
  ) {
    const launch = await goLiveRepository.findLaunchById(launchExecutionId);
    if (!launch) throw Object.assign(new Error('Launch not found'), { statusCode: 404 });

    const status = input.rolledBack ? 'ROLLED_BACK' : 'COMPLETED';
    const updated = await goLiveRepository.updateLaunch(launchExecutionId, {
      status,
      rolledBackAt: input.rolledBack ? new Date() : undefined,
      metadata: { ...(launch.metadata as object), completionNotes: input.notes },
    });

    await goLiveRepository.createAudit({
      action: input.rolledBack ? 'LAUNCH_ROLLBACK' : 'LAUNCH_COMPLETE',
      compliance: 'go-live',
      actor: { connect: { id: actorId } },
      launchExecution: { connect: { id: launchExecutionId } },
      details: { notes: input.notes },
    });

    return updated;
  }

  async getReports() {
    const readiness = await this.getReadiness();
    const approvals = await this.listApprovals();
    const now = new Date().toISOString();

    const readinessReport = {
      reportType: 'READINESS',
      score: readiness.goLiveReadinessPercent,
      readinessPct: readiness.goLiveReadinessPercent,
      summary: `Go-Live readiness ${readiness.goLiveReadinessPercent}% — ${readiness.goLiveReady ? 'READY' : 'NOT READY'}`,
      generatedAt: now,
      details: readiness,
    };

    const approvalReport = {
      reportType: 'APPROVAL',
      score: approvals.allApproved ? 100 : Math.round((approvals.items.filter((a) => a.status === 'APPROVED').length / Math.max(approvals.items.length, 1)) * 100),
      readinessPct: approvals.allApproved ? 100 : 0,
      summary: `${approvals.items.filter((a) => a.status === 'APPROVED').length}/${approvals.items.length} approvals complete`,
      generatedAt: now,
      details: approvals,
    };

    const releaseReport = {
      reportType: 'RELEASE',
      score: (readiness.qualityGates as { passed?: boolean }[]).filter((g) => g.passed).length * Math.round(100 / QUALITY_GATES.length),
      readinessPct: readiness.goLiveReadinessPercent,
      summary: 'Release gate evaluation',
      generatedAt: now,
      details: { gates: readiness.qualityGates },
    };

    const riskReport = {
      reportType: 'RISK',
      score: Math.max(0, 100 - readiness.blockers.length * 15),
      readinessPct: readiness.goLiveReadinessPercent,
      summary: `${readiness.blockers.length} blocker(s) identified`,
      generatedAt: now,
      details: { blockers: readiness.blockers, sectionScores: readiness.sectionScores.filter((s) => s.score < READINESS_THRESHOLDS.sectionMinimum) },
    };

    await Promise.all([
      goLiveRepository.createReport({ reportType: 'READINESS', score: readinessReport.score, readinessPct: readinessReport.readinessPct, summary: readinessReport.summary, details: readinessReport.details as never }),
      goLiveRepository.createReport({ reportType: 'APPROVAL', score: approvalReport.score, readinessPct: approvalReport.readinessPct, summary: approvalReport.summary, details: approvalReport.details as never }),
      goLiveRepository.createReport({ reportType: 'RELEASE', score: releaseReport.score, readinessPct: releaseReport.readinessPct, summary: releaseReport.summary, details: releaseReport.details as never }),
      goLiveRepository.createReport({ reportType: 'RISK', score: riskReport.score, readinessPct: riskReport.readinessPct, summary: riskReport.summary, details: riskReport.details as never }),
    ]);

    return { readinessReport, approvalReport, releaseReport, riskReport };
  }

  async handleWebhook(input: {
    event: string;
    itemCode?: string;
    gateCode?: string;
    launchCode?: string;
    details?: Record<string, unknown>;
  }) {
    const launch = input.launchCode
      ? await goLiveRepository.findLaunchByCode(input.launchCode)
      : await goLiveRepository.getActiveLaunch();

    if (input.event === 'CHECKLIST_PASSED' && input.itemCode) {
      await goLiveRepository.updateChecklist(input.itemCode, { status: 'PASSED', verifiedAt: new Date() });
    }

    if (launch && input.event === 'GATE_PASSED' && input.gateCode) {
      await goLiveRepository.upsertGate(launch.id, input.gateCode, {
        label: input.gateCode,
        status: 'PASSED',
        evaluatedAt: new Date(),
      });
    }

    if (launch) {
      await goLiveRepository.createAudit({
        action: 'GATE_EVALUATE',
        compliance: 'go-live',
        launchExecution: { connect: { id: launch.id } },
        details: input as Prisma.InputJsonValue,
      });
    }

    return { accepted: true, launchId: launch?.id };
  }
}

export const goLivePlatformService = new GoLivePlatformService();
