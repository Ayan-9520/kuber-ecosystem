import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL = 'mysql://root@127.0.0.1:3306/kuberone_dev';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

const ADMIN_EMAIL = 'admin@kuberone.com';

const prisma = new PrismaClient();

async function deleteUsers(userIds) {
  if (userIds.length === 0) return;

  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.otpVerification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.device.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.loginHistory.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

async function main() {
  const dbRow = await prisma.$queryRaw`SELECT DATABASE() AS name`;
  const dbName = dbRow[0]?.name ?? 'unknown';
  console.log(`🧹 Purging demo / transactional data from database: ${dbName}\n`);

  if (dbName === 'unknown') {
    throw new Error('No database selected — set DATABASE_URL to kuberone_dev');
  }

  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { id: true } });
  const adminUserId = admin?.id;

  await prisma.leadScoringAudit.deleteMany({});
  await prisma.leadScoreHistory.deleteMany({});
  await prisma.leadRiskProfile.deleteMany({});
  await prisma.leadPrediction.deleteMany({});
  await prisma.leadScore.deleteMany({});

  await prisma.bankLogin.deleteMany({});
  await prisma.creditReview.deleteMany({});
  await prisma.disbursement.deleteMany({});
  await prisma.sanction.deleteMany({});
  await prisma.closure.deleteMany({});
  await prisma.applicationTimeline.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});

  const applications = await prisma.application.deleteMany({});
  const leads = await prisma.lead.deleteMany({});
  const campaigns = await prisma.campaign.deleteMany({});
  const executiveTargets = await prisma.executiveTarget.deleteMany({});
  const branchTargets = await prisma.branchTarget.deleteMany({});
  const regionalTargets = await prisma.regionalTarget.deleteMany({});
  const referrals = await prisma.referral.deleteMany({});

  await prisma.financeCalculation.deleteMany({});
  await prisma.eligibilityResult.deleteMany({});
  await prisma.presignedUploadIntent.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.ticketAssignment.deleteMany({});
  await prisma.ticketEscalation.deleteMany({});
  await prisma.ticketResolution.deleteMany({});
  await prisma.ticketAttachment.deleteMany({});

  await prisma.commissionPayment.deleteMany({});
  await prisma.commissionAdjustment.deleteMany({});
  await prisma.commissionRecovery.deleteMany({});
  const commissions = await prisma.commissionLedger.deleteMany({});

  const tickets = await prisma.ticket.deleteMany({});
  const documents = await prisma.document.deleteMany({});
  const documentRequests = await prisma.documentRequest.deleteMany({});
  const deficiencies = await prisma.documentDeficiency.deleteMany({});
  const kycProfiles = await prisma.kycProfile.deleteMany({});
  const kycAuditLogs = await prisma.kycAuditLog.deleteMany({});

  console.log(`  applications removed: ${applications.count}`);
  console.log(`  leads removed: ${leads.count}`);
  console.log(`  campaigns removed: ${campaigns.count}`);
  console.log(`  analytics targets removed: ${executiveTargets.count + branchTargets.count + regionalTargets.count}`);
  console.log(`  referrals removed: ${referrals.count}`);
  console.log(`  commission rows removed: ${commissions.count}`);
  console.log(`  tickets removed: ${tickets.count}`);
  console.log(`  documents removed: ${documents.count}`);
  console.log(`  kyc rows removed: ${kycProfiles.count + kycAuditLogs.count}`);
  console.log(`  document extras removed: ${documentRequests.count + deficiencies.count}`);

  const partnerRows = await prisma.partner.findMany({ select: { id: true, userId: true } });
  const partnerUserIds = partnerRows.map((p) => p.userId);
  await prisma.partner.deleteMany({});
  console.log(`  partners removed: ${partnerRows.length}`);

  const customerRows = await prisma.customer.findMany({ select: { id: true, userId: true } });
  const customerUserIds = customerRows.map((c) => c.userId);
  await prisma.customer.deleteMany({});
  console.log(`  customers removed: ${customerRows.length}`);

  const userIdsToDelete = [...partnerUserIds, ...customerUserIds].filter(
    (id) => id && id !== adminUserId,
  );
  await deleteUsers([...new Set(userIdsToDelete)]);
  console.log(`  partner/customer users removed: ${userIdsToDelete.length}`);

  const remainingLeads = await prisma.lead.count();
  const remainingApps = await prisma.application.count();
  const remainingPartners = await prisma.partner.count();
  const remainingCustomers = await prisma.customer.count();

  console.log('\n✅ Purge complete');
  console.log(`  database: ${dbName}`);
  console.log(`  remaining applications: ${remainingApps}`);
  console.log(`  remaining leads: ${remainingLeads}`);
  console.log(`  remaining partners: ${remainingPartners}`);
  console.log(`  remaining customers: ${remainingCustomers}`);
  console.log(`  admin kept: ${ADMIN_EMAIL}`);
  console.log('\nNext steps:');
  console.log('  1. DSA app → "New DSA partner? Register" se apna partner banao');
  console.log('  2. Admin se partner verify/approve karo (KYC) agar zarurat ho');
  console.log('  3. DSA app se real leads create karo');
}

main()
  .catch((error) => {
    console.error('❌ Purge failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
