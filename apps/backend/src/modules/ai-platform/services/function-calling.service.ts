import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ChatCompletionTool } from 'openai/resources/chat/completions.js';

import { prisma } from '../../../config/database.js';
import { applicationService } from '../../applications/services/application.service.js';
import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { leadService } from '../../leads/services/lead.service.js';
import { ticketService } from '../../support/services/ticket.service.js';
import type { PlatformRequestContext } from '../types/ai-platform.types.js';

export const AI_FUNCTION_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_eligibility',
      description: 'Check loan eligibility for a customer profile',
      parameters: {
        type: 'object',
        properties: {
          monthlyIncome: { type: 'number' },
          creditScore: { type: 'number' },
          requestedLoanAmount: { type: 'number' },
          productId: { type: 'string' },
        },
        required: ['monthlyIncome', 'requestedLoanAmount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_emi',
      description: 'Calculate EMI for loan amount, tenure and rate',
      parameters: {
        type: 'object',
        properties: {
          principal: { type: 'number' },
          annualRate: { type: 'number' },
          tenureMonths: { type: 'number' },
        },
        required: ['principal', 'tenureMonths'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_application_status',
      description: 'Get application status by application ID',
      parameters: {
        type: 'object',
        properties: { applicationId: { type: 'string' } },
        required: ['applicationId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lead_status',
      description: 'Get lead details by lead ID',
      parameters: {
        type: 'object',
        properties: { leadId: { type: 'string' } },
        required: ['leadId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Create a support ticket',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          description: { type: 'string' },
          categoryId: { type: 'string' },
        },
        required: ['subject', 'description'],
      },
    },
  },
];

export const functionCallingService = {
  getTools(): ChatCompletionTool[] {
    return AI_FUNCTION_TOOLS;
  },

  async execute(
    name: string,
    argsJson: string,
    actor: AuthenticatedUser,
    ctx: PlatformRequestContext,
  ): Promise<Record<string, unknown>> {
    const args = JSON.parse(argsJson) as Record<string, unknown>;

    switch (name) {
      case 'check_eligibility': {
        const result = await financeEngineService.calculateEligibility(
          {
            monthlyIncome: Number(args.monthlyIncome),
            creditScore: args.creditScore ? Number(args.creditScore) : undefined,
            requestedLoanAmount: Number(args.requestedLoanAmount),
            requestedTenureMonths: 240,
            productId: args.productId as string | undefined,
            existingObligations: 0,
            persist: false,
            useCache: true,
          },
          { actorId: actor.id, ipAddress: ctx.ipAddress, requestId: ctx.requestId },
        );
        return result as Record<string, unknown>;
      }
      case 'calculate_emi': {
        const result = await financeEngineService.calculateEmi(
          {
            loanAmount: Number(args.principal),
            interestRate: Number(args.annualRate ?? 10.5),
            tenureMonths: Number(args.tenureMonths),
            processingFee: 0,
            includeAmortization: false,
            persist: false,
            useCache: true,
          },
          { actorId: actor.id },
        );
        return result as Record<string, unknown>;
      }
      case 'get_application_status': {
        const app = await applicationService.getById(actor, String(args.applicationId));
        return { id: app.id, status: app.status, applicationNumber: app.applicationNumber };
      }
      case 'get_lead_status': {
        const lead = await leadService.getById(actor, String(args.leadId));
        return { id: lead.id, status: lead.status, prospectName: lead.prospectName, score: lead.score };
      }
      case 'create_ticket': {
        let categoryId = args.categoryId as string | undefined;
        if (!categoryId) {
          const cat = await prisma.ticketCategory.findFirst({ where: { isActive: true } });
          categoryId = cat?.id;
        }
        if (!categoryId) return { error: 'No ticket category available' };
        const ticket = await ticketService.create(
          {
            subject: String(args.subject),
            description: String(args.description),
            categoryId,
            priority: 'MEDIUM',
            customerId: actor.customerId,
          },
          { actorId: actor.id, ipAddress: ctx.ipAddress, requestId: ctx.requestId },
        );
        if (!ticket) return { error: 'Failed to create ticket' };
        return { ticketId: ticket.id, ticketNumber: ticket.ticketNumber };
      }
      default:
        return { error: `Unknown function: ${name}` };
    }
  },
};
