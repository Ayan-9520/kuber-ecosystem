import { PrismaClient } from '@prisma/client';

import { seedAdminUser } from './admin-user.seed.js';
import { seedAiPlatform } from './ai-platform.seed.js';
import { seedAnalytics } from './analytics.seed.js';
import { seedAppStore } from './app-store.seed.js';
import { seedAutomation } from './automation.seed.js';
import { seedBackendDeployment } from './backend-deployment.seed.js';
import { seedBackup } from './backup.seed.js';
import { seedBranchAnalytics } from './branch-analytics.seed.js';
import { seedCampaigns } from './campaigns.seed.js';
import { seedCommissionRules } from './commission-rules.seed.js';
import { seedCommunicationProviders } from './communication-providers.seed.js';
import { seedContent } from './content.seed.js';
import { seedDemoCustomer } from './demo-customer.seed.js';
import { seedDemoDsaPartner } from './demo-dsa-partner.seed.js';
import { seedDemoLeads } from './demo-leads.seed.js';
import { seedDevOps } from './devops.seed.js';
import { seedDocumentTypes } from './document-types.seed.js';
import { seedDr } from './dr.seed.js';
import { seedEmailTemplates } from './email-templates.seed.js';
import { seedExecutiveAnalytics } from './executive-analytics.seed.js';
import { seedGoLive } from './go-live.seed.js';
import { seedGovernance } from './governance.seed.js';
import { seedHypercare } from './hypercare.seed.js';
import { seedInfrastructure } from './infrastructure.seed.js';
import { seedKnowledge } from './knowledge.seed.js';
import { seedLeadScoring } from './lead-scoring.seed.js';
import { seedLeadSources } from './lead-sources.seed.js';
import { seedMobileRelease } from './mobile-release.seed.js';
import { seedMonitoring } from './monitoring.seed.js';
import { seedNotificationTemplates } from './notification-templates.seed.js';
import { seedObservability } from './observability.seed.js';
import { seedPartnerTypes } from './partner-types.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedPlayStore } from './play-store.seed.js';
import { seedProduction } from './production.seed.js';
import { seedProducts } from './products.seed.js';
import { seedPushTemplates } from './push-templates.seed.js';
import { seedRag } from './rag.seed.js';
import { seedRecommendations } from './recommendations.seed.js';
import { seedReferralTypes } from './referral-types.seed.js';
import { seedRegionalAnalytics } from './regional-analytics.seed.js';
import { seedRolePermissions } from './role-permissions.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedSmsTemplates } from './sms-templates.seed.js';
import { seedStaging } from './staging.seed.js';
import { seedSystemSettings } from './system-settings.seed.js';
import { seedTicketCategories } from './ticket-categories.seed.js';
import { seedUatFinalSignoff } from './uat-final-signoff.seed.js';
import { seedUat } from './uat.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding KuberOne database...');

  await seedPartnerTypes(prisma);
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedRolePermissions(prisma);
  await seedDemoCustomer(prisma);
  await seedDemoDsaPartner(prisma);
  await seedAnalytics(prisma);
  await seedExecutiveAnalytics(prisma);
  await seedProducts(prisma);
  await seedLeadSources(prisma);
  await seedLeadScoring(prisma);
  await seedRecommendations(prisma);
  await seedKnowledge(prisma);
  await seedRag(prisma);
  await seedAiPlatform(prisma);
  await seedReferralTypes(prisma);
  await seedCommissionRules(prisma);
  await seedNotificationTemplates(prisma);
  await seedCommunicationProviders(prisma);
  await seedCampaigns(prisma);
  await seedEmailTemplates(prisma);
  await seedSmsTemplates(prisma);
  await seedPushTemplates(prisma);
  await seedTicketCategories(prisma);
  await seedDocumentTypes(prisma);
  await seedSystemSettings(prisma);
  await seedAdminUser(prisma);
  await seedDemoLeads(prisma);
  await seedAutomation(prisma);
  await seedContent(prisma);
  await seedGovernance(prisma);
  await seedBranchAnalytics(prisma);
  await seedRegionalAnalytics(prisma);
  await seedUat(prisma);
  await seedUatFinalSignoff(prisma);
  await seedMonitoring(prisma);
  await seedObservability(prisma);
  await seedBackup(prisma);
  await seedDevOps(prisma);
  await seedInfrastructure(prisma);
  await seedStaging(prisma);
  await seedProduction(prisma);
  await seedMobileRelease(prisma);
  await seedPlayStore(prisma);
  await seedAppStore(prisma);
  await seedBackendDeployment(prisma);
  await seedDr(prisma);
  await seedGoLive(prisma);
  await seedHypercare(prisma);

  console.log('✅ Seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
