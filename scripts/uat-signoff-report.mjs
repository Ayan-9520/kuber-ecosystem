#!/usr/bin/env node
/**
 * KuberOne UAT Signoff Report — outputs certification percentages and final verdict.
 * Uses file-based signals when API/DB unavailable (CI, offline).
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs');
const outFile = join(outDir, 'UAT_SIGNOFF_REPORT.md');

function readJson(path) {
  const full = join(root, path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, 'utf8'));
  } catch {
    return null;
  }
}

const securityReport = readJson('security-testing/reports/security-coverage-report.json');
const hasAudit = existsSync(join(root, 'docs/ENTERPRISE_AUDIT_REPORT.md'));
const hasGoLive = existsSync(join(root, 'deployment/go-live/GO_LIVE_FRAMEWORK.md'));
const hasUatFramework = existsSync(join(root, 'deployment/uat/UAT_SIGNOFF_FRAMEWORK.md'));

const criticalSecurity = securityReport?.criticalFindings?.length ?? 0;

// Infrastructure-based readiness scores (when DB not available)
const business = hasUatFramework ? 40 : 0;
const technology = 60;
const operations = hasGoLive ? 70 : 30;
const security = criticalSecurity === 0 && hasAudit ? 50 : 20;
const management = 0;

const goLiveApprovalPct = Math.round((business + technology + operations + security + management) / 5);

let finalUatStatus = 'NOT APPROVED';
if (goLiveApprovalPct >= 85 && criticalSecurity === 0 && hasAudit && hasGoLive) {
  finalUatStatus = 'APPROVED FOR GO-LIVE';
} else if (goLiveApprovalPct >= 50) {
  finalUatStatus = 'PARTIALLY APPROVED';
}

const report = `# KuberOne Final UAT Signoff Report

Generated: ${new Date().toISOString()}

## Certification Scores

| Domain | Approval % |
|--------|------------|
| Business | ${business}% |
| Technology | ${technology}% |
| Operations | ${operations}% |
| Security | ${security}% |
| Management | ${management}% |
| **Go-Live Approval** | **${goLiveApprovalPct}%** |

## Final Verdict

- **Final UAT Status:** ${finalUatStatus}
- **Launch Authorization:** ${finalUatStatus === 'APPROVED FOR GO-LIVE' ? 'AUTHORIZED' : 'NOT AUTHORIZED'}

## Quality Gate Signals

- Production Readiness Audit: ${hasAudit ? 'Present' : 'Missing'}
- Go-Live Framework: ${hasGoLive ? 'Present' : 'Missing'}
- UAT Signoff Framework: ${hasUatFramework ? 'Present' : 'Missing'}
- Critical Security Findings: ${criticalSecurity}

## Note

For live stakeholder approval percentages, use \`GET /api/v1/uat/status\` or CRM **UAT Framework → Signoff Dashboard**.
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, report, 'utf8');
console.log(report);
console.log(`\nReport written to ${outFile}`);
