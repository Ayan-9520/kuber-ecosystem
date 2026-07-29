import type {
  LenderApplication,
  LenderConnector,
  SubmitApplicationParams,
} from './lender-connector.interface.js';
import { MockLenderConnector } from './mock-lender.connector.js';

const ICICI_API_URL = process.env.ICICI_API_URL ?? '';
const ICICI_API_KEY = process.env.ICICI_API_KEY ?? '';
const ICICI_PARTNER_ID = process.env.ICICI_PARTNER_ID ?? '';

const mock = new MockLenderConnector('ICICI', 'ICICI Bank');

export class IciciLenderConnector implements LenderConnector {
  readonly lenderCode = 'ICICI';
  readonly lenderName = 'ICICI Bank';

  get isConfigured(): boolean {
    return Boolean(ICICI_API_URL && ICICI_API_KEY && ICICI_PARTNER_ID);
  }

  // TODO: Replace mock delegation with real ICICI API calls
  // POST {ICICI_API_URL}/api/v2/partner/applications
  // Headers: Authorization: Bearer {ICICI_API_KEY}, X-Partner-Id: {ICICI_PARTNER_ID}
  async submitApplication(params: SubmitApplicationParams): Promise<LenderApplication> {
    return mock.submitApplication(params);
  }

  // TODO: Replace mock delegation with real ICICI API calls
  // GET {ICICI_API_URL}/api/v2/partner/applications/{externalRefId}
  async checkStatus(externalRefId: string): Promise<LenderApplication> {
    return mock.checkStatus(externalRefId);
  }

  // TODO: Replace mock delegation with real ICICI API calls
  // DELETE {ICICI_API_URL}/api/v2/partner/applications/{externalRefId}
  async cancelApplication(externalRefId: string): Promise<{ success: boolean }> {
    return mock.cancelApplication(externalRefId);
  }
}
