import { randomUUID } from 'node:crypto';

import type {
  EsignProvider,
  EsignRequest,
  EsignResponse,
  EsignStatus,
} from './esign.interface.js';

interface MockSignRecord {
  response: EsignResponse;
  createdAt: number;
}

const store = new Map<string, MockSignRecord>();

function delay(min = 150, max = 400): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(method: string, detail: string): void {
  console.log(`[MockEsign] ${method}: ${detail}`);
}

function simulateStatusProgression(createdAt: number): EsignStatus {
  const elapsed = Date.now() - createdAt;
  if (elapsed < 5_000) return 'CREATED';
  if (elapsed < 10_000) return 'SENT';
  if (elapsed < 20_000) return 'VIEWED';
  return 'SIGNED';
}

export class MockEsignProvider implements EsignProvider {
  readonly providerName = 'mock';

  async createSignRequest(req: EsignRequest): Promise<EsignResponse> {
    await delay();
    const requestId = `MOCK-ESIGN-${randomUUID().slice(0, 8).toUpperCase()}`;
    const response: EsignResponse = {
      requestId,
      signingUrl: `https://mock-esign.localhost/sign/${requestId}`,
      status: 'CREATED',
      provider: this.providerName,
    };
    store.set(requestId, { response, createdAt: Date.now() });
    log('createSignRequest', `id=${requestId} doc=${req.documentName} signer=${req.signerName}`);
    return response;
  }

  async getStatus(requestId: string): Promise<EsignResponse> {
    await delay();
    const record = store.get(requestId);
    if (!record) {
      log('getStatus', `id=${requestId} not found, returning EXPIRED`);
      return {
        requestId,
        signingUrl: '',
        status: 'EXPIRED',
        provider: this.providerName,
      };
    }
    record.response.status = simulateStatusProgression(record.createdAt);
    log('getStatus', `id=${requestId} status=${record.response.status}`);
    return { ...record.response };
  }

  async downloadSigned(requestId: string): Promise<Buffer> {
    await delay();
    log('downloadSigned', `id=${requestId} returning mock PDF`);
    return Buffer.from(`%PDF-1.4 mock-signed-document ${requestId}`, 'utf-8');
  }
}
