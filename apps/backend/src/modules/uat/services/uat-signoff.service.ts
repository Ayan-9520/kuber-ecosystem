import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { listUatSignoffsQuerySchema, submitUatSignoffSchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { UAT_QUALITY_GATES } from '../constants/uat.constants.js';
import { uatRepository } from '../repositories/uat.repository.js';

type ListUatSignoffsQuery = z.infer<typeof listUatSignoffsQuerySchema>;
type SubmitUatSignoffInput = z.infer<typeof submitUatSignoffSchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatSignoffService = {
  async list(_actor: AuthenticatedUser, query: ListUatSignoffsQuery) {
    const { page, limit, cycleId, signoffType, status } = query;
    const where = {
      ...(cycleId ? { cycleId } : {}),
      ...(signoffType ? { signoffType } : {}),
      ...(status ? { status } : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.signoff.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { signoffType: 'asc' },
        include: {
          signedBy: { select: { id: true, email: true } },
          cycle: { select: { id: true, code: true, name: true } },
        },
      }),
      uatRepository.signoff.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async submit(actor: AuthenticatedUser, input: SubmitUatSignoffInput) {
    const cycle = await uatRepository.cycle.findById(input.cycleId);
    if (!cycle) throw new NotFoundError('UatCycle', input.cycleId);

    if (input.status === 'APPROVED' && input.signoffType === 'FINAL_UAT') {
      const qualityGate = await uatSignoffService.checkQualityGates(input.cycleId);
      if (!qualityGate.canSignoff) {
        throw new ValidationError({ signoff: qualityGate.blockers });
      }
    }

    return uatRepository.signoff.upsert(
      input.cycleId,
      input.signoffType,
      {
        cycle: { connect: { id: input.cycleId } },
        signoffType: input.signoffType,
        status: input.status,
        comments: input.comments,
        checklist: input.checklist ?? [],
        signedBy: { connect: { id: actor.id } },
        signedAt: new Date(),
      },
      {
        status: input.status,
        comments: input.comments,
        checklist: input.checklist ?? [],
        signedBy: { connect: { id: actor.id } },
        signedAt: new Date(),
      },
    );
  },

  async checkQualityGates(cycleId: string) {
    const [criticalCount, highCount, signoffs] = await Promise.all([
      uatRepository.defect.count({
        severity: 'CRITICAL',
        status: { notIn: ['CLOSED'] },
        testCase: { scenario: { cycleId } },
      }),
      uatRepository.defect.count({
        severity: 'HIGH',
        status: { notIn: ['CLOSED'] },
        testCase: { scenario: { cycleId } },
      }),
      uatRepository.signoff.findMany({ where: { cycleId } }),
    ]);

    const blockers: string[] = [];
    if (criticalCount > UAT_QUALITY_GATES.MAX_CRITICAL_DEFECTS) {
      blockers.push(`Critical defects (${criticalCount}) exceed threshold (${UAT_QUALITY_GATES.MAX_CRITICAL_DEFECTS})`);
    }
    if (highCount > UAT_QUALITY_GATES.MAX_HIGH_DEFECTS) {
      blockers.push(`High defects (${highCount}) exceed threshold (${UAT_QUALITY_GATES.MAX_HIGH_DEFECTS})`);
    }

    for (const required of UAT_QUALITY_GATES.REQUIRED_SIGNOFFS) {
      if (required === 'FINAL_UAT') continue;
      const signoff = signoffs.find((s) => s.signoffType === required);
      if (!signoff || signoff.status !== 'APPROVED') {
        blockers.push(`Missing ${required} signoff approval`);
      }
    }

    return {
      canSignoff: blockers.length === 0,
      blockers,
      criticalDefects: criticalCount,
      highDefects: highCount,
      maxCritical: UAT_QUALITY_GATES.MAX_CRITICAL_DEFECTS,
      maxHigh: UAT_QUALITY_GATES.MAX_HIGH_DEFECTS,
    };
  },

  async readiness(cycleId: string) {
    const cycle = await uatRepository.cycle.findById(cycleId);
    if (!cycle) throw new NotFoundError('UatCycle', cycleId);

    const [totalTestCases, executions, signoffs, qualityGate] = await Promise.all([
      uatRepository.testCase.count({ scenario: { cycleId }, isActive: true }),
      uatRepository.execution.findMany({ where: { cycleId } }),
      uatRepository.signoff.findMany({ where: { cycleId } }),
      uatSignoffService.checkQualityGates(cycleId),
    ]);

    const passed = executions.filter((e) => e.status === 'PASSED').length;
    const failed = executions.filter((e) => e.status === 'FAILED').length;
    const executed = executions.filter((e) => !['NOT_STARTED'].includes(e.status)).length;
    const approvedSignoffs = signoffs.filter((s) => s.status === 'APPROVED').length;

    const executionRate = totalTestCases ? (executed / totalTestCases) * 100 : 0;
    const passRate = executed ? (passed / executed) * 100 : 0;
    const signoffRate = signoffs.length ? (approvedSignoffs / signoffs.length) * 100 : 0;

    const goLiveBlockers: string[] = [...qualityGate.blockers];
    if (executionRate < 100) goLiveBlockers.push(`Test execution incomplete (${executionRate.toFixed(1)}%)`);
    if (failed > 0) goLiveBlockers.push(`${failed} test case(s) failed`);

    const finalSignoff = signoffs.find((s) => s.signoffType === 'FINAL_UAT');
    const goLiveReady = goLiveBlockers.length === 0 && finalSignoff?.status === 'APPROVED';

    return {
      cycleId,
      cycleName: cycle.name,
      totalTestCases,
      executed,
      passed,
      failed,
      executionRate: Math.round(executionRate * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      signoffRate: Math.round(signoffRate * 100) / 100,
      signoffs,
      qualityGate,
      goLiveReady,
      goLiveReadinessPercent: goLiveReady ? 100 : Math.max(0, Math.round((executionRate + passRate + signoffRate) / 3)),
      goLiveBlockers,
    };
  },
};
