import type { LoadScenario } from '../types.js';

export const LOAD_SCENARIOS: LoadScenario[] = [
  {
    id: 'S1',
    name: '100 Concurrent Logins',
    description: 'OTP send + verify burst simulating concurrent mobile logins',
    k6Script: 'performance-testing/k6/scenarios/scenario-01-concurrent-logins.js',
    artilleryScript: 'performance-testing/artillery/scenario-01-logins.yml',
    domain: 'backend',
    defaultVus: 100,
  },
  {
    id: 'S2',
    name: '1000 Lead Creations',
    description: 'Bulk lead ingestion for DSA and CRM flows',
    k6Script: 'performance-testing/k6/scenarios/scenario-02-lead-creations.js',
    artilleryScript: 'performance-testing/artillery/scenario-02-leads.yml',
    domain: 'backend',
    defaultVus: 200,
  },
  {
    id: 'S3',
    name: '500 Application Submissions',
    description: 'Customer application wizard API load',
    k6Script: 'performance-testing/k6/scenarios/scenario-03-applications.js',
    domain: 'backend',
    defaultVus: 150,
  },
  {
    id: 'S4',
    name: 'Bulk Document Uploads',
    description: 'Presigned upload and document metadata API stress',
    k6Script: 'performance-testing/k6/scenarios/scenario-04-documents.js',
    domain: 'backend',
    defaultVus: 100,
  },
  {
    id: 'S5',
    name: 'Mass Notification Blast',
    description: 'Email/SMS/push queue throughput',
    k6Script: 'performance-testing/k6/scenarios/scenario-05-notifications.js',
    artilleryScript: 'performance-testing/artillery/scenario-05-notifications.yml',
    domain: 'notifications',
    defaultVus: 300,
  },
  {
    id: 'S6',
    name: 'AI Advisor Burst',
    description: 'AI chat and advisor completion burst',
    k6Script: 'performance-testing/k6/scenarios/scenario-06-ai-burst.js',
    domain: 'ai',
    defaultVus: 50,
  },
  {
    id: 'S7',
    name: 'Dashboard Analytics Queries',
    description: 'CRM and executive analytics dashboard load',
    k6Script: 'performance-testing/k6/scenarios/scenario-07-analytics.js',
    artilleryScript: 'performance-testing/artillery/scenario-07-analytics.yml',
    domain: 'analytics',
    defaultVus: 200,
  },
];

export function getScenarioCoverage(): { total: number; withK6: number; withArtillery: number } {
  const total = LOAD_SCENARIOS.length;
  const withK6 = LOAD_SCENARIOS.filter((s) => s.k6Script).length;
  const withArtillery = LOAD_SCENARIOS.filter((s) => s.artilleryScript).length;
  return { total, withK6, withArtillery };
}
