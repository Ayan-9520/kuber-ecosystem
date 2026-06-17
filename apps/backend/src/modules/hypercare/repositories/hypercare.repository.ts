import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export const hypercareRepository = {
  getActiveSession() {
    return prisma.hypercareSession.findFirst({
      where: { status: { in: ['ACTIVE', 'EXTENDED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        launchExecution: { select: { id: true, code: true, status: true } },
      },
    });
  },

  findSessionById(id: string) {
    return prisma.hypercareSession.findUnique({
      where: { id },
      include: { launchExecution: { select: { id: true, code: true, status: true } } },
    });
  },

  updateSession(id: string, data: Prisma.HypercareSessionUpdateInput) {
    return prisma.hypercareSession.update({ where: { id }, data });
  },

  listIncidents(sessionId: string, where: Prisma.HypercareIncidentWhereInput = {}) {
    return prisma.hypercareIncident.findMany({
      where: { sessionId, ...where },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      include: { assignedTo: { select: { id: true, email: true } } },
    });
  },

  countIncidents(sessionId: string, where: Prisma.HypercareIncidentWhereInput = {}) {
    return prisma.hypercareIncident.count({ where: { sessionId, ...where } });
  },

  createIncident(data: Prisma.HypercareIncidentCreateInput) {
    return prisma.hypercareIncident.create({ data });
  },

  updateIncident(id: string, data: Prisma.HypercareIncidentUpdateInput) {
    return prisma.hypercareIncident.update({ where: { id }, data });
  },

  listIssues(sessionId: string, where: Prisma.HypercareIssueWhereInput = {}) {
    return prisma.hypercareIssue.findMany({
      where: { sessionId, ...where },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      include: { assignedTo: { select: { id: true, email: true } } },
    });
  },

  countIssues(sessionId: string, where: Prisma.HypercareIssueWhereInput = {}) {
    return prisma.hypercareIssue.count({ where: { sessionId, ...where } });
  },

  createIssue(data: Prisma.HypercareIssueCreateInput) {
    return prisma.hypercareIssue.create({ data });
  },

  updateIssue(id: string, data: Prisma.HypercareIssueUpdateInput) {
    return prisma.hypercareIssue.update({ where: { id }, data });
  },

  getLatestMetrics(sessionId: string, category?: string, limit = 100) {
    return prisma.hypercareMetric.findMany({
      where: { sessionId, ...(category ? { category: category as never } : {}) },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  },

  createMetric(data: Prisma.HypercareMetricCreateInput) {
    return prisma.hypercareMetric.create({ data });
  },

  createManyMetrics(data: Prisma.HypercareMetricCreateManyInput[]) {
    return prisma.hypercareMetric.createMany({ data });
  },

  createReport(data: Prisma.HypercareReportCreateInput) {
    return prisma.hypercareReport.create({ data });
  },

  listReports(sessionId: string, take = 10) {
    return prisma.hypercareReport.findMany({
      where: { sessionId },
      orderBy: { generatedAt: 'desc' },
      take,
    });
  },

  listRcas(sessionId: string) {
    return prisma.hypercareRCA.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      include: { authoredBy: { select: { id: true, email: true } } },
    });
  },

  createRca(data: Prisma.HypercareRCACreateInput) {
    return prisma.hypercareRCA.create({ data });
  },

  updateRca(id: string, data: Prisma.HypercareRCAUpdateInput) {
    return prisma.hypercareRCA.update({ where: { id }, data });
  },
};
