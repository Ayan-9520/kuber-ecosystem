import type { PrismaClient } from '@prisma/client';

const TEMPLATES = [
  {
    name: 'Lead Nurturing — 7 Day Drip',
    description: 'Multi-channel nurture sequence for new leads with score-based branching.',
    journeyType: 'LEAD_NURTURING' as const,
    category: 'nurture',
    nodesJson: [
      { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Lead Created', positionX: 80, positionY: 200, nextNodeKeys: ['delay_1'] },
      { nodeKey: 'delay_1', type: 'DELAY', label: 'Wait 1 Day', positionX: 280, positionY: 200, config: { delayType: 'DAYS', value: 1 }, nextNodeKeys: ['action_email'] },
      { nodeKey: 'action_email', type: 'ACTION', label: 'Welcome Email', positionX: 480, positionY: 200, actions: [{ actionType: 'SEND_EMAIL', templateCode: 'CAMPAIGN_EMAIL' }], nextNodeKeys: ['cond_score'] },
      { nodeKey: 'cond_score', type: 'CONDITION', label: 'Score >= 70?', positionX: 680, positionY: 200, conditions: [{ field: 'leadScore', operator: 'gte', value: 70 }], nextNodeKeys: ['action_sms', 'delay_2'] },
      { nodeKey: 'action_sms', type: 'ACTION', label: 'Hot Lead SMS', positionX: 880, positionY: 120, actions: [{ actionType: 'SEND_SMS', templateCode: 'LEAD_FOLLOWUP' }] },
      { nodeKey: 'delay_2', type: 'DELAY', label: 'Wait 3 Days', positionX: 880, positionY: 280, config: { delayType: 'DAYS', value: 3 }, nextNodeKeys: ['action_whatsapp'] },
      { nodeKey: 'action_whatsapp', type: 'ACTION', label: 'WhatsApp Follow-up', positionX: 1080, positionY: 280, actions: [{ actionType: 'SEND_WHATSAPP', templateCode: 'LEAD_FOLLOWUP' }] },
      { nodeKey: 'goal_1', type: 'GOAL', label: 'Application Submitted', positionX: 1280, positionY: 200, config: { goalType: 'APPLICATION_SUBMITTED' } },
    ],
    triggersJson: [{ triggerType: 'LEAD_CREATED', isActive: true }],
    goalsJson: [{ goalType: 'APPLICATION_SUBMITTED' }],
  },
  {
    name: 'Application Follow-up',
    description: 'Automated reminders after application creation until submission.',
    journeyType: 'APPLICATION_FOLLOWUP' as const,
    category: 'followup',
    nodesJson: [
      { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Application Created', positionX: 80, positionY: 200, nextNodeKeys: ['delay_1'] },
      { nodeKey: 'delay_1', type: 'DELAY', label: 'Wait 24 Hours', positionX: 280, positionY: 200, config: { delayType: 'HOURS', value: 24 }, nextNodeKeys: ['action_push'] },
      { nodeKey: 'action_push', type: 'ACTION', label: 'Complete Application Push', positionX: 480, positionY: 200, actions: [{ actionType: 'SEND_PUSH', templateCode: 'APPLICATION_STATUS_PUSH' }] },
      { nodeKey: 'action_email', type: 'ACTION', label: 'Document Reminder Email', positionX: 680, positionY: 200, actions: [{ actionType: 'SEND_EMAIL', templateCode: 'DOCUMENT_REQUEST' }] },
      { nodeKey: 'goal_1', type: 'GOAL', label: 'Application Submitted', positionX: 880, positionY: 200, config: { goalType: 'APPLICATION_SUBMITTED' } },
    ],
    triggersJson: [{ triggerType: 'APPLICATION_CREATED', isActive: true }],
    goalsJson: [{ goalType: 'APPLICATION_SUBMITTED' }],
  },
  {
    name: 'Customer Onboarding',
    description: 'Welcome journey for newly registered customers across channels.',
    journeyType: 'CUSTOMER_ONBOARDING' as const,
    category: 'onboarding',
    nodesJson: [
      { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Customer Registered', positionX: 80, positionY: 200, nextNodeKeys: ['action_welcome'] },
      { nodeKey: 'action_welcome', type: 'ACTION', label: 'Welcome Email', positionX: 280, positionY: 200, actions: [{ actionType: 'SEND_EMAIL', templateCode: 'WELCOME_EMAIL' }] },
      { nodeKey: 'delay_1', type: 'DELAY', label: 'Wait 2 Days', positionX: 480, positionY: 200, config: { delayType: 'DAYS', value: 2 }, nextNodeKeys: ['action_ai'] },
      { nodeKey: 'action_ai', type: 'ACTION', label: 'AI Product Recommendations', positionX: 680, positionY: 200, actions: [{ actionType: 'TRIGGER_AI_RECOMMENDATION' }] },
      { nodeKey: 'action_push', type: 'ACTION', label: 'Explore Products Push', positionX: 880, positionY: 200, actions: [{ actionType: 'SEND_PUSH', templateCode: 'PRODUCT_RECOMMENDATION_PUSH' }] },
    ],
    triggersJson: [{ triggerType: 'CUSTOMER_REGISTERED', isActive: true }],
    goalsJson: [],
  },
  {
    name: 'Referral Conversion Campaign',
    description: 'Automated referral reward notifications and follow-ups.',
    journeyType: 'REFERRAL_AUTOMATION' as const,
    category: 'referral',
    nodesJson: [
      { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Referral Created', positionX: 80, positionY: 200, nextNodeKeys: ['action_invite'] },
      { nodeKey: 'action_invite', type: 'ACTION', label: 'Referral Invitation', positionX: 280, positionY: 200, actions: [{ actionType: 'SEND_EMAIL', templateCode: 'REFERRAL_INVITATION' }, { actionType: 'SEND_SMS', templateCode: 'REFERRAL_INVITATION' }] },
      { nodeKey: 'trigger_2', type: 'TRIGGER', label: 'Referral Converted', positionX: 480, positionY: 200, nextNodeKeys: ['action_reward'] },
      { nodeKey: 'action_reward', type: 'ACTION', label: 'Reward Notification', positionX: 680, positionY: 200, actions: [{ actionType: 'SEND_WHATSAPP', templateCode: 'REFERRAL_REWARD' }] },
      { nodeKey: 'goal_1', type: 'GOAL', label: 'Referral Converted', positionX: 880, positionY: 200, config: { goalType: 'REFERRAL_CONVERTED' } },
    ],
    triggersJson: [{ triggerType: 'REFERRAL_CREATED', isActive: true }, { triggerType: 'REFERRAL_CONVERTED', isActive: true }],
    goalsJson: [{ goalType: 'REFERRAL_CONVERTED' }],
  },
  {
    name: 'Feedback After Support Resolution',
    description: 'Collect CSAT feedback after ticket closure.',
    journeyType: 'FEEDBACK_CAMPAIGN' as const,
    category: 'feedback',
    nodesJson: [
      { nodeKey: 'trigger_1', type: 'TRIGGER', label: 'Ticket Closed', positionX: 80, positionY: 200, nextNodeKeys: ['delay_1'] },
      { nodeKey: 'delay_1', type: 'DELAY', label: 'Wait 1 Hour', positionX: 280, positionY: 200, config: { delayType: 'HOURS', value: 1 }, nextNodeKeys: ['action_feedback'] },
      { nodeKey: 'action_feedback', type: 'ACTION', label: 'Feedback Request', positionX: 480, positionY: 200, actions: [{ actionType: 'SEND_EMAIL', templateCode: 'FEEDBACK_REQUEST' }, { actionType: 'SEND_PUSH', templateCode: 'FEEDBACK_PUSH' }] },
      { nodeKey: 'goal_1', type: 'GOAL', label: 'Support Resolved', positionX: 680, positionY: 200, config: { goalType: 'SUPPORT_RESOLVED' } },
    ],
    triggersJson: [{ triggerType: 'SUPPORT_TICKET_CLOSED', isActive: true }],
    goalsJson: [{ goalType: 'SUPPORT_RESOLVED' }],
  },
];

export async function seedAutomation(prisma: PrismaClient): Promise<void> {
  for (const template of TEMPLATES) {
    const existing = await prisma.automationTemplate.findFirst({
      where: { name: template.name },
    });
    if (existing) {
      await prisma.automationTemplate.update({
        where: { id: existing.id },
        data: {
          description: template.description,
          journeyType: template.journeyType,
          category: template.category,
          nodesJson: template.nodesJson,
          triggersJson: template.triggersJson,
          goalsJson: template.goalsJson,
          isPublic: true,
        },
      });
    } else {
      await prisma.automationTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          journeyType: template.journeyType,
          category: template.category,
          nodesJson: template.nodesJson,
          triggersJson: template.triggersJson,
          goalsJson: template.goalsJson,
          isPublic: true,
        },
      });
    }
  }

  console.log('  → automation templates seeded');
}
