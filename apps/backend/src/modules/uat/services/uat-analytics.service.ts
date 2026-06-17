import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { listUatTemplatesQuerySchema, uatAnalyticsQuerySchema, uatReportQuerySchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { prisma } from '../../../config/database.js';
import { ValidationError, NotFoundError } from '../../../shared/errors/app-error.js';
import { UAT_BUSINESS_FLOWS, UAT_TEST_CASE_TYPES } from '../constants/uat.constants.js';
import { uatRepository } from '../repositories/uat.repository.js';

import { uatSignoffService } from './uat-signoff.service.js';

type UatAnalyticsQuery = z.infer<typeof uatAnalyticsQuerySchema>;
type UatReportQuery = z.infer<typeof uatReportQuerySchema>;
type ListUatTemplatesQuery = z.infer<typeof listUatTemplatesQuerySchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

function periodBounds(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'day':
      start.setDate(end.getDate() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }
  return { start, end };
}

export const uatAnalyticsService = {
  async dashboard(_actor: AuthenticatedUser, query: UatAnalyticsQuery) {
    const { start, end } = periodBounds(query.period);
    const from = query.fromDate ?? start;
    const to = query.toDate ?? end;

    const cycleFilter = query.cycleId ? { cycleId: query.cycleId } : {};
    const scenarioFilter = query.cycleId ? { scenario: { cycleId: query.cycleId } } : {};

    const [
      totalPlans,
      activePlans,
      totalCycles,
      activeCycles,
      totalScenarios,
      totalTestCases,
      totalExecutions,
      passedExecutions,
      failedExecutions,
      openDefects,
      criticalDefects,
      highDefects,
      pendingSignoffs,
      approvedSignoffs,
    ] = await Promise.all([
      uatRepository.plan.count({}),
      uatRepository.plan.count({ status: 'ACTIVE' }),
      uatRepository.cycle.count(query.planId ? { planId: query.planId } : {}),
      uatRepository.cycle.count({ status: 'IN_PROGRESS', ...(query.planId ? { planId: query.planId } : {}) }),
      uatRepository.scenario.count({ isActive: true, ...cycleFilter, ...(query.businessFlow ? { businessFlow: query.businessFlow } : {}) }),
      uatRepository.testCase.count({ isActive: true, ...scenarioFilter, ...(query.businessFlow ? { scenario: { businessFlow: query.businessFlow } } : {}) }),
      uatRepository.execution.count({ ...cycleFilter, createdAt: { gte: from, lte: to } }),
      uatRepository.execution.count({ ...cycleFilter, status: 'PASSED', createdAt: { gte: from, lte: to } }),
      uatRepository.execution.count({ ...cycleFilter, status: 'FAILED', createdAt: { gte: from, lte: to } }),
      uatRepository.defect.count({ status: { notIn: ['CLOSED'] } }),
      uatRepository.defect.count({ severity: 'CRITICAL', status: { notIn: ['CLOSED'] } }),
      uatRepository.defect.count({ severity: 'HIGH', status: { notIn: ['CLOSED'] } }),
      uatRepository.signoff.count({ status: 'PENDING', ...cycleFilter }),
      uatRepository.signoff.count({ status: 'APPROVED', ...cycleFilter }),
    ]);

    const moduleCoverage = await Promise.all(
      UAT_BUSINESS_FLOWS.map(async (flow) => {
        const scenarios = await uatRepository.scenario.count({
          isActive: true,
          businessFlow: flow,
          ...cycleFilter,
        });
        const testCases = await uatRepository.testCase.count({
          isActive: true,
          scenario: { businessFlow: flow, ...cycleFilter },
        });
        const executions = await uatRepository.execution.count({
          ...cycleFilter,
          testCase: { scenario: { businessFlow: flow } },
        });
        const passed = await uatRepository.execution.count({
          ...cycleFilter,
          status: 'PASSED',
          testCase: { scenario: { businessFlow: flow } },
        });
        return {
          businessFlow: flow,
          scenarios,
          testCases,
          executions,
          passed,
          coveragePercent: testCases ? Math.round((passed / testCases) * 100) : 0,
        };
      }),
    );

    const coveredModules = moduleCoverage.filter((m) => m.scenarios > 0).length;
    const businessCoveragePercent = Math.round((coveredModules / UAT_BUSINESS_FLOWS.length) * 100);

    const testTypeBreakdown = await Promise.all(
      UAT_TEST_CASE_TYPES.map(async (type) => ({
        testType: type,
        count: await uatRepository.testCase.count({
          isActive: true,
          testType: type,
          ...scenarioFilter,
        }),
      })),
    );

    const executionRate = totalTestCases ? ((passedExecutions + failedExecutions) / totalTestCases) * 100 : 0;
    const passRate = totalExecutions ? (passedExecutions / totalExecutions) * 100 : 0;
    const totalSignoffs = pendingSignoffs + approvedSignoffs;
    const signoffReadinessPercent = totalSignoffs ? (approvedSignoffs / totalSignoffs) * 100 : 0;

    let goLiveReadinessPercent = 0;
    if (query.cycleId) {
      const readiness = await uatSignoffService.readiness(query.cycleId);
      goLiveReadinessPercent = readiness.goLiveReadinessPercent;
    } else {
      goLiveReadinessPercent = Math.round((businessCoveragePercent + passRate + signoffReadinessPercent) / 3);
    }

    const qualityGateBlocked =
      criticalDefects > 0 ||
      highDefects > 5 ||
      signoffReadinessPercent < 100;

    return {
      summary: {
        totalPlans,
        activePlans,
        totalCycles,
        activeCycles,
        totalScenarios,
        totalTestCases,
        totalExecutions,
        passedExecutions,
        failedExecutions,
        openDefects,
        criticalDefects,
        highDefects,
        pendingSignoffs,
        approvedSignoffs,
        businessCoveragePercent,
        modulesCovered: coveredModules,
        totalModules: UAT_BUSINESS_FLOWS.length,
        executionRate: Math.round(executionRate * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        signoffReadinessPercent: Math.round(signoffReadinessPercent * 100) / 100,
        goLiveReadinessPercent,
        qualityGateBlocked,
      },
      moduleCoverage,
      testTypeBreakdown,
      period: { from, to },
    };
  },

  async uatSummaryReport(_actor: AuthenticatedUser, query: UatReportQuery) {
    const dashboard = await uatAnalyticsService.dashboard(_actor, {
      period: 'month',
      cycleId: query.cycleId,
      planId: query.planId,
    });
    return {
      reportType: 'UAT_SUMMARY',
      generatedAt: new Date().toISOString(),
      ...dashboard,
    };
  },

  async defectSummaryReport(_actor: AuthenticatedUser, query: UatReportQuery) {
    const where = query.cycleId
      ? { testCase: { scenario: { cycleId: query.cycleId } } }
      : {};

    const [bySeverity, byStatus, byFlow, total] = await Promise.all([
      prisma.uatDefect.groupBy({ by: ['severity'], where, _count: { id: true } }),
      prisma.uatDefect.groupBy({ by: ['status'], where, _count: { id: true } }),
      prisma.uatDefect.groupBy({ by: ['businessFlow'], where, _count: { id: true } }),
      uatRepository.defect.count(where),
    ]);

    return {
      reportType: 'DEFECT_SUMMARY',
      generatedAt: new Date().toISOString(),
      total,
      bySeverity,
      byStatus,
      byFlow,
    };
  },

  async moduleReadinessReport(_actor: AuthenticatedUser, query: UatReportQuery) {
    const dashboard = await uatAnalyticsService.dashboard(_actor, {
      period: 'month',
      cycleId: query.cycleId,
      planId: query.planId,
    });
    return {
      reportType: 'MODULE_READINESS',
      generatedAt: new Date().toISOString(),
      modules: dashboard.moduleCoverage,
      businessCoveragePercent: dashboard.summary.businessCoveragePercent,
    };
  },

  async businessReadinessReport(_actor: AuthenticatedUser, query: UatReportQuery) {
    if (!query.cycleId) throw new ValidationError({ cycleId: ['cycleId is required for business readiness report'] });
    const readiness = await uatSignoffService.readiness(query.cycleId);
    return {
      reportType: 'BUSINESS_READINESS',
      generatedAt: new Date().toISOString(),
      ...readiness,
    };
  },

  async signoffReport(_actor: AuthenticatedUser, query: UatReportQuery) {
    const signoffs = await uatRepository.signoff.findMany({
      where: query.cycleId ? { cycleId: query.cycleId } : {},
      include: {
        signedBy: { select: { id: true, email: true } },
        cycle: { select: { id: true, code: true, name: true } },
      },
      orderBy: { signoffType: 'asc' },
    });
    const approved = signoffs.filter((s) => s.status === 'APPROVED').length;
    return {
      reportType: 'SIGNOFF',
      generatedAt: new Date().toISOString(),
      signoffs,
      signoffReadinessPercent: signoffs.length ? Math.round((approved / signoffs.length) * 100) : 0,
    };
  },
};

export const uatTemplateService = {
  async list(_actor: AuthenticatedUser, query: ListUatTemplatesQuery) {
    const { page, limit, businessFlow, userGroup, search } = query;
    const where = {
      isActive: true,
      ...(businessFlow ? { businessFlow } : {}),
      ...(userGroup ? { userGroup } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.template.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { businessFlow: 'asc' },
      }),
      uatRepository.template.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const template = await uatRepository.template.findById(id);
    if (!template) throw new NotFoundError('UatTemplate', id);
    return template;
  },
};
