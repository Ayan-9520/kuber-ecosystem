/**
 * Client-side CSV/TSV parsing for statement upload.
 * Matching runs on the server — this only builds JSON rows for POST /statements.
 */

import { REQUIRED_STATEMENT_HEADERS } from './types';
import type { CreateStatementLineInput } from './types';

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

const HEADER_ALIASES: Record<string, string> = {
  'customer name': 'Customer Name',
  customer: 'Customer Name',
  'commission amount': 'Commission Amount',
  commission: 'Commission Amount',
  'bank reference': 'Bank Reference',
  reference: 'Bank Reference',
  utr: 'Bank Reference',
  'loan account number': 'Loan Account Number',
  'loan account': 'Loan Account Number',
  lan: 'Loan Account Number',
  'application number': 'Application Number',
  application: 'Application Number',
  pan: 'PAN',
  'disbursed amount': 'Disbursed Amount',
  'loan amount': 'Disbursed Amount',
  'gst amount': 'GST Amount',
  gst: 'GST Amount',
  'tds amount': 'TDS Amount',
  tds: 'TDS Amount',
  'net amount': 'Net Amount',
  'payout date': 'Payout Date',
};

export function canonicalizeHeader(h: string): string {
  const key = normalizeHeader(h);
  return HEADER_ALIASES[key] ?? h.trim();
}

export function validateStatementFormat(headers: string[]): {
  ok: boolean;
  errors: string[];
  warnings: string[];
  headers: string[];
} {
  const canonical = headers.map(canonicalizeHeader);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!headers.length) {
    return { ok: false, errors: ['File has no header row'], warnings, headers: canonical };
  }

  for (const required of REQUIRED_STATEMENT_HEADERS) {
    if (!canonical.includes(required)) {
      errors.push(`Missing required column: ${required}`);
    }
  }

  const dupes = canonical.filter((h, i) => canonical.indexOf(h) !== i);
  if (dupes.length) {
    warnings.push(`Duplicate columns: ${[...new Set(dupes)].join(', ')}`);
  }

  return { ok: errors.length === 0, errors, warnings, headers: canonical };
}

export function parseDelimitedText(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (!lines.length) return { headers: [], rows: [] };

  const firstLine = lines[0] ?? '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  const splitLine = (line: string): string[] => {
    if (delimiter === '\t') return line.split('\t').map((c) => c.trim());
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cells.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  const rawHeaders = splitLine(firstLine);
  const headers = rawHeaders.map(canonicalizeHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i] ?? '');
    if (cells.every((c) => !c)) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function parseAmount(raw: string): number {
  const n = Number(String(raw).replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function rowsToStatementLines(rows: Record<string, string>[]): CreateStatementLineInput[] {
  return rows.map((raw) => {
    const commissionAmount = parseAmount(raw['Commission Amount'] ?? '0');
    const gstAmount = parseAmount(raw['GST Amount'] ?? '0');
    const tdsAmount = parseAmount(raw['TDS Amount'] ?? '0');
    const netRaw = raw['Net Amount'];
    return {
      bankReference: (raw['Bank Reference'] ?? '').trim() || undefined,
      loanAccountNumber: (raw['Loan Account Number'] ?? '').trim() || undefined,
      applicationNumber: (raw['Application Number'] ?? '').trim() || undefined,
      customerName: (raw['Customer Name'] ?? '').trim(),
      pan: (raw['PAN'] ?? '').trim() || undefined,
      disbursedAmount: parseAmount(raw['Disbursed Amount'] ?? '0') || undefined,
      commissionAmount,
      gstAmount: gstAmount || undefined,
      tdsAmount: tdsAmount || undefined,
      netAmount: netRaw ? parseAmount(netRaw) : undefined,
      payoutDate: (raw['Payout Date'] ?? '').trim() || undefined,
      rawPayload: raw,
    };
  });
}

export function buildTemplateCsv(): string {
  const headers = [
    'Customer Name',
    'Commission Amount',
    'Loan Account Number',
    'Application Number',
    'PAN',
    'Disbursed Amount',
    'GST Amount',
    'TDS Amount',
    'Net Amount',
    'Payout Date',
    'Bank Reference',
  ];
  const sample = [
    'Suresh Mehta',
    '34000',
    '',
    'HDFC-HL-982341',
    'ABCDE1234F',
    '6500000',
    '6120',
    '1700',
    '38420',
    '2026-07-10',
    'HDFC-UTR-77001',
  ];
  return `${headers.join(',')}\n${sample.join(',')}\n`;
}

export const SAMPLE_STATEMENT_CSV = `Customer Name,Commission Amount,Loan Account Number,Application Number,PAN,Disbursed Amount,GST Amount,TDS Amount,Net Amount,Payout Date,Bank Reference
Suresh Mehta,34000,,HDFC-HL-982341,ABCDE1234F,6500000,6120,1700,38420,2026-07-10,HDFC-UTR-SAMPLE-1
Neha Kulkrni,24800,,, ,4500000,4464,1240,28024,2026-07-12,HDFC-UTR-SAMPLE-2
Unknown Payer,12000,UNKNOWN-LAN-999,APP-UNKNOWN-999,ZZZZZ9999Z,500000,2160,600,13560,2026-07-18,HDFC-UTR-SAMPLE-3
`.replace(', ,', ',,');
