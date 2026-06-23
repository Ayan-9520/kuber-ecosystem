import { PrismaClient } from '@prisma/client';

import { seedAdminUser } from './admin-user.seed.js';
import { seedAiPlatform } from './ai-platform.seed.js';
import { seedAnalytics } from './analytics.seed.js';
import { seedAutomation } from './automation.seed.js';
import { seedCommissionRules } from './commission-rules.seed.js';
import { seedCommunicationProviders } from './communication-providers.seed.js';
import { seedContent } from './content.seed.js';
import { seedDocumentTypes } from './document-types.seed.js';
import { seedEmailTemplates } from './email-templates.seed.js';
import { seedGovernance } from './governance.seed.js';
import { seedKnowledge } from './knowledge.seed.js';
import { seedLeadScoring } from './lead-scoring.seed.js';
import { seedLeadSources } from './lead-sources.seed.js';
import { seedNotificationTemplates } from './notification-templates.seed.js';
import { seedPartnerTypes } from './partner-types.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedProducts } from './products.seed.js';
import { seedPushTemplates } from './push-templates.seed.js';
import { seedRag } from './rag.seed.js';
import { seedRecommendations } from './recommendations.seed.js';
import { seedReferralTypes } from './referral-types.seed.js';
import { seedRolePermissions } from './role-permissions.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedSmsTemplates } from './sms-templates.seed.js';
import { seedSystemSettings } from './system-settings.seed.js';
import { seedTicketCategories } from './ticket-categories.seed.js';

/** Reference data only — no demo leads, customers, partners, or ops-hub filler. */
export async function seedMasterData(prisma: PrismaClient): Promise<void> {
  await seedPartnerTypes(prisma);
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedRolePermissions(prisma);
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
  await seedEmailTemplates(prisma);
  await seedSmsTemplates(prisma);
  await seedPushTemplates(prisma);
  await seedTicketCategories(prisma);
  await seedDocumentTypes(prisma);
  await seedSystemSettings(prisma);
  await seedAnalytics(prisma);
  await seedAdminUser(prisma);
  await seedAutomation(prisma);
  await seedContent(prisma);
  await seedGovernance(prisma);
}
