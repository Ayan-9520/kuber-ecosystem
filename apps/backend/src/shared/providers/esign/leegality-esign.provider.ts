import type {
  EsignProvider,
  EsignRequest,
  EsignResponse,
} from './esign.interface.js';
import { MockEsignProvider } from './mock-esign.provider.js';

// Leegality API: https://api.leegality.com/
// Docs: https://docs.leegality.com/
//
// Env vars required:
//   LEEGALITY_API_KEY
//   LEEGALITY_API_URL  (default: https://api.leegality.com)
//
// Key endpoints:
//   POST   /api/v3.1/document/create    — create document for signing
//   POST   /api/v3.1/invite/create      — send signing invitation
//   GET    /api/v3.1/document/{id}       — get document status
//   GET    /api/v3.1/document/{id}/pdf   — download signed PDF

const mock = new MockEsignProvider();

export class LeegalityEsignProvider implements EsignProvider {
  readonly providerName = 'leegality';

  private readonly apiKey = process.env.LEEGALITY_API_KEY ?? '';
  private readonly apiUrl = process.env.LEEGALITY_API_URL ?? 'https://api.leegality.com';

  // TODO: Replace mock delegation with actual Leegality API calls
  async createSignRequest(req: EsignRequest): Promise<EsignResponse> {
    this.assertConfigured();
    console.log(`[Leegality] createSignRequest → delegating to mock (apiUrl=${this.apiUrl})`);
    const res = await mock.createSignRequest(req);
    return { ...res, provider: this.providerName };
  }

  // TODO: Replace mock delegation with actual Leegality API calls
  async getStatus(requestId: string): Promise<EsignResponse> {
    this.assertConfigured();
    console.log(`[Leegality] getStatus → delegating to mock`);
    const res = await mock.getStatus(requestId);
    return { ...res, provider: this.providerName };
  }

  // TODO: Replace mock delegation with actual Leegality API calls
  async downloadSigned(requestId: string): Promise<Buffer> {
    this.assertConfigured();
    console.log(`[Leegality] downloadSigned → delegating to mock`);
    return mock.downloadSigned(requestId);
  }

  private assertConfigured(): void {
    if (!this.apiKey) {
      console.warn('[Leegality] LEEGALITY_API_KEY not set — using mock fallback');
    }
  }
}
