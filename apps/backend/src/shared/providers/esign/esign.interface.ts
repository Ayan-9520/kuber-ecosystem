export interface EsignRequest {
  documentName: string;
  signerName: string;
  signerEmail: string;
  signerPhone: string;
  documentUrl?: string;
  documentContent?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export type EsignStatus = 'CREATED' | 'SENT' | 'VIEWED' | 'SIGNED' | 'EXPIRED' | 'REJECTED';

export interface EsignResponse {
  requestId: string;
  signingUrl: string;
  status: EsignStatus;
  provider: string;
}

export interface EsignProvider {
  providerName: string;
  createSignRequest(req: EsignRequest): Promise<EsignResponse>;
  getStatus(requestId: string): Promise<EsignResponse>;
  downloadSigned(requestId: string): Promise<Buffer>;
}
