import type { BackendEnv } from '../../../config/env.js';
import { isFullRollout, isProductionEnv } from '../../../config/rollout.js';

export function isProductionEnvForProviders(env: BackendEnv): boolean {
  return isProductionEnv(env);
}

export function rejectMockProviderInProduction(env: BackendEnv, channel: string, resolved: string): void {
  if (!isProductionEnv(env) || resolved !== 'mock') return;
  if (isFullRollout(env)) {
    throw new Error(
      `${channel} provider resolved to mock in full production rollout. Configure provider credentials before startup.`,
    );
  }
}
