import { randomUUID } from 'node:crypto';

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

// ── Razorpay API response types ─────────────────────────────────────────────

export interface RazorpayContact {
  id: string;
  entity: 'contact';
  name: string;
  email: string | null;
  contact: string | null;
  type: string | null;
  active: boolean;
  created_at: number;
}

export interface RazorpayFundAccount {
  id: string;
  entity: 'fund_account';
  contact_id: string;
  account_type: 'bank_account';
  bank_account: {
    ifsc: string;
    bank_name: string;
    name: string;
    account_number: string;
  };
  active: boolean;
  created_at: number;
}

export interface RazorpayPayout {
  id: string;
  entity: 'payout';
  fund_account_id: string;
  amount: number;
  currency: string;
  status: 'queued' | 'processing' | 'processed' | 'reversed' | 'cancelled' | 'rejected';
  purpose: string;
  mode: string;
  reference_id: string | null;
  narration: string | null;
  utr: string | null;
  failure_reason: string | null;
  created_at: number;
}

// ── Provider ────────────────────────────────────────────────────────────────

function getConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const accountNumber = process.env.RAZORPAY_PAYOUT_ACCOUNT_NUMBER;
  return { keyId, keySecret, accountNumber };
}

function isConfigured(): boolean {
  const { keyId, keySecret, accountNumber } = getConfig();
  return Boolean(keyId && keySecret && accountNumber);
}

function authHeader(): string {
  const { keyId, keySecret } = getConfig();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function razorpayFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { accountNumber } = getConfig();
  const res = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
      'X-Payout-Idempotency': randomUUID(),
      ...(accountNumber ? { 'X-Razorpay-Account': accountNumber } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Razorpay API error ${res.status}: ${errorBody}`);
  }

  return (await res.json()) as T;
}

async function razorpayGet<T>(path: string): Promise<T> {
  const res = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Razorpay API error ${res.status}: ${errorBody}`);
  }

  return (await res.json()) as T;
}

// ── Mock helpers (used when credentials are absent) ─────────────────────────

let mockSeq = 0;
function mockId(prefix: string): string {
  return `${prefix}_mock_${Date.now()}_${++mockSeq}`;
}

function warnMock(method: string): void {
  console.warn(`[RazorpayPayoutProvider] ${method}: credentials not configured — returning mock response`);
}

// ── Public API ──────────────────────────────────────────────────────────────

export const razorpayPayoutProvider = {
  async createContact(
    name: string,
    email: string,
    phone: string,
    type: 'customer' | 'vendor' | 'employee' | 'self' = 'vendor',
  ): Promise<RazorpayContact> {
    if (!isConfigured()) {
      warnMock('createContact');
      return {
        id: mockId('cont'),
        entity: 'contact',
        name,
        email,
        contact: phone,
        type,
        active: true,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    return razorpayFetch<RazorpayContact>('/contacts', { name, email, contact: phone, type });
  },

  async createFundAccount(
    contactId: string,
    bankName: string,
    accountNumber: string,
    ifsc: string,
  ): Promise<RazorpayFundAccount> {
    if (!isConfigured()) {
      warnMock('createFundAccount');
      return {
        id: mockId('fa'),
        entity: 'fund_account',
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: { ifsc, bank_name: bankName, name: 'Mock', account_number: accountNumber },
        active: true,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    return razorpayFetch<RazorpayFundAccount>('/fund_accounts', {
      contact_id: contactId,
      account_type: 'bank_account',
      bank_account: { name: bankName, ifsc, account_number: accountNumber },
    });
  },

  async createPayout(
    fundAccountId: string,
    amount: number,
    currency: string,
    narration: string,
    referenceId: string,
  ): Promise<RazorpayPayout> {
    if (!isConfigured()) {
      warnMock('createPayout');
      return {
        id: mockId('pout'),
        entity: 'payout',
        fund_account_id: fundAccountId,
        amount,
        currency,
        status: 'processing',
        purpose: 'payout',
        mode: 'NEFT',
        reference_id: referenceId,
        narration,
        utr: null,
        failure_reason: null,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const { accountNumber } = getConfig();
    return razorpayFetch<RazorpayPayout>('/payouts', {
      account_number: accountNumber,
      fund_account_id: fundAccountId,
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      mode: 'NEFT',
      purpose: 'payout',
      narration,
      reference_id: referenceId,
    });
  },

  async getPayoutStatus(payoutId: string): Promise<RazorpayPayout> {
    if (!isConfigured()) {
      warnMock('getPayoutStatus');
      return {
        id: payoutId,
        entity: 'payout',
        fund_account_id: 'fa_mock',
        amount: 0,
        currency: 'INR',
        status: 'processed',
        purpose: 'payout',
        mode: 'NEFT',
        reference_id: null,
        narration: null,
        utr: 'MOCK_UTR_123',
        failure_reason: null,
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    return razorpayGet<RazorpayPayout>(`/payouts/${payoutId}`);
  },
};
