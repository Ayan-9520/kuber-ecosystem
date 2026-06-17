import { AxiosError } from 'axios';

import {
  formatCurrency,
  getApiErrorMessage,
  maskPhone,
  normalizePhone,
  str,
} from '@/lib/utils';

describe('Customer utils', () => {
  it('formats INR currency', () => {
    expect(formatCurrency(2500000)).toContain('25');
  });

  it('normalizes phone to 10 digits', () => {
    expect(normalizePhone('+91 98765-43210')).toBe('9876543210');
  });

  it('masks phone for display', () => {
    expect(maskPhone('9876543210')).toContain('98765');
  });

  it('maps network errors', () => {
    const err = new AxiosError('Network');
    err.code = 'ERR_NETWORK';
    expect(getApiErrorMessage(err)).toMatch(/Cannot reach server/);
  });

  it('stringifies empty values', () => {
    expect(str(null)).toBe('—');
    expect(str('hello')).toBe('hello');
  });
});
