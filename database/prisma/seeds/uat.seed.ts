import type { PrismaClient } from '@prisma/client';

import {
  UAT_SCENARIOS,
  UAT_SIGNOFF_CHECKLISTS,
  UAT_TEMPLATE_DEFS,
  UAT_TEST_CASES,
} from './uat-data.js';

export async function seedUat(prisma: PrismaClient): Promise<void> {
  const existingPlan = await prisma.uatPlan.findUnique({ where: { code: 'UAT-KUBERONE-V1' } });
  if (existingPlan) {
    console.log('  → UAT framework already seeded, skipping');
    return;
  }

  const plan = await prisma.uatPlan.create({
    data: {
      code: 'UAT-KUBERONE-V1',
      name: 'KuberOne Enterprise UAT — Release 1.0',
      description:
        'Comprehensive User Acceptance Testing plan covering all KuberOne business flows for Kuber Finserve go-live validation.',
      version: '1.0',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  const cycle = await prisma.uatCycle.create({
    data: {
      code: 'UAT-CYCLE-001',
      name: 'UAT Cycle 1 — Full Business Validation',
      description: 'Primary UAT cycle covering all 12 business modules and 11 user groups.',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      planId: plan.id,
    },
  });

  const signoffTypes = ['SALES', 'CREDIT', 'OPERATIONS', 'COMPLIANCE', 'MANAGEMENT', 'FINAL_UAT'] as const;
  for (const signoffType of signoffTypes) {
    await prisma.uatSignoff.create({
      data: {
        cycleId: cycle.id,
        signoffType,
        status: 'PENDING',
        checklist: UAT_SIGNOFF_CHECKLISTS[signoffType] ?? [],
      },
    });
  }

  const scenarioIdByCode = new Map<string, string>();

  for (const s of UAT_SCENARIOS) {
    const scenario = await prisma.uatScenario.create({
      data: {
        cycleId: cycle.id,
        code: s.code,
        name: s.name,
        description: s.description,
        businessFlow: s.businessFlow,
        userGroup: s.userGroup,
        acceptanceCriteria: s.acceptanceCriteria,
        priority: s.priority,
        sortOrder: s.sortOrder,
      },
    });
    scenarioIdByCode.set(s.code, scenario.id);
  }

  for (const tc of UAT_TEST_CASES) {
    const scenarioId = scenarioIdByCode.get(tc.scenarioCode);
    if (!scenarioId) continue;
    await prisma.uatTestCase.create({
      data: {
        scenarioId,
        code: tc.code,
        title: tc.title,
        testType: tc.testType,
        preconditions: tc.preconditions,
        steps: tc.steps,
        expectedResult: tc.expectedResult,
        businessRule: tc.businessRule,
        priority: tc.priority,
        sortOrder: tc.sortOrder,
      },
    });
  }

  for (const tmpl of UAT_TEMPLATE_DEFS) {
    await prisma.uatTemplate.create({
      data: {
        code: tmpl.code,
        name: tmpl.name,
        description: tmpl.description,
        businessFlow: tmpl.businessFlow,
        userGroup: tmpl.userGroup,
        scenarioTemplate: tmpl.scenarioTemplate,
        testCaseTemplates: tmpl.testCaseTemplates,
        acceptanceCriteria: tmpl.acceptanceCriteria,
        signoffChecklist: tmpl.signoffChecklist,
      },
    });
  }

  console.log(
    `  → UAT seeded: 1 plan, 1 cycle, ${UAT_SCENARIOS.length} scenarios, ${UAT_TEST_CASES.length} test cases, ${UAT_TEMPLATE_DEFS.length} templates`,
  );
}
