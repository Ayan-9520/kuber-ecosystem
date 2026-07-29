import type {
  LenderApplication,
  LenderConnector,
  SubmitApplicationParams,
} from './lender-connector.interface.js';
import { MockLenderConnector } from './mock-lender.connector.js';

const BAJAJ_API_URL = process.env.BAJAJ_API_URL ?? '';
const BAJAJ_API_KEY = process.env.BAJAJ_API_KEY ?? '';
const BAJAJ_DEALER_CODE = process.env.BAJAJ_DEALER_CODE ?? '';

const mock = new MockLenderConnector('BAJAJ', 'Bajaj Finserv');

export class BajajLenderConnector implements LenderConnector {
  readonly lenderCode = 'BAJAJ';
  readonly lenderName = 'Bajaj Finserv';

  get isConfigured(): boolean {
    return Boolean(BAJAJ_API_URL && BAJAJ_API_KEY && BAJAJ_DEALER_CODE);
  }

  // TODO: Replace mock delegation with real Bajaj Finserv API calls
  // POST {BAJAJ_API_URL}/dealer/v1/loan/submit
  // Headers: X-Api-Key: {BAJAJ_API_KEY}, X-Dealer-Code: {BAJAJ_DEALER_CODE}
  async submitApplication(params: SubmitApplicationParams): Promise<LenderApplication> {
    return mock.submitApplication(params);
  }

  // TODO: Replace mock delegation with real Bajaj Finserv API calls
  // GET {BAJAJ_API_URL}/dealer/v1/loan/{externalRefId}/status
  async checkStatus(externalRefId: string): Promise<LenderApplication> {
    return mock.checkStatus(externalRefId);
  }

  // TODO: Replace mock delegation with real Bajaj Finserv API calls
  // POST {BAJAJ_API_URL}/dealer/v1/loan/{externalRefId}/withdraw
  async cancelApplication(externalRefId: string): Promise<{ success: boolean }> {
    return mock.cancelApplication(externalRefId);
  }
}
