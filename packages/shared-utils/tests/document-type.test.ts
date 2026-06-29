import { describe, expect, it } from 'vitest';

import {
  formatDocumentChecklistLabel,
  formatDocumentTypeLabel,
  resolveDocumentTypeForLabel,
} from '../src/document-type.js';

describe('document-type utils', () => {
  const types = [
    { id: '1', code: 'PAN', name: 'PAN Card' },
    { id: '2', code: 'AADHAAR', name: 'Aadhaar Card' },
    { id: '3', code: 'BANK_STATEMENT', name: 'Bank Statement' },
    { id: '4', code: 'SALARY_SLIP', name: 'Salary Slip' },
  ];

  it('formats nested document type object', () => {
    expect(formatDocumentTypeLabel({ name: 'PAN Card', code: 'PAN' })).toBe('PAN Card');
    expect(formatDocumentTypeLabel({ code: 'AADHAAR' })).toBe('Aadhaar');
  });

  it('never returns object Object string', () => {
    expect(formatDocumentTypeLabel({ foo: 'bar' })).toBe('Unknown Document');
    expect(formatDocumentTypeLabel(undefined)).toBe('Unknown Document');
  });

  it('resolves checklist labels', () => {
    expect(resolveDocumentTypeForLabel('PAN', types)?.code).toBe('PAN');
    expect(resolveDocumentTypeForLabel('Income proof', types)?.code).toBe('SALARY_SLIP');
    expect(resolveDocumentTypeForLabel('Bank statements', types)?.code).toBe('BANK_STATEMENT');
  });

  it('resolves income proof to INCOME_PROOF when seeded', () => {
    const withIncome = [...types, { id: '5', code: 'INCOME_PROOF', name: 'Income Proof' }];
    expect(resolveDocumentTypeForLabel('Income proof', withIncome)?.code).toBe('INCOME_PROOF');
  });

  it('formats checklist display labels', () => {
    expect(formatDocumentChecklistLabel('income proof')).toBe('Income Proof');
    expect(formatDocumentChecklistLabel('address proof')).toBe('Address Proof');
  });
});
