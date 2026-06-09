import type { AuthenticatedUser } from '@kuberone/shared-types';

import type { AiAudience, AiLanguage } from '../constants/ai-advisor.constants.js';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AiChatInput {
  message: string;
  conversationId?: string;
  language?: AiLanguage;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  productSlug?: string;
  monthlyIncome?: number;
  creditScore?: number;
  requestedLoanAmount?: number;
  requestedTenureMonths?: number;
}

export interface AiContextInput {
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  productSlug?: string;
  productId?: string;
  includeKnowledge?: boolean;
  ragQuery?: string;
}

export interface AiRecommendationInput {
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  monthlyIncome?: number;
  creditScore?: number;
  propertyValue?: number;
  vehicleValue?: number;
  preferredSegment?: 'HOME' | 'AUTO' | 'BUSINESS';
  requestedLoanAmount?: number;
  requestedTenureMonths?: number;
  interestRate?: number;
}

export interface AiEligibilityInput {
  productSlug?: string;
  productId?: string;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  monthlyIncome?: number;
  creditScore?: number;
  age?: number;
  employmentType?: string;
  requestedLoanAmount?: number;
  requestedTenureMonths?: number;
  interestRate?: number;
  propertyValue?: number;
  vehicleValue?: number;
  existingObligations?: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: AiLanguage;
  intent?: string;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  audience: AiAudience;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  partnerId?: string;
  language: AiLanguage;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

export interface AiAdvisorContext {
  audience: AiAudience;
  language: AiLanguage;
  actor: {
    userId: string;
    userType: string;
    roles: string[];
    customerId?: string;
    partnerId?: string;
  };
  customer?: Record<string, unknown> | null;
  lead?: Record<string, unknown> | null;
  application?: Record<string, unknown> | null;
  applications?: Record<string, unknown>[];
  documents?: Record<string, unknown>[];
  documentDeficiencies?: Record<string, unknown>[];
  requiredDocuments?: Record<string, unknown>[];
  products?: Record<string, unknown>[];
  productRecommendations?: Record<string, unknown>[];
  lenderRecommendations?: Record<string, unknown>[];
  eligibility?: Record<string, unknown> | null;
  approvalProbability?: Record<string, unknown> | null;
  emiPreview?: Record<string, unknown> | null;
  knowledgeSnippets?: string[];
  nextBestActions?: string[];
}

export interface AiChatResult {
  conversationId: string;
  message: ConversationMessage;
  intent: string;
  contextUsed: boolean;
  model: string;
  provider: 'openai' | 'rules-engine';
}

export interface BuildContextParams {
  actor: AuthenticatedUser;
  input: AiContextInput;
  language?: AiLanguage;
}
