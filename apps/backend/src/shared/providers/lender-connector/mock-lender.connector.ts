import { randomUUID } from 'node:crypto';

import type {
  LenderApplication,
  LenderApplicationStatus,
  LenderConnector,
  SubmitApplicationParams,
} from './lender-connector.interface.js';

const applications = new Map<string, LenderApplication>();

function delay(min = 200, max = 500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(method: string, detail: string): void {
  console.log(`[MockLender] ${method}: ${detail}`);
}

function randomStatus(): LenderApplicationStatus {
  const statuses: LenderApplicationStatus[] = [
    'SUBMITTED',
    'PROCESSING',
    'APPROVED',
    'REJECTED',
    'DISBURSED',
  ];
  return statuses[Math.floor(Math.random() * statuses.length)]!;
}

export class MockLenderConnector implements LenderConnector {
  readonly lenderCode: string;
  readonly lenderName: string;

  constructor(lenderCode = 'MOCK', lenderName = 'Mock Lender (Dev)') {
    this.lenderCode = lenderCode;
    this.lenderName = lenderName;
  }

  async submitApplication(params: SubmitApplicationParams): Promise<LenderApplication> {
    await delay();
    const externalRefId = `${this.lenderCode}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const app: LenderApplication = {
      externalRefId,
      status: 'SUBMITTED',
      lenderName: this.lenderName,
      remarks: `Application received for ${params.applicantName}`,
      sanctionAmount: undefined,
      sanctionDate: undefined,
      disbursementAmount: undefined,
      disbursementDate: undefined,
    };
    applications.set(externalRefId, app);
    log('submitApplication', `ref=${externalRefId} applicant=${params.applicantName} amount=${params.requestedAmount}`);
    return app;
  }

  async checkStatus(externalRefId: string): Promise<LenderApplication> {
    await delay();
    const existing = applications.get(externalRefId);
    if (existing) {
      existing.status = randomStatus();
      if (existing.status === 'APPROVED' || existing.status === 'DISBURSED') {
        existing.sanctionAmount = existing.sanctionAmount ?? Math.floor(Math.random() * 5_000_000) + 500_000;
        existing.sanctionDate = existing.sanctionDate ?? new Date().toISOString();
      }
      if (existing.status === 'DISBURSED') {
        existing.disbursementAmount = existing.sanctionAmount;
        existing.disbursementDate = new Date().toISOString();
      }
      log('checkStatus', `ref=${externalRefId} status=${existing.status}`);
      return existing;
    }

    const app: LenderApplication = {
      externalRefId,
      status: randomStatus(),
      lenderName: this.lenderName,
      remarks: 'Status retrieved (mock)',
    };
    applications.set(externalRefId, app);
    log('checkStatus', `ref=${externalRefId} status=${app.status} (new entry)`);
    return app;
  }

  async cancelApplication(externalRefId: string): Promise<{ success: boolean }> {
    await delay();
    const existed = applications.delete(externalRefId);
    log('cancelApplication', `ref=${externalRefId} existed=${existed}`);
    return { success: true };
  }
}
