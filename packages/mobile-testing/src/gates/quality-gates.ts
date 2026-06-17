export interface QualityGateResult {
  passed: boolean;
  failures: string[];
}

export const CRITICAL_FLOWS = [
  'auth:otp-login',
  'auth:token-refresh',
  'auth:session-expiry',
  'auth:logout',
  'customer:application-flow',
  'customer:document-upload',
  'dsa:lead-flow',
  'dsa:commission-view',
  'notifications:foreground',
  'navigation:tab-switch',
] as const;

export function evaluateQualityGates(results: Record<string, boolean>): QualityGateResult {
  const failures = CRITICAL_FLOWS.filter((flow) => results[flow] === false);
  return { passed: failures.length === 0, failures: [...failures] };
}
