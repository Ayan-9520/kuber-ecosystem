export type PerfDomain =
  | 'backend'
  | 'database'
  | 'crm'
  | 'mobile-customer'
  | 'mobile-dsa'
  | 'ai'
  | 'notifications'
  | 'analytics';

export type LoadTier = 100 | 500 | 1000 | 5000 | 10000;

export type TestType = 'load' | 'stress' | 'spike' | 'endurance' | 'smoke';

export interface PerfThresholds {
  apiP95Ms: number;
  apiP99Ms: number;
  dashboardLoadMs: number;
  pageNavigationMs: number;
  appStartupMs: number;
  errorRateMax: number;
}

export interface LoadScenario {
  id: string;
  name: string;
  description: string;
  k6Script: string;
  artilleryScript?: string;
  domain: PerfDomain;
  defaultVus: number;
}

export interface PerfMetrics {
  avgResponseMs: number;
  p95ResponseMs: number;
  p99ResponseMs: number;
  throughputRps: number;
  errorRate: number;
  maxConcurrentUsers: number;
}

export interface PerfReport {
  generatedAt: string;
  coveragePercent: number;
  metrics: PerfMetrics;
  scores: {
    backend: number;
    database: number;
    crm: number;
    mobile: number;
    ai: number;
    notifications: number;
    analytics: number;
    overall: number;
    scalability: number;
    readiness: number;
  };
  bottlenecks: string[];
  optimizations: string[];
  testCounts: { passed: number; failed: number; total: number };
}
