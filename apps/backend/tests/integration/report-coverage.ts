import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { flushFlowCoverage } from './helpers/flow-coverage.js';

const artifactsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '.artifacts');

const report = flushFlowCoverage();
mkdirSync(artifactsDir, { recursive: true });
writeFileSync(path.join(artifactsDir, 'flow-coverage.json'), JSON.stringify(report, null, 2));
writeFileSync(
  path.join(artifactsDir, 'module-coverage.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), modules: report.moduleCoverage }, null, 2),
);
writeFileSync(
  path.join(artifactsDir, 'failure-report.json'),
  JSON.stringify({ missingFlows: report.missing, generatedAt: new Date().toISOString() }, null, 2),
);
console.log(
  `[integration] Flow coverage: ${report.coveredFlows}/${report.totalFlows} (${report.coveragePercent}%)`,
);
