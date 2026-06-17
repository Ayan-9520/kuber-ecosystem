import { buildPaginatedMeta, parsePagination } from '../src/pagination.js';
import { formatCurrency, formatDate, maskPan, maskPhone } from '../src/format.js';
import { isValidIndianMobile, normalizeIndianPhone, toE164Indian } from '../src/phone.js';

describe('shared utils', () => {
  describe('pagination', () => {
    it('parses defaults', () => {
      expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('caps limit at 100', () => {
      expect(parsePagination({ limit: 500 }).limit).toBe(100);
    });

    it('builds meta', () => {
      expect(buildPaginatedMeta(1, 20, 45)).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });
  });

  describe('format', () => {
    it('formats INR currency', () => {
      expect(formatCurrency(100000)).toContain('1,00,000');
    });

    it('formats date', () => {
      expect(formatDate('2026-06-10')).toMatch(/Jun/);
    });

    it('masks phone and pan', () => {
      expect(maskPhone('9876543210')).toBe('98******10');
      expect(maskPan('ABCDE1234F')).toBe('AB****4F');
    });
  });

  describe('phone', () => {
    it('normalizes +91 prefix', () => {
      expect(normalizeIndianPhone('+91 98765 43210')).toBe('9876543210');
    });

    it('validates indian mobile', () => {
      expect(isValidIndianMobile('9876543210')).toBe(true);
      expect(isValidIndianMobile('5876543210')).toBe(false);
    });

    it('converts to E164', () => {
      expect(toE164Indian('9876543210')).toBe('+919876543210');
    });
  });
});
