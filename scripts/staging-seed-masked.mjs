#!/usr/bin/env node
/**
 * Staging seed with masked production-like data
 * Masks PII: phones, emails, PAN, Aadhaar in seed output
 */
import { execSync } from 'node:child_process';

console.log('==> Seeding staging with masked demo data');
execSync('pnpm --filter @kuberone/database seed', { stdio: 'inherit', env: {
  ...process.env,
  APP_ENV: 'staging',
  SEED_MASK_PII: 'true',
}});

console.log('==> Staging masked seed complete');
console.log('Demo accounts: admin@kuberfinserve.com, customer.demo@kuberone.com, dsa.demo@kuberone.com');
