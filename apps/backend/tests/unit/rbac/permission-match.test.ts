import { matchesPermission } from '../../../src/shared/utils/permission-match.js';

describe('matchesPermission', () => {
  it('matches exact permission', () => {
    expect(matchesPermission(['leads.read'], 'leads.read')).toBe(true);
  });

  it('matches colon resource wildcard permissions', () => {
    expect(matchesPermission(['leads:all'], 'leads:write')).toBe(true);
  });

  it('matches dot-notation read permission', () => {
    expect(matchesPermission(['leads.read'], 'leads.read')).toBe(true);
  });

  it('rejects missing permission', () => {
    expect(matchesPermission(['customers.read'], 'leads.write')).toBe(false);
  });
});
