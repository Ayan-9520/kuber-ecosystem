import type { BackendEnv } from './env.js';

export type DeploymentRolloutPhase = 'staged' | 'full';

export function getRolloutPhase(env: BackendEnv): DeploymentRolloutPhase {
  return env.DEPLOYMENT_ROLLOUT_PHASE ?? 'staged';
}

export function isProductionEnv(env: BackendEnv): boolean {
  return env.APP_ENV === 'production' || env.NODE_ENV === 'production';
}

export function isStagedRollout(env: BackendEnv): boolean {
  return isProductionEnv(env) && getRolloutPhase(env) === 'staged';
}

export function isFullRollout(env: BackendEnv): boolean {
  return isProductionEnv(env) && getRolloutPhase(env) === 'full';
}
