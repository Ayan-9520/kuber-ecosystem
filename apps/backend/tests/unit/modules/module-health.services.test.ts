import { eligibilityService } from '../../../src/modules/eligibility/services/eligibility.service.js';
import { emiService } from '../../../src/modules/emi/services/emi.service.js';

describe('module health services', () => {
  it('emi module health', async () => {
    await expect(emiService.health()).resolves.toEqual({ module: 'emi', status: 'ok' });
  });

  it('eligibility module health', async () => {
    await expect(eligibilityService.health()).resolves.toEqual({ module: 'eligibility', status: 'ok' });
  });
});
