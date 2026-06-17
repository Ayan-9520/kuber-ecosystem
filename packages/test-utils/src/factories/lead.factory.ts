let seq = 1;

export function buildLead(overrides: Record<string, unknown> = {}) {
  return {
    id: `lead-${seq++}`,
    firstName: 'Amit',
    lastName: 'Patel',
    phone: '9123456789',
    email: 'amit@example.com',
    status: 'NEW',
    sourceId: 'source-1',
    branchId: 'branch-1',
    regionId: 'region-1',
    assignedToId: 'emp-1',
    score: 72,
    grade: 'WARM',
    partnerId: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildLeadScore(overrides: Record<string, unknown> = {}) {
  return {
    id: `score-${seq++}`,
    leadId: 'lead-1',
    score: 75,
    grade: 'HOT',
    scoringProfile: 'DEFAULT',
    factors: { income: 20, intent: 30 },
    createdAt: new Date(),
    ...overrides,
  };
}
