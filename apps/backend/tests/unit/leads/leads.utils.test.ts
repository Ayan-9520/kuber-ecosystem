import {
  buildPaginationMeta,
  computeSlaDeadline,
  generateLeadNumber,
  leadsToCsv,
  scoreToGrade,
} from '../../../src/modules/leads/utils/leads.utils.js';

describe('leads utils', () => {
  it('builds pagination meta', () => {
    expect(buildPaginationMeta(2, 10, 25)).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
  });

  it('increments lead number sequence', () => {
    expect(generateLeadNumber('KFL-000010')).toBe('KFL-000011');
  });

  it('maps score to grade', () => {
    expect(scoreToGrade(95)).toBe('A_PLUS');
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(55)).toBe('B');
    expect(scoreToGrade(25)).toBe('C');
    expect(scoreToGrade(5)).toBe('REJECTED');
  });

  it('computes SLA deadline by grade', () => {
    const deadline = computeSlaDeadline('A');
    expect(deadline).toBeInstanceOf(Date);
    expect(deadline!.getTime()).toBeGreaterThan(Date.now());
  });

  it('exports leads to CSV', () => {
    const csv = leadsToCsv([
      {
        leadNumber: 'KFL-000001',
        prospectName: 'Test "User"',
        prospectPhone: '9876543210',
        status: 'NEW',
        grade: 'A',
        score: 80,
        requestedAmount: 500000,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
    expect(csv).toContain('Lead Number');
    expect(csv).toContain('KFL-000001');
    expect(csv).toContain('""User""');
  });
});
