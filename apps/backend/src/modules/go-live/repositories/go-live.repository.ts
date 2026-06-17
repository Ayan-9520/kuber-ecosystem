import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export const goLiveRepository = {
  listChecklist(where: Prisma.GoLiveChecklistWhereInput, skip: number, take: number) {
    return Promise.all([
      prisma.goLiveChecklist.findMany({
        where,
        skip,
        take,
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
        include: { verifiedBy: { select: { id: true, email: true } } },
      }),
      prisma.goLiveChecklist.count({ where }),
    ]);
  },

  findChecklistByCode(itemCode: string) {
    return prisma.goLiveChecklist.findUnique({ where: { itemCode } });
  },

  updateChecklist(itemCode: string, data: Prisma.GoLiveChecklistUpdateInput) {
    return prisma.goLiveChecklist.update({ where: { itemCode }, data });
  },

  countChecklistByStatus() {
    return prisma.goLiveChecklist.groupBy({
      by: ['section', 'status'],
      _count: { id: true },
    });
  },

  getActiveLaunch() {
    return prisma.launchExecution.findFirst({
      where: { status: { in: ['PLANNED', 'PRE_LAUNCH', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        approvals: { orderBy: { approvalType: 'asc' } },
        gates: { orderBy: { gateCode: 'asc' } },
      },
    });
  },

  findLaunchById(id: string) {
    return prisma.launchExecution.findUnique({
      where: { id },
      include: { approvals: true, gates: true },
    });
  },

  findLaunchByCode(code: string) {
    return prisma.launchExecution.findUnique({
      where: { code },
      include: { approvals: true, gates: true },
    });
  },

  updateLaunch(id: string, data: Prisma.LaunchExecutionUpdateInput) {
    return prisma.launchExecution.update({ where: { id }, data });
  },

  updateApproval(id: string, data: Prisma.GoLiveApprovalUpdateInput) {
    return prisma.goLiveApproval.update({ where: { id }, data });
  },

  findApproval(launchExecutionId: string, approvalType: string) {
    return prisma.goLiveApproval.findUnique({
      where: { launchExecutionId_approvalType: { launchExecutionId, approvalType: approvalType as never } },
    });
  },

  upsertGate(launchExecutionId: string, gateCode: string, data: Prisma.ReleaseGateUpdateInput & { label: string }) {
    return prisma.releaseGate.upsert({
      where: { launchExecutionId_gateCode: { launchExecutionId, gateCode } },
      create: {
        launchExecutionId,
        gateCode,
        label: data.label,
        status: (data.status as never) ?? 'PENDING',
        detail: data.detail as string | undefined,
        isBlocking: data.isBlocking as boolean | undefined ?? true,
        evaluatedAt: data.evaluatedAt as Date | undefined,
        metadata: data.metadata,
      },
      update: data,
    });
  },

  createAudit(data: Prisma.LaunchAuditCreateInput) {
    return prisma.launchAudit.create({ data });
  },

  listAudits(launchExecutionId: string, take: number) {
    return prisma.launchAudit.findMany({
      where: { launchExecutionId },
      orderBy: { createdAt: 'desc' },
      take,
      include: { actor: { select: { id: true, email: true } } },
    });
  },

  createReport(data: Prisma.GoLiveReportCreateInput) {
    return prisma.goLiveReport.create({ data });
  },

  listReports(take: number) {
    return prisma.goLiveReport.findMany({ orderBy: { generatedAt: 'desc' }, take });
  },

  listEvents(launchExecutionId: string, take: number) {
    return prisma.launchEvent.findMany({
      where: { launchExecutionId },
      orderBy: { createdAt: 'desc' },
      take,
      include: { actor: { select: { id: true, email: true } } },
    });
  },

  listEventsPaginated(launchExecutionId: string, skip: number, take: number) {
    return Promise.all([
      prisma.launchEvent.findMany({
        where: { launchExecutionId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true } } },
      }),
      prisma.launchEvent.count({ where: { launchExecutionId } }),
    ]);
  },

  createEvent(data: Prisma.LaunchEventCreateInput) {
    return prisma.launchEvent.create({ data });
  },

  listIncidents(launchExecutionId: string, where: Prisma.LaunchIncidentWhereInput = {}) {
    return prisma.launchIncident.findMany({
      where: { launchExecutionId, ...where },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      include: {
        assignedTo: { select: { id: true, email: true } },
        warRoomSession: { select: { id: true, code: true, status: true } },
      },
    });
  },

  countIncidents(launchExecutionId: string, where: Prisma.LaunchIncidentWhereInput = {}) {
    return prisma.launchIncident.count({ where: { launchExecutionId, ...where } });
  },

  createIncident(data: Prisma.LaunchIncidentCreateInput) {
    return prisma.launchIncident.create({ data });
  },

  updateIncident(id: string, data: Prisma.LaunchIncidentUpdateInput) {
    return prisma.launchIncident.update({ where: { id }, data });
  },

  getLatestMetrics(launchExecutionId: string, category?: string, limit = 50) {
    return prisma.launchMetric.findMany({
      where: { launchExecutionId, ...(category ? { category: category as never } : {}) },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  },

  createMetric(data: Prisma.LaunchMetricCreateInput) {
    return prisma.launchMetric.create({ data });
  },

  getActiveWarRoom(launchExecutionId: string) {
    return prisma.warRoomSession.findFirst({
      where: { launchExecutionId, status: { in: ['STANDBY', 'ACTIVE'] } },
      orderBy: { createdAt: 'desc' },
      include: { commander: { select: { id: true, email: true } } },
    });
  },

  createWarRoom(data: Prisma.WarRoomSessionCreateInput) {
    return prisma.warRoomSession.create({ data });
  },

  updateWarRoom(id: string, data: Prisma.WarRoomSessionUpdateInput) {
    return prisma.warRoomSession.update({ where: { id }, data });
  },
};
