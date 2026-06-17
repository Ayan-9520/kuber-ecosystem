import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const governanceRepository = {
  auditEvent: {
    create: (data: Prisma.AuditEventCreateInput) => prisma.auditEvent.create({ data }),
    findMany: (args: Prisma.AuditEventFindManyArgs) => prisma.auditEvent.findMany(args),
    count: (where: Prisma.AuditEventWhereInput) => prisma.auditEvent.count({ where }),
    findById: (id: string) => prisma.auditEvent.findUnique({ where: { id }, include: { user: { select: { id: true, email: true } } } }),
  },
  auditReport: {
    create: (data: Prisma.AuditReportCreateInput) => prisma.auditReport.create({ data }),
    findMany: (args: Prisma.AuditReportFindManyArgs) => prisma.auditReport.findMany(args),
    count: (where: Prisma.AuditReportWhereInput) => prisma.auditReport.count({ where }),
    update: (id: string, data: Prisma.AuditReportUpdateInput) => prisma.auditReport.update({ where: { id }, data }),
  },
  auditExport: {
    create: (data: Prisma.AuditExportCreateInput) => prisma.auditExport.create({ data }),
    findMany: (args: Prisma.AuditExportFindManyArgs) => prisma.auditExport.findMany(args),
  },
  complianceRule: {
    findMany: (args: Prisma.ComplianceRuleFindManyArgs) => prisma.complianceRule.findMany(args),
    count: (where: Prisma.ComplianceRuleWhereInput) => prisma.complianceRule.count({ where }),
  },
  complianceViolation: {
    create: (data: Prisma.ComplianceViolationCreateInput) => prisma.complianceViolation.create({ data }),
    findMany: (args: Prisma.ComplianceViolationFindManyArgs) => prisma.complianceViolation.findMany(args),
    count: (where: Prisma.ComplianceViolationWhereInput) => prisma.complianceViolation.count({ where }),
    update: (id: string, data: Prisma.ComplianceViolationUpdateInput) => prisma.complianceViolation.update({ where: { id }, data }),
  },
  complianceReport: {
    create: (data: Prisma.ComplianceReportCreateInput) => prisma.complianceReport.create({ data }),
    findMany: (args: Prisma.ComplianceReportFindManyArgs) => prisma.complianceReport.findMany(args),
  },
  complianceAudit: {
    findMany: (args: Prisma.ComplianceAuditFindManyArgs) => prisma.complianceAudit.findMany(args),
    create: (data: Prisma.ComplianceAuditCreateInput) => prisma.complianceAudit.create({ data }),
  },
  riskRegister: {
    create: (data: Prisma.RiskRegisterCreateInput) => prisma.riskRegister.create({ data }),
    findMany: (args: Prisma.RiskRegisterFindManyArgs) => prisma.riskRegister.findMany(args),
    count: (where: Prisma.RiskRegisterWhereInput) => prisma.riskRegister.count({ where }),
    findById: (id: string) => prisma.riskRegister.findUnique({ where: { id }, include: { assessments: { take: 5, orderBy: { assessedAt: 'desc' } } } }),
    update: (id: string, data: Prisma.RiskRegisterUpdateInput) => prisma.riskRegister.update({ where: { id }, data }),
  },
  riskAssessment: {
    create: (data: Prisma.RiskAssessmentCreateInput) => prisma.riskAssessment.create({ data }),
  },
  riskEvent: {
    create: (data: Prisma.RiskEventCreateInput) => prisma.riskEvent.create({ data }),
    findMany: (args: Prisma.RiskEventFindManyArgs) => prisma.riskEvent.findMany(args),
    count: (where: Prisma.RiskEventWhereInput) => prisma.riskEvent.count({ where }),
  },
  securityEvent: {
    create: (data: Prisma.SecurityEventCreateInput) => prisma.securityEvent.create({ data }),
    findMany: (args: Prisma.SecurityEventFindManyArgs) => prisma.securityEvent.findMany(args),
    count: (where: Prisma.SecurityEventWhereInput) => prisma.securityEvent.count({ where }),
  },
  securityAlert: {
    create: (data: Prisma.SecurityAlertCreateInput) => prisma.securityAlert.create({ data }),
    findMany: (args: Prisma.SecurityAlertFindManyArgs) => prisma.securityAlert.findMany(args),
    count: (where: Prisma.SecurityAlertWhereInput) => prisma.securityAlert.count({ where }),
    update: (id: string, data: Prisma.SecurityAlertUpdateInput) => prisma.securityAlert.update({ where: { id }, data }),
  },
  dataAccessLog: {
    create: (data: Prisma.DataAccessLogCreateInput) => prisma.dataAccessLog.create({ data }),
    findMany: (args: Prisma.DataAccessLogFindManyArgs) => prisma.dataAccessLog.findMany(args),
    count: (where: Prisma.DataAccessLogWhereInput) => prisma.dataAccessLog.count({ where }),
  },
  governancePolicy: {
    findMany: (args: Prisma.GovernancePolicyFindManyArgs) => prisma.governancePolicy.findMany(args),
  },
  retentionPolicy: {
    findMany: (args: Prisma.RetentionPolicyFindManyArgs) => prisma.retentionPolicy.findMany(args),
  },
};
