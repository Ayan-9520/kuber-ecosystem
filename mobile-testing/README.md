# KuberOne Mobile Testing Framework

Enterprise mobile QA for **Customer** and **DSA** React Native apps.

## Commands

```bash
pnpm test:mobile              # Jest unit + integration + UI (both apps)
pnpm test:mobile:coverage     # Coverage reports
pnpm test:mobile:report       # Screen/device coverage JSON
pnpm test:mobile:gate         # Quality gate (fails CI on critical flows)
pnpm test:detox               # Detox E2E (requires native build)
pnpm test:e2e                 # Maestro flows (requires device + app)
```

## Stack

| Layer | Tool |
|-------|------|
| Unit / UI | Jest + React Native Testing Library |
| Shared fixtures | `@kuberone/mobile-testing` |
| E2E | Detox + Maestro |
| Device cloud | Firebase Test Lab matrix (`firebase/test-lab-matrix.json`) |
| Appium | `appium/capabilities.*.json` |

## Structure

- `packages/mobile-testing` — factories, mocks, screen registry, quality gates
- `apps/mobile-*/tests` — executable Jest suites
- `apps/mobile-*/e2e` — Detox specs
- `maestro/` — YAML flows
- `scripts/mobile-*.mjs` — reporting & gates
