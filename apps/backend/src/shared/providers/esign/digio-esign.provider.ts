import type {
  EsignProvider,
  EsignRequest,
  EsignResponse,
} from './esign.interface.js';
import { MockEsignProvider } from './mock-esign.provider.js';

// Digio API v2: https://api.digio.in/v2/
// Docs: https://docs.digio.in/
//
// Env vars required:
//   DIGIO_CLIENT_ID
//   DIGIO_CLIENT_SECRET
//   DIGIO_API_URL  (default: https://api.digio.in/v2)
//
// Key endpoints:
//   POST   /v2/client/document/upload          — upload document for signing
//   POST   /v2/client/document/{id}/sign       — initiate signing request
//   GET    /v2/client/document/{id}            — get document / signing status
//   GET    /v2/client/document/{id}/download   — download signed document

const mock = new MockEsignProvider();

export class DigioEsignProvider implements EsignProvider {
  readonly providerName = 'digio';

  private readonly clientId = process.env.DIGIO_CLIENT_ID ?? '';
  private readonly clientSecret = process.env.DIGIO_CLIENT_SECRET ?? '';
  private readonly apiUrl = process.env.DIGIO_API_URL ?? 'https://api.digio.in/v2';

  // TODO: Replace mock delegation with actual Digio API calls
  async createSignRequest(req: EsignRequest): Promise<EsignResponse> {
    this.assertConfigured();
    console.log(`[Digio] createSignRequest → delegating to mock (apiUrl=${this.apiUrl})`);
    const res = await mock.createSignRequest(req);
    return { ...res, provider: this.providerName };
  }

  // TODO: Replace mock delegation with actual Digio API calls
  async getStatus(requestId: string): Promise<EsignResponse> {
    this.assertConfigured();
    console.log(`[Digio] getStatus → delegating to mock`);
    const res = await mock.getStatus(requestId);
    return { ...res, provider: this.providerName };
  }

  // TODO: Replace mock delegation with actual Digio API calls
  async downloadSigned(requestId: string): Promise<Buffer> {
    this.assertConfigured();
    console.log(`[Digio] downloadSigned → delegating to mock`);
    return mock.downloadSigned(requestId);
  }

  private assertConfigured(): void {
    if (!this.clientId || !this.clientSecret) {
      console.warn('[Digio] DIGIO_CLIENT_ID / DIGIO_CLIENT_SECRET not set — using mock fallback');
    }
  }
}
