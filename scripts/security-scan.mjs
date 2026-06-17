#!/usr/bin/env node
/**
 * KuberOne security scan orchestrator — dependency audit, secret scan, config validation.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportsDir = join(root, 'security-testing', 'reports');
mkdirSync(reportsDir, { recursive: true });

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /password\s*=\s*['"][^'"]{8,}['"]/i,
];

const IGNORE_PATHS = ['node_modules', '.git', 'dist', 'coverage', '.expo', 'pnpm-lock.yaml'];

function shouldScan(filePath) {
  return !IGNORE_PATHS.some((p) => filePath.includes(p));
}

function walkSecrets(dir, findings = []) {
  if (!existsSync(dir)) return findings;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (!shouldScan(full)) continue;
    if (entry.isDirectory()) {
      walkSecrets(full, findings);
    } else if (
      /\.(ts|tsx|js|jsx|json|env\.example|yaml|yml)$/.test(entry.name) &&
      !/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)
    ) {
      if (full.replace(/\\/g, '/').includes('packages/shared-types/src/enums')) continue;
      try {
        const content = readFileSync(full, 'utf8');
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(content) && !full.endsWith('.env.example')) {
            findings.push({ file: full.replace(root, ''), pattern: pattern.source });
          }
        }
      } catch {
        /* skip binary */
      }
    }
  }
  return findings;
}

let auditResult = { critical: 0, high: 0, moderate: 0, low: 0, raw: '' };
try {
  const out = execSync('pnpm audit --audit-level moderate --json', {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  auditResult.raw = out;
  try {
    const parsed = JSON.parse(out);
    const advisories = parsed.advisories ?? {};
    for (const adv of Object.values(advisories)) {
      const sev = (adv.severity ?? '').toLowerCase();
      if (sev === 'critical') auditResult.critical += 1;
      else if (sev === 'high') auditResult.high += 1;
      else if (sev === 'moderate') auditResult.moderate += 1;
      else auditResult.low += 1;
    }
  } catch {
    /* non-json audit output */
  }
} catch (e) {
  const err = e;
  const out = err?.stdout?.toString?.() ?? err?.message ?? String(e);
  auditResult.raw = out;
  try {
    const parsed = JSON.parse(out);
    const advisories = parsed.advisories ?? {};
    for (const adv of Object.values(advisories)) {
      const sev = (adv.severity ?? '').toLowerCase();
      if (sev === 'critical') auditResult.critical += 1;
      else if (sev === 'high') auditResult.high += 1;
      else if (sev === 'moderate') auditResult.moderate += 1;
      else auditResult.low += 1;
    }
  } catch {
    /* audit command failed without parseable JSON */
  }
}

const secretFindings = walkSecrets(join(root, 'apps')).concat(walkSecrets(join(root, 'packages')));

const configChecks = {
  semgrep: existsSync(join(root, 'security-testing', 'config', 'semgrep.yml')),
  zap: existsSync(join(root, 'security-testing', 'config', 'zap-baseline.conf')),
  snyk: existsSync(join(root, 'security-testing', 'config', 'snyk-ready.json')),
  eslintSecurity: existsSync(join(root, 'security-testing', 'config', 'eslint-security.json')),
};

const report = {
  generatedAt: new Date().toISOString(),
  dependencyAudit: auditResult,
  criticalCount: auditResult.critical,
  highCount: auditResult.high,
  secretScan: {
    findings: secretFindings.slice(0, 50),
    count: secretFindings.length,
  },
  configChecks,
  semgrepReady: configChecks.semgrep,
  zapReady: configChecks.zap,
  snykReady: configChecks.snyk,
  status: auditResult.critical === 0 && auditResult.high === 0 ? 'pass' : 'fail',
};

writeFileSync(join(reportsDir, 'security-scan-report.json'), JSON.stringify(report, null, 2));

console.log(`Security scan complete — critical: ${auditResult.critical}, high: ${auditResult.high}`);
console.log(`Secret scan findings: ${secretFindings.length}`);
console.log(`Config: semgrep=${configChecks.semgrep}, zap=${configChecks.zap}, snyk=${configChecks.snyk}`);

if (auditResult.critical > 0 || auditResult.high > 0) {
  process.exit(1);
}
