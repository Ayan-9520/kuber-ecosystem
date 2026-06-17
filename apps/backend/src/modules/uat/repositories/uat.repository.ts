import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const approvalWithStakeholderInclude = {
  stakeholder: true,
  approvedBy: { select: { id: true, email: true } },
} satisfies Prisma.UatApprovalInclude;

export type UatApprovalWithStakeholder = Prisma.UatApprovalGetPayload<{
  include: typeof approvalWithStakeholderInclude;
}>;

export const uatRepository = {
  plan: {
    findMany: (args: Prisma.UatPlanFindManyArgs) => prisma.uatPlan.findMany(args),
    count: (where: Prisma.UatPlanWhereInput) => prisma.uatPlan.count({ where }),
    findById: (id: string) =>
      prisma.uatPlan.findUnique({
        where: { id },
        include: {
          owner: { select: { id: true, email: true } },
          createdBy: { select: { id: true, email: true } },
          cycles: { orderBy: { createdAt: 'desc' } },
        },
      }),
    findByCode: (code: string) => prisma.uatPlan.findUnique({ where: { code } }),
    create: (data: Prisma.UatPlanCreateInput) => prisma.uatPlan.create({ data }),
    update: (id: string, data: Prisma.UatPlanUpdateInput) => prisma.uatPlan.update({ where: { id }, data }),
  },

  cycle: {
    findMany: (args: Prisma.UatCycleFindManyArgs) => prisma.uatCycle.findMany(args),
    count: (where: Prisma.UatCycleWhereInput) => prisma.uatCycle.count({ where }),
    findById: (id: string) =>
      prisma.uatCycle.findUnique({
        where: { id },
        include: {
          plan: { select: { id: true, code: true, name: true } },
          createdBy: { select: { id: true, email: true } },
          signoffs: true,
          _count: { select: { scenarios: true, executions: true } },
        },
      }),
    findByCode: (code: string) => prisma.uatCycle.findUnique({ where: { code } }),
    create: (data: Prisma.UatCycleCreateInput) => prisma.uatCycle.create({ data }),
    update: (id: string, data: Prisma.UatCycleUpdateInput) => prisma.uatCycle.update({ where: { id }, data }),
  },

  scenario: {
    findMany: (args: Prisma.UatScenarioFindManyArgs) => prisma.uatScenario.findMany(args),
    count: (where: Prisma.UatScenarioWhereInput) => prisma.uatScenario.count({ where }),
    findById: (id: string) =>
      prisma.uatScenario.findUnique({
        where: { id },
        include: {
          cycle: { select: { id: true, code: true, name: true } },
          testCases: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { testCases: true } },
        },
      }),
    findByCode: (code: string) => prisma.uatScenario.findUnique({ where: { code } }),
    create: (data: Prisma.UatScenarioCreateInput) => prisma.uatScenario.create({ data }),
    createMany: (data: Prisma.UatScenarioCreateManyInput[]) => prisma.uatScenario.createMany({ data }),
  },

  testCase: {
    findMany: (args: Prisma.UatTestCaseFindManyArgs) => prisma.uatTestCase.findMany(args),
    count: (where: Prisma.UatTestCaseWhereInput) => prisma.uatTestCase.count({ where }),
    findById: (id: string) =>
      prisma.uatTestCase.findUnique({
        where: { id },
        include: {
          scenario: {
            select: { id: true, code: true, name: true, businessFlow: true, userGroup: true, cycleId: true },
          },
        },
      }),
    findByCode: (code: string) => prisma.uatTestCase.findUnique({ where: { code } }),
    create: (data: Prisma.UatTestCaseCreateInput) => prisma.uatTestCase.create({ data }),
    createMany: (data: Prisma.UatTestCaseCreateManyInput[]) => prisma.uatTestCase.createMany({ data }),
  },

  execution: {
    findMany: (args: Prisma.UatExecutionFindManyArgs) => prisma.uatExecution.findMany(args),
    count: (where: Prisma.UatExecutionWhereInput) => prisma.uatExecution.count({ where }),
    findById: (id: string) =>
      prisma.uatExecution.findUnique({
        where: { id },
        include: {
          testCase: {
            include: { scenario: { select: { id: true, name: true, businessFlow: true } } },
          },
          executedBy: { select: { id: true, email: true } },
          cycle: { select: { id: true, code: true, name: true } },
        },
      }),
    findByCycleAndTestCase: (cycleId: string, testCaseId: string) =>
      prisma.uatExecution.findUnique({ where: { cycleId_testCaseId: { cycleId, testCaseId } } }),
    create: (data: Prisma.UatExecutionCreateInput) => prisma.uatExecution.create({ data }),
    update: (id: string, data: Prisma.UatExecutionUpdateInput) => prisma.uatExecution.update({ where: { id }, data }),
    upsert: (cycleId: string, testCaseId: string, create: Prisma.UatExecutionCreateInput, update: Prisma.UatExecutionUpdateInput) =>
      prisma.uatExecution.upsert({
        where: { cycleId_testCaseId: { cycleId, testCaseId } },
        create,
        update,
      }),
  },

  defect: {
    findMany: (args: Prisma.UatDefectFindManyArgs) => prisma.uatDefect.findMany(args),
    count: (where: Prisma.UatDefectWhereInput) => prisma.uatDefect.count({ where }),
    findById: (id: string) =>
      prisma.uatDefect.findUnique({
        where: { id },
        include: {
          testCase: { select: { id: true, code: true, title: true } },
          assignedTo: { select: { id: true, email: true } },
          reportedBy: { select: { id: true, email: true } },
          resolvedBy: { select: { id: true, email: true } },
        },
      }),
    findByCode: (code: string) => prisma.uatDefect.findUnique({ where: { code } }),
    create: (data: Prisma.UatDefectCreateInput) => prisma.uatDefect.create({ data }),
    update: (id: string, data: Prisma.UatDefectUpdateInput) => prisma.uatDefect.update({ where: { id }, data }),
  },

  signoff: {
    findMany: (args: Prisma.UatSignoffFindManyArgs) => prisma.uatSignoff.findMany(args),
    count: (where: Prisma.UatSignoffWhereInput) => prisma.uatSignoff.count({ where }),
    findByCycleAndType: (cycleId: string, signoffType: string) =>
      prisma.uatSignoff.findUnique({ where: { cycleId_signoffType: { cycleId, signoffType: signoffType as never } } }),
    create: (data: Prisma.UatSignoffCreateInput) => prisma.uatSignoff.create({ data }),
    upsert: (cycleId: string, signoffType: string, create: Prisma.UatSignoffCreateInput, update: Prisma.UatSignoffUpdateInput) =>
      prisma.uatSignoff.upsert({
        where: { cycleId_signoffType: { cycleId, signoffType: signoffType as never } },
        create,
        update,
      }),
  },

  template: {
    findMany: (args: Prisma.UatTemplateFindManyArgs) => prisma.uatTemplate.findMany(args),
    count: (where: Prisma.UatTemplateWhereInput) => prisma.uatTemplate.count({ where }),
    findById: (id: string) => prisma.uatTemplate.findUnique({ where: { id } }),
    findByCode: (code: string) => prisma.uatTemplate.findUnique({ where: { code } }),
    create: (data: Prisma.UatTemplateCreateInput) => prisma.uatTemplate.create({ data }),
    createMany: (data: Prisma.UatTemplateCreateManyInput[]) => prisma.uatTemplate.createMany({ data }),
  },

  stakeholder: {
    findMany: (args: Prisma.UatStakeholderFindManyArgs) => prisma.uatStakeholder.findMany(args),
    upsert: (cycleId: string, group: string, create: Prisma.UatStakeholderCreateInput, update: Prisma.UatStakeholderUpdateInput) =>
      prisma.uatStakeholder.upsert({
        where: { cycleId_stakeholderGroup: { cycleId, stakeholderGroup: group as never } },
        create,
        update,
      }),
  },

  approval: {
    findMany: (args: Prisma.UatApprovalFindManyArgs) => prisma.uatApproval.findMany(args),
    findManyWithStakeholder: (where: Prisma.UatApprovalWhereInput) =>
      prisma.uatApproval.findMany({ where, include: approvalWithStakeholderInclude }),
    count: (where: Prisma.UatApprovalWhereInput) => prisma.uatApproval.count({ where }),
    findByStakeholder: (cycleId: string, stakeholderId: string) =>
      prisma.uatApproval.findFirst({
        where: { cycleId, stakeholderId },
        include: approvalWithStakeholderInclude,
      }),
    create: (data: Prisma.UatApprovalCreateInput) => prisma.uatApproval.create({ data }),
    update: (id: string, data: Prisma.UatApprovalUpdateInput) => prisma.uatApproval.update({ where: { id }, data }),
    upsertForStakeholder: (cycleId: string, stakeholderId: string, create: Prisma.UatApprovalCreateInput, update: Prisma.UatApprovalUpdateInput) =>
      prisma.uatApproval.upsert({
        where: { cycleId_stakeholderId: { cycleId, stakeholderId } },
        create,
        update,
      }),
  },

  review: {
    findMany: (args: Prisma.UatReviewFindManyArgs) => prisma.uatReview.findMany(args),
    upsert: (cycleId: string, reviewArea: string, create: Prisma.UatReviewCreateInput, update: Prisma.UatReviewUpdateInput) =>
      prisma.uatReview.upsert({
        where: { cycleId_reviewArea: { cycleId, reviewArea: reviewArea as never } },
        create,
        update,
      }),
  },

  risk: {
    findMany: (args: Prisma.UatRiskFindManyArgs) => prisma.uatRisk.findMany(args),
    count: (where: Prisma.UatRiskWhereInput) => prisma.uatRisk.count({ where }),
    create: (data: Prisma.UatRiskCreateInput) => prisma.uatRisk.create({ data }),
    update: (id: string, data: Prisma.UatRiskUpdateInput) => prisma.uatRisk.update({ where: { id }, data }),
  },

  comment: {
    findMany: (args: Prisma.UatCommentFindManyArgs) => prisma.uatComment.findMany(args),
    create: (data: Prisma.UatCommentCreateInput) => prisma.uatComment.create({ data }),
  },
};
