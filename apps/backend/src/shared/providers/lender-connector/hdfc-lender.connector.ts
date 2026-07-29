import type {
  LenderApplication,
  LenderConnector,
  SubmitApplicationParams,
} from './lender-connector.interface.js';
import { MockLenderConnector } from './mock-lender.connector.js';

const HDFC_API_URL = process.env.HDFC_API_URL ?? '';
const HDFC_API_KEY = process.env.HDFC_API_KEY ?? '';
const HDFC_PARTNER_CODE = process.env.HDFC_PARTNER_CODE ?? '';

const mock = new MockLenderConnector('HDFC', 'HDFC Bank');

export class HdfcLenderConnector implements LenderConnector {
  readonly lenderCode = 'HDFC';
  readonly lenderName = 'HDFC Bank';

  get isConfigured(): boolean {
    return Boolean(HDFC_API_URL && HDFC_API_KEY && HDFC_PARTNER_CODE);
  }

  // TODO: Replace mock delegation with real HDFC API calls
  // POST {HDFC_API_URL}/partner/v1/loan-applications
  // Headers: X-Api-Key: {HDFC_API_KEY}, X-Partner-Code: {HDFC_PARTNER_CODE}
  async submitApplication(params: SubmitApplicationParams): Promise<LenderApplication> {
    return mock.submitApplication(params);
  }

  // TODO: Replace mock delegation with real HDFC API calls
  // GET {HDFC_API_URL}/partner/v1/loan-applications/{externalRefId}/status
  async checkStatus(externalRefId: string): Promise<LenderApplication> {
    return mock.checkStatus(externalRefId);
  }

  // TODO: Replace mock delegation with real HDFC API calls
  // POST {HDFC_API_URL}/partner/v1/loan-applications/{externalRefId}/cancel
  async cancelApplication(externalRefId: string): Promise<{ success: boolean }> {
    return mock.cancelApplication(externalRefId);
  }
}
