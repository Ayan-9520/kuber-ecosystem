# KuberOne
## React Native Mobile App Architecture Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise React Native Mobile Architecture (MAD)  
**Classification:** Expo Ready | TypeScript Ready | Developer Ready | Production Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** React Native · Expo · TypeScript · Redux Toolkit · React Query · React Navigation · Axios · Formik · Yup · Firebase · OpenAI · AWS S3  
**Design System:** KuberOne — Premium Fintech · Dark Luxury  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete mobile architecture — Customer App, DSA App, shared platform, design system, security, roadmap |
| **Audience** | Mobile Engineers, Tech Leads, UX, Product, QA, DevOps |
| **Status** | Authoritative Mobile Master Guide |
| **Out of Scope** | Source code, UI mockups, wireframes, component implementations |

---

## Architecture Statistics

| Metric | Count |
|--------|-------|
| **Mobile applications** | 2 (Customer, DSA) |
| **Customer app modules** | 14 |
| **DSA app modules** | 10 |
| **Customer screens (Phase 1)** | 191 |
| **DSA screens (Phase 1)** | 55 |
| **Loan product variants** | 20 |
| **Navigation stacks** | 12 |
| **Redux slices (Customer)** | 8 |
| **Redux slices (DSA)** | 6 |
| **Shared packages consumed** | 7 |
| **Development phases** | 8 |
| **Future expansion modules** | 10 |

---

# 37. EXECUTIVE SUMMARY

*CTO-level mobile architecture summary — presented first.*

## Strategic Mobile Position

KuberOne mobile platform comprises **two Expo-based React Native applications** — **Customer App** (borrower self-service) and **DSA App** (partner distribution) — sharing a **unified mobile platform layer** (design system, API client, auth, storage, analytics) within the KuberOne monorepo. Both apps consume the same versioned REST API (`/api/v1`) with **role-scoped data isolation** enforced at API and client layers.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Expo (managed workflow)** | Accelerated iOS/Android delivery; OTA updates; EAS Build |
| **TypeScript end-to-end** | Type safety with `shared-types`, `shared-validation` |
| **Redux Toolkit** | Predictable global state — auth, wizard, offline queue, UI |
| **React Query (TanStack)** | Server state caching, invalidation, optimistic updates |
| **React Navigation 6** | Industry-standard; deep linking; nested navigators |
| **Formik + Yup** | Mature form handling; Yup mirrors backend validation rules |
| **Axios via `shared-api`** | Unified interceptors, token refresh, retry |
| **Dark Luxury design** | Premium fintech positioning; reduced eye strain; brand differentiation |
| **Feature-based folders** | Module isolation; parallel team development |
| **Presigned S3 uploads** | Documents bypass API body; native file picker → S3 direct |

## App Landscape

| App | Bundle ID | Users | Core Loop |
|-----|-----------|-------|-----------|
| **Customer** | `com.kuberfinserve.kuberone.customer` | Borrowers | Discover → Apply → Track → Grow |
| **DSA** | `com.kuberfinserve.kuberone.dsa` | Partners | Submit → Track → Earn |

## Development Timeline (Summary)

| Phase | Focus | Duration |
|-------|-------|----------|
| **1** | Platform scaffold, auth, navigation, design system | Weeks 1–4 |
| **2** | Customer core — dashboard, profile, products | Weeks 5–8 |
| **3** | Applications, documents, KYC | Weeks 9–12 |
| **4** | EMI, eligibility, loan product wizards | Weeks 13–16 |
| **5** | AI Advisor, Voice AI | Weeks 17–19 |
| **6** | Referral, support, notifications | Weeks 20–22 |
| **7** | DSA App complete | Weeks 23–26 |
| **8** | Production hardening, store submission | Weeks 27–30 |

## Security & Quality Posture

- JWT in `expo-secure-store`; refresh rotation handled by Axios interceptor
- Certificate pinning readiness (Phase 2)
- Biometric unlock readiness (Phase 2)
- Offline draft applications with sync queue
- Firebase Analytics + Crashlytics
- Accessibility WCAG 2.1 AA target
- App Store / Play Store compliance (DPDP consent, privacy policy)

**CTO Recommendation:** Approve this React Native Mobile Architecture as the mandatory implementation guide for all KuberOne mobile engineering.

---

# 1. MOBILE APP VISION

## 1.1 Business Goals

| # | Goal | Success Metric |
|---|------|----------------|
| 1 | **Digital loan origination** | 60%+ applications started via mobile |
| 2 | **DSA network enablement** | Lead submission < 2 minutes from DSA app |
| 3 | **Application completion rate** | 70%+ wizard completion (save/resume) |
| 4 | **AI differentiation** | 40%+ customers engage AI Advisor pre-application |
| 5 | **Partner retention** | DSA monthly active rate > 80% |
| 6 | **Cross-sell revenue** | 15%+ customers use referral program |
| 7 | **Operational efficiency** | 50% reduction in support calls via self-service |
| 8 | **Brand premium positioning** | App Store rating ≥ 4.5 stars |

## 1.2 User Goals

### Customer App Users

| Goal | Enabler |
|------|---------|
| Discover right loan product | Product catalog + AI recommendations |
| Check eligibility instantly | Eligibility engine + EMI calculator |
| Apply with minimal friction | Wizard with save/resume + document camera upload |
| Track application transparently | Real-time timeline + push notifications |
| Get expert guidance | AI Advisor + Voice AI |
| Earn through referrals | Referral dashboard + share tools |
| Resolve issues quickly | Support tickets + FAQ + live chat |

### DSA App Users

| Goal | Enabler |
|------|---------|
| Onboard quickly | Registration + KYC + agreement flow |
| Submit leads fast | Quick-submit FAB + minimal form |
| Track lead pipeline | Lead list + status + follow-ups |
| Monitor earnings | Commission dashboard + payout reports |
| Improve performance | Training + certification + leaderboard |
| Stay informed | Push notifications + in-app alerts |

## 1.3 Performance Goals

| Metric | Target |
|--------|--------|
| **Cold start** | < 2 seconds to interactive |
| **Screen transition** | < 300ms (60fps) |
| **API response rendering** | < 500ms after data received |
| **Image load** | < 1s for product images (cached) |
| **Document upload** | Progress feedback within 100ms |
| **AI chat first token** | < 2s (streaming) |
| **Offline mode** | Core screens readable; drafts saveable |
| **Bundle size** | < 25MB (excluding assets) |
| **Memory** | < 200MB average; no leaks on navigation |
| **Battery** | Background tasks minimized; FCM only |

## 1.4 Security Goals

| Goal | Implementation |
|------|----------------|
| **Token security** | Secure storage; no tokens in AsyncStorage |
| **Session integrity** | Auto-refresh; force logout on token family revocation |
| **Data isolation** | Customer sees own data; DSA sees own leads/commissions |
| **PII protection** | No PII in logs; screenshot prevention on KYC screens (Phase 2) |
| **Communication security** | TLS 1.3; certificate pinning readiness |
| **Device trust** | Device ID registration; anomaly detection (backend) |
| **Biometric readiness** | Architecture supports Face ID / fingerprint unlock |
| **Root/jailbreak detection** | Readiness hook; warn or restrict (Phase 2) |
| **DPDP compliance** | Consent capture; privacy controls; data deletion request |

## 1.5 Scalability Goals

| Dimension | Strategy |
|-----------|----------|
| **Feature scale** | Feature modules plug in without navigation redesign |
| **Product scale** | New loan products = new wizard steps + product cards |
| **Screen scale** | 191+ customer screens organized in feature folders |
| **Team scale** | Parallel development per feature module |
| **OTA updates** | Expo EAS Update for JS bundle patches |
| **A/B testing** | Feature flags via remote config (Phase 2) |
| **Localization** | i18n architecture; English first; Hindi Phase 2 |
| **Tablet readiness** | Responsive layouts; optional tablet breakpoints Phase 3 |

---

# 2. MOBILE APP OVERVIEW

## 2.1 Customer App

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/mobile-customer` |
| **App Name** | KuberOne |
| **Tagline** | Your AI-Powered Loan Partner |
| **Primary Color** | #22D3A6 (Teal Green) |
| **Target Users** | Retail borrowers, self-employed, business owners |
| **Platforms** | iOS 15+, Android 8+ (API 26+) |
| **Distribution** | App Store, Google Play (Expo EAS Submit) |

**Customer App Areas:**

| Area | Modules | Tab/Access |
|------|---------|------------|
| Public | Splash, Onboarding, Language | Pre-auth stack |
| Auth | OTP Login, Registration | Auth stack |
| Home | Dashboard, Notifications | Home tab |
| Products | Loan catalog, EMI, Eligibility | Products tab |
| Apply | Application wizard, tracking | Apply tab |
| AI | Advisor, Voice | AI tab |
| More | Profile, KYC, Documents, Referral, Support, Settings | More tab/drawer |

## 2.2 DSA App

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/mobile-dsa` |
| **App Name** | KuberOne Partner |
| **Tagline** | Grow Your Business with KuberOne |
| **Primary Color** | #22D3A6 (shared brand) |
| **Target Users** | DSA partners, referral partners |
| **Platforms** | iOS 15+, Android 8+ |
| **Distribution** | App Store, Google Play |

**DSA App Areas:**

| Area | Modules | Tab/Access |
|------|---------|------------|
| Onboarding | Registration, KYC, Agreement | Gate stack |
| Home | Dashboard, performance | Dashboard tab |
| Leads | Submit, track, follow-ups | Leads tab |
| Earnings | Commission, payouts, reports | Earnings tab |
| More | Training, profile, support, settings | More tab |

## 2.3 Shared Mobile Platform

| Layer | Package/Location | Shared Between |
|-------|------------------|----------------|
| **API client** | `packages/shared-api` | Customer + DSA |
| **Types** | `packages/shared-types` | Customer + DSA |
| **Validation** | `packages/shared-validation` | Customer + DSA (Yup mirrors Zod) |
| **Constants** | `packages/shared-constants` | Product codes, stages, enums |
| **Utils** | `packages/shared-utils` | Currency, date, phone formatting |
| **Design tokens** | `packages/shared-ui` | Colors, typography, spacing |
| **Mobile components** | Per-app `src/components/ui/` | Pattern-shared; not extracted Phase 1 |

**Shared services (identical implementation, app-specific config):**

| Service | Customer | DSA |
|---------|----------|-----|
| Auth (OTP) | ✓ | ✓ |
| Token refresh | ✓ | ✓ |
| FCM push | ✓ | ✓ |
| Secure storage | ✓ | ✓ |
| Analytics | ✓ | ✓ |
| Deep linking | ✓ | ✓ |
| Offline queue | ✓ | Limited |
| Document upload (S3) | ✓ | ✓ (lead docs) |

## 2.4 Future Modules

| Module | Customer App | DSA App | Integration |
|--------|-------------|---------|-------------|
| Insurance | New `features/insurance/` | Lead submit only | Product catalog extension |
| Credit Cards | `features/cards/` | — | Simplified application |
| Personal Loan | `features/personal-loan/` | Lead submit | Standard wizard |
| Mutual Funds | `features/wealth/mf/` | — | Order flow |
| Fixed Deposit | `features/wealth/fd/` | — | Booking flow |
| Gold Loan | `features/gold-loan/` | Lead submit | Collateral wizard |
| Wealth Management | `features/wealth/` | — | Portfolio view |
| Video KYC | Extend `features/kyc/` | Extend `features/kyc/` | WebRTC module |
| eSign | Extend `features/documents/` | — | WebView + webhook |
| Account Aggregator | Extend `features/documents/` | — | Consent + fetch |

---

# 3. MOBILE APP ARCHITECTURE

## 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REACT NATIVE + EXPO APPS                          │
│              mobile-customer                    mobile-dsa               │
├─────────────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                                      │
│  Screens · Components · Navigation · Theme · Animations · Layouts        │
├─────────────────────────────────────────────────────────────────────────┤
│  BUSINESS LAYER                                                          │
│  Feature Hooks · Formik Forms · Yup Validation · Business Rules          │
├─────────────────────────────────────────────────────────────────────────┤
│  STATE LAYER                                                             │
│  Redux Toolkit (auth, wizard, offline, UI) + React Query (server cache)  │
├─────────────────────────────────────────────────────────────────────────┤
│  API LAYER                                                               │
│  shared-api (Axios) · Interceptors · Token Refresh · Retry · Errors     │
├─────────────────────────────────────────────────────────────────────────┤
│  STORAGE LAYER                                                           │
│  Secure Store (tokens) · AsyncStorage (prefs, drafts) · File System      │
├─────────────────────────────────────────────────────────────────────────┤
│  SECURITY LAYER                                                          │
│  JWT · Device ID · Biometric readiness · SSL · PII masking               │
├─────────────────────────────────────────────────────────────────────────┤
│  ANALYTICS LAYER                                                         │
│  Firebase Analytics · Screen tracking · Funnel events · Crashlytics      │
├─────────────────────────────────────────────────────────────────────────┤
│  INTEGRATIONS                                                            │
│  Firebase FCM · OpenAI (AI/Voice) · AWS S3 (presigned) · Deep Links       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                    KUBERONE BACKEND API (/api/v1)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Presentation Layer

| Responsibility | Implementation |
|----------------|----------------|
| **Screen rendering** | Functional components; one screen per file |
| **UI composition** | Atomic components from `components/ui/` |
| **Navigation** | React Navigation stacks, tabs, drawers |
| **Theming** | Dark Luxury theme via `ThemeProvider` |
| **Animations** | Reanimated 3 for micro-interactions; Lottie for loading |
| **Layouts** | `AuthLayout`, `MainLayout`, `WizardLayout` shells |
| **Responsive** | Flexbox; `useWindowDimensions` for breakpoints |
| **Safe areas** | `SafeAreaProvider` + per-screen insets |
| **Keyboard** | `KeyboardAvoidingView` on all form screens |
| **Loading states** | Skeleton loaders; shimmer on cards |
| **Empty states** | Illustrated empty states per feature |
| **Error states** | Error boundary + retry UI per screen |

**Presentation layer rules:**

| Rule | Enforcement |
|------|-------------|
| Screens do not call Axios directly | Via hooks → React Query / services |
| Screens do not access Redux directly | Via typed selectors + dispatch hooks |
| Business logic not in screens | Extract to custom hooks |
| Styles use theme tokens only | No hardcoded colors except theme file |
| All touchables ≥ 44pt | Accessibility minimum |

## 3.3 Business Layer

| Component | Role |
|-----------|------|
| **Custom hooks** | `useApplicationWizard`, `useDocumentUpload`, `useOtpAuth` |
| **Formik forms** | All user input forms; `Formik` + `Yup` schema |
| **Yup schemas** | Mirror `shared-validation` Zod schemas |
| **Business rules** | Client-side pre-validation before API call |
| **Transformers** | API response → UI model (dates, currency, status labels) |
| **Wizards** | Multi-step form orchestration with step validation |
| **Offline logic** | Queue management; conflict detection |

## 3.4 State Layer

| State Type | Tool | Examples |
|------------|------|----------|
| **Server state** | React Query | Applications, leads, products, notifications |
| **Auth state** | Redux Toolkit | User, tokens, permissions, session |
| **Wizard state** | Redux Toolkit + persist | Application draft steps |
| **Offline queue** | Redux Toolkit + persist | Pending uploads, draft saves |
| **UI state** | Redux Toolkit | Active tab, modal open, bottom sheet |
| **Ephemeral** | React `useState` | Form focus, scroll position, animation |
| **Form state** | Formik internal | Field values, touched, errors |

## 3.5 API Layer

| Component | Package | Role |
|-----------|---------|------|
| **HTTP client** | `shared-api` | Axios instance with base URL |
| **Auth interceptor** | `shared-api` | Attach Bearer token |
| **Refresh interceptor** | `shared-api` | 401 → refresh → retry |
| **Error interceptor** | `shared-api` | Map API errors to app errors |
| **Retry interceptor** | `shared-api` | Exponential backoff on network failure |
| **Feature APIs** | `services/api/*.api.ts` | Thin wrappers per domain |
| **React Query hooks** | `features/*/hooks/` | `useApplications`, `useLeads` |

## 3.6 Storage Layer

| Storage | Library | Data |
|---------|---------|------|
| **Secure** | `expo-secure-store` | Access token, refresh token |
| **Preferences** | `@react-native-async-storage/async-storage` | Language, onboarding seen, theme |
| **Redux persist** | `redux-persist` + AsyncStorage | Wizard drafts, offline queue |
| **File system** | `expo-file-system` | Downloaded documents, cached images |
| **SQLite** (Phase 2) | `expo-sqlite` | Offline search index, large caches |

## 3.7 Security Layer

| Control | Implementation |
|---------|----------------|
| Token storage | `expo-secure-store` only |
| Auto-logout | On 401 after refresh failure |
| Request signing | `X-App-Version`, `X-Device-Id` headers |
| Sensitive screens | Prevent screenshot flag (Android Phase 2) |
| SSL | Default HTTPS; pinning readiness |
| Input sanitization | Yup validation + Formik |
| Deep link validation | Whitelist paths; auth gate |

## 3.8 Analytics Layer

| Tool | Purpose |
|------|---------|
| **Firebase Analytics** | Screen views, events, user properties |
| **Firebase Crashlytics** | Crash reporting, non-fatal errors |
| **Custom events** | Funnel tracking per Screen IA document |
| **Performance Monitoring** | Screen render time (Phase 2) |

---

# 4. APPLICATION STRUCTURE

## 4.1 Monorepo App Paths

```
kuberone/
├── apps/
│   ├── mobile-customer/          # Customer App
│   └── mobile-dsa/               # DSA Partner App
├── packages/
│   ├── shared-api/               # Axios client
│   ├── shared-types/             # API types
│   ├── shared-validation/        # Zod (backend); Yup mirrors in apps
│   ├── shared-constants/         # Enums, product codes
│   ├── shared-utils/             # Formatters
│   └── shared-ui/                # Design tokens
```

## 4.2 Complete App Entry Structure

```
apps/mobile-{customer|dsa}/
├── App.tsx                       # Root: providers wrapper
├── app.config.ts                 # Expo config (name, bundleId, plugins)
├── eas.json                      # EAS Build + Submit profiles
├── index.ts                      # registerRootComponent(App)
├── babel.config.js
├── metro.config.js               # Monorepo workspace resolution
├── tsconfig.json
├── .env.example
│
└── src/
    ├── app/                      # App bootstrap
    │   ├── AppProviders.tsx      # Redux, Query, Theme, Navigation, SafeArea
    │   ├── AppInitializer.tsx    # Auth check, fonts, splash hide
    │   └── ErrorBoundary.tsx     # Root error boundary
    │
    ├── navigation/               # Section 7
    ├── features/                 # Feature modules (Section 5/6)
    ├── components/               # Shared UI components
    ├── services/                 # API, storage, FCM, analytics
    ├── store/                    # Redux Toolkit (Section 9)
    ├── hooks/                    # Global hooks
    ├── theme/                    # Design system (Section 30)
    ├── utils/                    # Helpers
    ├── constants/                # Routes, config
    ├── types/                    # App-specific types
    ├── assets/                   # Images, fonts, Lottie
    └── layouts/                  # Screen layout shells
```

## 4.3 App Entry Bootstrap Sequence

| Step | Component | Action |
|------|-----------|--------|
| 1 | `index.ts` | Register root component |
| 2 | `App.tsx` | Render `AppProviders` |
| 3 | `AppProviders` | Wrap: Redux Provider → PersistGate → QueryClientProvider → ThemeProvider → SafeAreaProvider → NavigationContainer |
| 4 | `AppInitializer` | Load fonts (Inter); check auth token; register FCM; hide splash |
| 5 | `RootNavigator` | Route to Auth stack or Main stack based on auth state |
| 6 | `ErrorBoundary` | Catch unhandled render errors; show recovery UI |

## 4.4 Provider Hierarchy

```
<ErrorBoundary>
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkLuxuryTheme}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking}>
              <AppInitializer>
                <RootNavigator />
              </AppInitializer>
              <Toast />                    {/* Global toast */}
              <NetworkStatusBanner />      {/* Offline indicator */}
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
</ErrorBoundary>
```

## 4.5 Navigation Structure

*Detailed in Section 7.*

## 4.6 Feature Modules Structure

*Detailed in Sections 5 and 6.*

## 4.7 Services Structure

```
services/
├── api/
│   ├── auth.api.ts
│   ├── customer.api.ts
│   ├── application.api.ts
│   ├── document.api.ts
│   ├── product.api.ts
│   ├── eligibility.api.ts
│   ├── emi.api.ts
│   ├── kyc.api.ts
│   ├── ai.api.ts
│   ├── referral.api.ts
│   ├── support.api.ts
│   ├── notification.api.ts
│   └── index.ts
├── storage/
│   ├── secure-storage.ts         # Token read/write
│   ├── async-storage.ts          # Preferences
│   └── file-storage.ts           # Document cache
├── notifications/
│   ├── fcm.service.ts            # Register, handle, route
│   └── notification-router.ts    # Deep link on tap
├── analytics/
│   ├── analytics.service.ts      # Firebase wrapper
│   └── events.ts                 # Event name constants
├── upload/
│   ├── s3-upload.service.ts      # Presign → upload → confirm
│   └── upload-queue.service.ts   # Offline upload queue
├── biometrics/
│   └── biometric.service.ts      # Phase 2
└── network/
    └── network-monitor.ts        # NetInfo wrapper
```

## 4.8 Shared Components Structure

```
components/
├── ui/                           # Atomic (Section 29)
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Badge/
│   ├── Modal/
│   ├── BottomSheet/
│   ├── Loading/
│   ├── Skeleton/
│   └── EmptyState/
├── forms/                        # Formik-integrated
│   ├── OtpInput/
│   ├── PhoneInput/
│   ├── CurrencyInput/
│   ├── DatePicker/
│   ├── Select/
│   ├── Checkbox/
│   └── FormField/                # Label + error + Input wrapper
├── layout/
│   ├── ScreenContainer/
│   ├── Header/
│   ├── TabBar/
│   └── SafeAreaWrapper/
├── data-display/
│   ├── StatusBadge/
│   ├── Timeline/
│   ├── ProgressStepper/
│   ├── ApplicationCard/
│   ├── ProductCard/
│   └── KpiCard/
└── feedback/
    ├── Toast/
    ├── ErrorBoundary/
    ├── NetworkStatus/
    └── ConfirmDialog/
```

## 4.9 Theme Structure

*Detailed in Section 30.*

## 4.10 State Structure

*Detailed in Section 9.*

---

# 5. CUSTOMER APP ARCHITECTURE

## 5.1 Module Overview

| # | Module | Path | Screens (P1) | API Domain |
|---|--------|------|--------------|------------|
| 1 | Authentication | `features/auth` | 6 | `/auth` |
| 2 | Dashboard | `features/dashboard` | 4 | `/customer/dashboard` |
| 3 | Profile | `features/profile` | 8 | `/customer/profile` |
| 4 | KYC | `features/kyc` | 8 | `/customer/kyc` |
| 5 | Loan Products | `features/loan-products` | 18 | `/products` |
| 6 | Applications | `features/applications` | 32 | `/applications` |
| 7 | Documents | `features/documents` | 10 | `/documents` |
| 8 | AI Advisor | `features/ai-advisor` | 8 | `/ai/advisor` |
| 9 | Voice AI | `features/voice-ai` | 6 | `/ai/voice` |
| 10 | Referral | `features/referrals` | 8 | `/referrals` |
| 11 | Support | `features/support` | 10 | `/support` |
| 12 | Notifications | `features/notifications` | 6 | `/notifications` |
| 13 | Settings | `features/settings` | 12 | `/customer/settings` |
| 14 | EMI & Eligibility | `features/emi`, `features/eligibility` | 8 | `/emi`, `/eligibility` |

## 5.2 Standard Feature Module Pattern

```
features/{module}/
├── screens/                      # Screen components
├── components/                   # Module-specific UI
├── hooks/                        # useQuery hooks, business hooks
├── services/                     # API wrapper (optional if using global)
├── store/                        # Redux slice (if module state needed)
├── schemas/                      # Yup validation schemas
├── types/                        # Module TypeScript types
├── constants/                    # Module constants
├── navigation/                   # Stack navigator (if nested)
└── index.ts                      # Public exports
```

## 5.3 Authentication Module

| Screen | ID | Purpose |
|--------|-----|---------|
| SplashScreen | C-AUTH-001 | Brand splash; init check |
| OnboardingScreen | C-AUTH-002 | 3-slide value proposition |
| LanguageSelectionScreen | C-AUTH-003 | English (Hindi Phase 2) |
| LoginScreen | C-AUTH-004 | Phone number input |
| OtpVerificationScreen | C-AUTH-005 | 6-digit OTP |
| RegistrationScreen | C-AUTH-006 | Name, consent, referral code |

| Component/Hook | Role |
|----------------|------|
| `useOtpAuth` | Send OTP, verify, handle errors |
| `OtpResendTimer` | Countdown + resend logic |
| `auth.slice` | Auth state in Redux |
| Formik + Yup | Phone validation, OTP validation |

**Auth flow:** Splash → (onboarding if first launch) → Login → OTP → (registration if new) → Main tabs

## 5.4 Dashboard Module

| Screen | Purpose |
|--------|---------|
| DashboardScreen | Home hub — widgets, quick actions |
| NotificationsScreen | In-app notification list |

| Widget | Data Source | Query Key |
|--------|-------------|-----------|
| ApplicationStatusCard | Active application | `['application', 'active']` |
| QuickActionsGrid | Static + dynamic | — |
| AiInsightCard | AI recommendation | `['ai', 'insight']` |
| ProductRecommendations | Eligibility-based | `['products', 'recommended']` |
| ReferralBanner | Referral status | `['referrals', 'summary']` |
| NotificationBadge | Unread count | `['notifications', 'unread']` |

## 5.5 Profile Module

| Screen | Fields | API |
|--------|--------|-----|
| ProfileHubScreen | Completion %, sections | GET profile |
| PersonalDetailsScreen | Name, email, DOB, gender | PUT profile |
| AddressDetailsScreen | CRUD addresses | CRUD addresses |
| EmploymentDetailsScreen | Type, company, experience | CRUD employment |
| IncomeDetailsScreen | Source, amount, frequency | CRUD income |
| ProfileCompletionScreen | Gamified completion | GET completion |

| Pattern | Implementation |
|---------|----------------|
| Forms | Formik + Yup per screen |
| Save | Optimistic update via React Query mutation |
| Progress | `ProfileProgressBar` component |

## 5.6 KYC Module

| Screen | Flow |
|--------|------|
| KycHubScreen | Status overview; start/resume |
| PanVerificationScreen | PAN input → API verify |
| AadhaarVerificationScreen | Aadhaar OTP flow |
| PhotoUploadScreen | Camera capture → S3 |
| AddressProofScreen | Document picker → S3 |
| KycStatusScreen | Final status display |

| Hook | Role |
|------|------|
| `useKycFlow` | Orchestrate KYC steps; track completion |
| `useDocumentUpload` | Presign → upload → confirm |

## 5.7 Loan Products Module

| Screen | Content |
|--------|---------|
| ProductCatalogScreen | Grid of 4 product families |
| ProductDetailScreen | Family overview + variants |
| HomeLoanOverviewScreen | HL variants (Fresh, BT, Top-Up, BT+Top-Up) |
| LapOverviewScreen | LAP variants |
| BusinessLoanOverviewScreen | BL variants |
| AutoLoanOverviewScreen | AL variants |
| ProductComparisonScreen | Side-by-side compare |
| OffersScreen | Active lender offers |
| RecommendationsScreen | AI-powered suggestions |

## 5.8 Applications Module

| Screen | Purpose |
|--------|---------|
| ApplicationListScreen | All applications with status |
| ApplicationDetailScreen | Summary + actions |
| ApplicationTimelineScreen | Stage timeline |
| WizardContainerScreen | Multi-step application shell |
| WizardReviewScreen | Final review before submit |
| Product-specific steps | Per variant wizard steps |

| State | Implementation |
|-------|----------------|
| Wizard progress | `wizard.slice` (Redux persist) |
| Step validation | Yup per step; gate next button |
| Save/resume | Auto-save on step complete |
| Submit | Mutation → invalidate queries |

## 5.9 Documents Module

| Screen | Purpose |
|--------|---------|
| DocumentDashboardScreen | Required vs uploaded overview |
| DocumentUploadScreen | Camera/gallery picker |
| VerificationStatusScreen | Per-document status |
| DeficiencyScreen | Missing/rejected docs |
| DocumentVaultScreen | All uploaded documents |

## 5.10 AI Advisor Module

| Screen | Purpose |
|--------|---------|
| AdvisorHomeScreen | Entry + suggested questions |
| ConversationScreen | Chat interface (streaming) |
| RecommendationsScreen | Product recommendations |
| EligibilityResultsScreen | AI-triggered eligibility |
| AiInsightsScreen | Personalized insights |
| ConversationHistoryScreen | Past sessions |

## 5.11 Voice AI Module

| Screen | Purpose |
|--------|---------|
| VoiceStartScreen | Permission + intro |
| VoiceSessionScreen | Active voice conversation |
| VoiceResultsScreen | Summary of voice session |
| CallbackRequestScreen | Schedule callback |
| AppointmentBookingScreen | Book advisor appointment |

## 5.12 Referral Module

| Screen | Purpose |
|--------|---------|
| ReferralDashboardScreen | Code, stats, share |
| ReferralTrackingScreen | Referred users list |
| RewardsScreen | Earned/pending rewards |
| PayoutHistoryScreen | Reward payout history |
| LeaderboardScreen | Top referrers |

## 5.13 Support Module

| Screen | Purpose |
|--------|---------|
| HelpCenterScreen | Support hub |
| TicketListScreen | My tickets |
| CreateTicketScreen | New ticket form |
| TicketDetailScreen | Messages + status |
| ChatSupportScreen | Live chat (Phase 2) |
| FaqScreen | FAQ accordion |
| KnowledgeBaseScreen | KB articles |

## 5.14 Notifications Module

| Screen | Purpose |
|--------|---------|
| NotificationListScreen | All notifications |
| SmsHistoryScreen | SMS log |
| EmailHistoryScreen | Email log |
| WhatsAppHistoryScreen | WhatsApp log |

## 5.15 Settings Module

| Screen | Purpose |
|--------|---------|
| SettingsScreen | Settings menu |
| ProfileSettingsScreen | Edit profile shortcut |
| SecuritySettingsScreen | Sessions, biometric (Phase 2) |
| NotificationPreferencesScreen | Channel toggles |
| LanguagePreferencesScreen | Language selection |
| PrivacyControlsScreen | Consent management |
| TermsScreen | Terms of service |
| PrivacyScreen | Privacy policy |
| AboutScreen | App version, support |

---

# 6. DSA APP ARCHITECTURE

## 6.1 Module Overview

| # | Module | Path | Screens (P1) | API Domain |
|---|--------|------|--------------|------------|
| 1 | Auth | `features/auth` | 4 | `/auth` |
| 2 | Registration | `features/registration` | 4 | `/dsa/register` |
| 3 | KYC | `features/kyc` | 5 | `/dsa/kyc` |
| 4 | Dashboard | `features/dashboard` | 3 | `/dsa/dashboard` |
| 5 | Lead Submission | `features/lead-submission` | 4 | `/dsa/leads` |
| 6 | Lead Tracking | `features/lead-tracking` | 8 | `/dsa/leads` |
| 7 | Commission | `features/commission` | 8 | `/dsa/commissions` |
| 8 | Reports | `features/reports` | 4 | `/dsa/performance` |
| 9 | Training | `features/training` | 4 | `/knowledge/training` |
| 10 | Settings | `features/settings` | 6 | `/dsa/settings` |

## 6.2 DSA Onboarding Gate

| Gate | Condition | Screen |
|------|-----------|--------|
| Registration | Not registered | RegistrationScreen |
| KYC | KYC not submitted | PartnerKycHubScreen |
| Agreement | Agreement not signed | AgreementSignScreen |
| Certification | Training not complete | CertificationScreen |
| Active | All gates passed | Main tabs |

**Gate logic:** `OnboardingGateScreen` checks partner status from API; routes to incomplete step.

## 6.3 Registration Module

| Screen | Fields |
|--------|--------|
| RegistrationScreen | Phone (OTP), name, email |
| PartnerProfileSetupScreen | Business name, type, city |
| AgreementSignScreen | Digital agreement acceptance |

## 6.4 DSA Dashboard Module

| Widget | Data |
|--------|------|
| EarningsSummaryCard | Month earnings, pending, paid |
| LeadPipelineWidget | New, active, converted counts |
| QuickSubmitFab | Floating action → lead create |
| TargetProgressWidget | Monthly target vs actual |
| PerformanceRank | Percentile among partners |

## 6.5 Lead Submission Module

| Screen | Flow |
|--------|------|
| LeadCreateScreen | Customer name, phone, product |
| LeadProductSelectScreen | Product family + variant |
| LeadDocumentAttachScreen | Optional initial documents |

| Target | < 2 minutes from FAB tap to submit |
|--------|-------------------------------------|
| Form | Formik + Yup; minimal required fields |
| Offline | Queue lead if offline; sync on reconnect |

## 6.6 Lead Tracking Module

| Screen | Purpose |
|--------|---------|
| LeadListScreen | Filterable lead list |
| LeadDetailScreen | Lead 360 view |
| LeadDocumentsScreen | Attached documents |
| LeadStatusScreen | Status history |
| FollowUpsScreen | Scheduled follow-ups |

## 6.7 Commission Module

| Screen | Purpose |
|--------|---------|
| CommissionDashboardScreen | Summary cards |
| CommissionLedgerScreen | Paginated ledger |
| CommissionDetailScreen | Single commission detail |
| PayoutReportsScreen | Monthly statements |
| PayoutDetailScreen | Payout breakdown |
| DisputeScreen | Raise commission dispute |

## 6.8 Reports Module

| Screen | Purpose |
|--------|---------|
| PerformanceReportScreen | Charts: volume, conversion, SLA |
| LeaderboardScreen | Partner ranking |

## 6.9 Training Module

| Screen | Purpose |
|--------|---------|
| TrainingListScreen | Available courses |
| TrainingDetailScreen | Course content |
| CertificationScreen | Quiz + certification status |

## 6.10 DSA Tab Navigation

| Tab | Icon | Stack |
|-----|------|-------|
| Dashboard | Home | DashboardStack |
| Leads | Users | LeadStack (list + submit) |
| Earnings | Wallet | CommissionStack |
| More | Menu | MoreStack (training, profile, settings, support) |

---

# 7. NAVIGATION ARCHITECTURE

## 7.1 Navigation Hierarchy (Customer App)

```
RootNavigator (Stack)
├── SplashScreen
├── OnboardingStack
│   ├── OnboardingSlides
│   └── LanguageSelection
├── AuthStack
│   ├── Login
│   ├── OtpVerification
│   └── Registration
└── MainTabs (Bottom Tab)
    ├── HomeTab (Stack)
    │   ├── Dashboard
    │   ├── Notifications
    │   └── NotificationDetail
    ├── ProductsTab (Stack)
    │   ├── ProductCatalog
    │   ├── ProductDetail
    │   ├── ProductFamilyOverview (HL/LAP/BL/AL)
    │   ├── EmiCalculator
    │   ├── EligibilityCheck
    │   └── ProductComparison
    ├── ApplyTab (Stack)
    │   ├── ApplicationList
    │   ├── ApplicationDetail
    │   ├── ApplicationTimeline
    │   ├── WizardContainer
    │   │   └── WizardSteps (per product)
    │   └── DocumentUpload
    ├── AiTab (Stack)
    │   ├── AdvisorHome
    │   ├── Conversation
    │   ├── VoiceStart
    │   └── VoiceSession
    └── MoreTab (Stack)
        ├── MoreMenu
        ├── ProfileHub → Profile screens
        ├── KycHub → KYC screens
        ├── DocumentDashboard → Document screens
        ├── ReferralDashboard → Referral screens
        ├── HelpCenter → Support screens
        └── Settings → Settings screens
```

## 7.2 Navigation Hierarchy (DSA App)

```
RootNavigator (Stack)
├── SplashScreen
├── AuthStack
│   ├── PartnerLogin
│   └── OtpVerification
├── OnboardingGateStack
│   ├── Registration
│   ├── PartnerKyc
│   └── AgreementSign
└── MainTabs (Bottom Tab)
    ├── DashboardTab (Stack)
    │   └── Dashboard
    ├── LeadsTab (Stack)
    │   ├── LeadList
    │   ├── LeadCreate
    │   ├── LeadDetail
    │   └── LeadDocuments
    ├── EarningsTab (Stack)
    │   ├── CommissionDashboard
    │   ├── CommissionLedger
    │   └── PayoutReports
    └── MoreTab (Stack)
        ├── MoreMenu
        ├── Training
        ├── Profile
        ├── Reports
        └── Settings
```

## 7.3 Splash Screen

| Behavior | Detail |
|----------|--------|
| Duration | Minimum 1.5s; max until init complete |
| Brand | KuberOne logo on #071A1F background |
| Animation | Subtle logo fade-in (Lottie optional) |
| Init tasks | Font load, auth check, config fetch |
| Route | Auth stack if no token; Main if valid token |

## 7.4 Onboarding (Customer Only)

| Slide | Message |
|-------|---------|
| 1 | Discover the right loan with AI guidance |
| 2 | Apply in minutes with smart document upload |
| 3 | Track your application in real-time |

| Behavior | Detail |
|----------|--------|
| Skip | Available on slides 2–3 |
| Seen flag | AsyncStorage `onboarding_completed` |
| Language | Final slide → language selection |

## 7.5 Bottom Tab Configuration

| Property | Customer | DSA |
|----------|----------|-----|
| Tabs | 5 (Home, Products, Apply, AI, More) | 4 (Dashboard, Leads, Earnings, More) |
| Active color | #22D3A6 | #22D3A6 |
| Inactive color | #C7D2D9 at 50% opacity | Same |
| Background | #071A1F | #071A1F |
| Border top | 1px #102B2E | Same |
| Badge | Notifications count on Home | New leads on Leads |
| Haptic | Light impact on tab press | Same |

## 7.6 Drawer (Customer More Tab Alternative — Phase 2)

| Item | Route |
|------|-------|
| Profile | ProfileHub |
| KYC | KycHub |
| Documents | DocumentDashboard |
| Referrals | ReferralDashboard |
| Support | HelpCenter |
| Settings | Settings |

*Phase 1: More tab uses stack menu screen instead of drawer.*

## 7.7 Deep Linking

| Scheme | `kuberone://` (customer), `kuberone-partner://` (DSA) |
|--------|------------------------------------------------------|
| Universal links | `https://app.kuberone.kuberfinserve.com/` |

**Customer deep link routes:**

| Path | Screen |
|------|--------|
| `/products` | ProductCatalog |
| `/products/:code` | ProductDetail |
| `/applications/:id` | ApplicationDetail |
| `/applications/:id/timeline` | ApplicationTimeline |
| `/ai/advisor` | AdvisorHome |
| `/referrals` | ReferralDashboard |
| `/notifications/:id` | NotificationDetail |
| `/eligibility` | EligibilityCheck |
| `/emi` | EmiCalculator |

**DSA deep link routes:**

| Path | Screen |
|------|--------|
| `/leads` | LeadList |
| `/leads/:id` | LeadDetail |
| `/leads/create` | LeadCreate |
| `/commissions` | CommissionDashboard |
| `/training/:id` | TrainingDetail |

## 7.8 Navigation Types

```typescript
// navigation.types.ts — pattern (not implementation)
type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Apply: undefined;
  AI: undefined;
  More: undefined;
};
```

## 7.9 Navigation Rules

| Rule | Enforcement |
|------|-------------|
| Type-safe params | All navigators typed with param lists |
| No cross-tab direct nav | Use `navigation.navigate('Tab', { screen: 'X' })` |
| Auth guard | Main tabs only accessible with valid token |
| Wizard back | Prevent back on submit confirmation |
| Deep link auth | Unauthenticated links → login → redirect |
| Modal presentation | Bottom sheets for filters; full screen for wizards |

---

# 8. AUTHENTICATION FLOW

## 8.1 OTP Login Flow (Both Apps)

| Step | UI | API | State |
|------|-----|-----|-------|
| 1 | Enter phone | — | Formik validation |
| 2 | Tap "Send OTP" | POST `/auth/otp/send` | Loading state |
| 3 | Enter 6-digit OTP | — | OtpInput component |
| 4 | Auto-submit on 6 digits | POST `/auth/otp/verify` | Auth slice update |
| 5 | Store tokens | — | Secure storage |
| 6 | Register device | Included in verify payload | FCM token |
| 7 | Navigate to main | GET `/auth/me` | Hydrate user in Redux |

## 8.2 Session Management

| Concern | Implementation |
|---------|----------------|
| Token storage | Access + refresh in `expo-secure-store` |
| User profile | Redux `auth.slice` — hydrated from `/auth/me` |
| Session list | Settings → Security → Active sessions (Phase 2) |
| Session expiry | Backend session expiry; client refresh before expiry |
| Background return | Check token validity on `AppState` active |

## 8.3 Token Refresh

| Trigger | Action |
|---------|--------|
| 401 response | Axios interceptor catches |
| Proactive | Refresh when access token < 2 min to expiry |
| Refresh call | POST `/auth/refresh` with refresh token |
| Success | Store new pair; retry original request |
| Failure | Clear auth; navigate to login |
| Concurrent requests | Queue during refresh; replay after |

## 8.4 Logout

| Type | Flow |
|------|------|
| Manual | Settings → Logout → confirm → POST `/auth/logout` |
| Force (401) | Clear storage; reset Redux; navigate to auth |
| Logout all | POST `/auth/logout-all` (Phase 2) |

| Cleanup on logout |
|-------------------|
| Clear secure storage |
| Reset Redux auth + wizard slices |
| Clear React Query cache |
| Unregister FCM (optional) |
| Analytics: reset user ID |

## 8.5 Device Registration

| Field | Source |
|-------|--------|
| deviceId | Generated UUID; persisted in AsyncStorage |
| platform | `Platform.OS` |
| pushToken | FCM token from `expo-notifications` |
| appVersion | `expo-constants` version |
| osVersion | `Platform.Version` |
| model | `expo-device` modelName |

| Timing | When |
|--------|------|
| On login | Sent with OTP verify |
| On token refresh | Update `lastActiveAt` |
| On FCM token change | PATCH device endpoint |

---

# 9. STATE MANAGEMENT ARCHITECTURE

## 9.1 Dual-State Strategy

| State Category | Tool | Rationale |
|----------------|------|-----------|
| **Server/async data** | React Query | Caching, background refetch, deduplication |
| **Client/global state** | Redux Toolkit | Auth, wizard, offline queue, UI |
| **Form state** | Formik | Field-level state, validation |
| **Ephemeral UI** | useState | Toggle, animation, scroll |

## 9.2 Redux Store Structure (Customer App)

```
store/
├── index.ts                      # configureStore + persist config
├── rootReducer.ts                # combineReducers
├── slices/
│   ├── auth.slice.ts             # user, isAuthenticated, permissions
│   ├── wizard.slice.ts           # application wizard draft (PERSIST)
│   ├── offline.slice.ts          # upload queue, pending actions (PERSIST)
│   ├── ui.slice.ts               # activeModal, bottomSheet, toast
│   ├── notification.slice.ts     # unread count, last fetched
│   ├── preferences.slice.ts      # language, theme (PERSIST)
│   └── ai.slice.ts               # active session ID, voice state
├── selectors/
│   ├── auth.selectors.ts
│   ├── wizard.selectors.ts
│   └── ui.selectors.ts
├── middleware/
│   ├── analytics.middleware.ts   # Track Redux actions (dev)
│   └── offline.middleware.ts     # Queue actions when offline
└── persist/
    └── persistConfig.ts          # Whitelist: wizard, offline, preferences
```

## 9.3 Redux Store Structure (DSA App)

```
store/slices/
├── auth.slice.ts
├── ui.slice.ts
├── preferences.slice.ts
├── lead-draft.slice.ts           # PERSIST — draft lead form
└── notification.slice.ts
```

## 9.4 Auth Slice

| Field | Type | Description |
|-------|------|-------------|
| `user` | User \| null | Current user profile |
| `isAuthenticated` | boolean | Auth status |
| `isLoading` | boolean | Auth check in progress |
| `permissions` | string[] | Flattened permissions |
| `customerId` | string? | Customer scope (customer app) |
| `partnerId` | string? | Partner scope (DSA app) |

| Action | Trigger |
|--------|---------|
| `setAuth` | Successful login/OTP verify |
| `setUser` | `/auth/me` response |
| `clearAuth` | Logout / refresh failure |
| `setLoading` | App init |

## 9.5 Wizard Slice (Customer)

| Field | Type | Description |
|-------|------|-------------|
| `applicationId` | string? | Draft application ID |
| `productCode` | string | HL-01, LAP-01, etc. |
| `currentStep` | number | 0-indexed step |
| `steps` | Record<string, any> | Step data keyed by step ID |
| `completedSteps` | number[] | Validated step indices |
| `lastSavedAt` | string | ISO timestamp |

| Action | Trigger |
|--------|---------|
| `initWizard` | Start new application |
| `setStepData` | Step form save |
| `nextStep` | Validation passed |
| `prevStep` | Back navigation |
| `loadDraft` | Resume from API/local |
| `clearWizard` | Submit success / cancel |

## 9.6 Offline Slice

| Field | Type | Description |
|-------|------|-------------|
| `isOnline` | boolean | Network status |
| `uploadQueue` | UploadItem[] | Pending document uploads |
| `actionQueue` | QueuedAction[] | Pending API mutations |
| `conflicts` | Conflict[] | Sync conflicts |

## 9.7 React Query Configuration

| Setting | Value |
|---------|-------|
| `staleTime` (default) | 30 seconds |
| `gcTime` (cacheTime) | 5 minutes |
| `retry` | 2 (network errors only) |
| `refetchOnWindowFocus` | true (AppState active) |
| `refetchOnReconnect` | true |

**Query key conventions:**

| Pattern | Example |
|---------|---------|
| Entity list | `['applications', { status, page }]` |
| Entity detail | `['application', applicationId]` |
| Dashboard | `['dashboard']` |
| Products | `['products']` |
| User profile | `['profile']` |
| Notifications | `['notifications', { page }]` |

## 9.8 Selectors

| Selector | Returns |
|----------|---------|
| `selectIsAuthenticated` | boolean |
| `selectUser` | User |
| `selectCustomerId` | string |
| `selectWizardProgress` | { current, total, percent } |
| `selectUnreadCount` | number |
| `selectIsOnline` | boolean |
| `selectPendingUploads` | UploadItem[] |

## 9.9 Persistence Strategy

| Slice | Persist | Storage |
|-------|---------|---------|
| `wizard` | ✓ | AsyncStorage |
| `offline` | ✓ | AsyncStorage |
| `preferences` | ✓ | AsyncStorage |
| `lead-draft` (DSA) | ✓ | AsyncStorage |
| `auth` | ✗ | Secure Store (tokens only) |
| `ui` | ✗ | Transient |

## 9.10 Cache Invalidation Matrix

| Event | Invalidated Queries |
|-------|---------------------|
| Application submitted | `['applications']`, `['dashboard']` |
| Document uploaded | `['application', id]`, `['documents']` |
| Profile updated | `['profile']`, `['dashboard']` |
| KYC completed | `['kyc']`, `['profile']` |
| Lead submitted (DSA) | `['leads']`, `['dashboard']` |
| Notification received (FCM) | `['notifications']` |
| Logout | Clear all queries |

---

# 10. API LAYER ARCHITECTURE

## 10.1 Axios Client Setup

| Config | Value |
|--------|-------|
| Base URL | `https://api.kuberone.kuberfinserve.com/api/v1` |
| Timeout | 30 seconds (AI endpoints: 60s) |
| Content-Type | `application/json` |
| Source | `packages/shared-api` |

## 10.2 Request Headers

| Header | Value | When |
|--------|-------|------|
| `Authorization` | `Bearer {accessToken}` | Authenticated requests |
| `Content-Type` | `application/json` | All JSON requests |
| `X-Request-Id` | UUID | Every request |
| `X-App-Version` | App version string | Every request |
| `X-Device-Id` | Device UUID | Every request |
| `X-Platform` | `ios` \| `android` | Every request |
| `Accept-Language` | `en` \| `hi` | Per user preference |
| `Idempotency-Key` | UUID | Financial mutations |

## 10.3 Interceptors

### Request Interceptor

| Step | Action |
|------|--------|
| 1 | Generate `X-Request-Id` if not present |
| 2 | Read access token from secure storage |
| 3 | Attach `Authorization` header |
| 4 | Attach device/app headers |
| 5 | Log request metadata (dev only; no PII) |

### Response Interceptor

| Status | Action |
|--------|--------|
| 2xx | Pass through; optional response transform |
| 401 | Attempt token refresh → retry or logout |
| 403 | Show "Access denied" toast; log RBAC event |
| 422 | Parse business error; show user-friendly message |
| 429 | Show rate limit message; respect `Retry-After` |
| 5xx | Show generic error; log to Crashlytics |

### Refresh Interceptor

| Step | Action |
|------|--------|
| 1 | Detect 401 on non-auth endpoint |
| 2 | Check if refresh already in progress (mutex) |
| 3 | Call POST `/auth/refresh` |
| 4 | On success: store new tokens; retry queue |
| 5 | On failure: clear auth; redirect to login |

## 10.4 Retry Logic

| Condition | Retries | Backoff |
|-----------|---------|---------|
| Network error (no response) | 3 | 1s, 2s, 4s |
| Timeout | 2 | 2s, 4s |
| 502/503/504 | 2 | 1s, 3s |
| 401 | 0 (handled by refresh) | — |
| 4xx (other) | 0 | — |
| AI streaming | 0 (user retry) | — |

## 10.5 Error Handling

| API Error Code | User Message | Action |
|----------------|--------------|--------|
| `VALIDATION_ERROR` | Field-specific errors | Highlight form fields |
| `AUTH_UNAUTHORIZED` | Session expired | Redirect to login |
| `AUTH_TOKEN_EXPIRED` | Refreshing... | Auto-refresh |
| `RBAC_FORBIDDEN` | You don't have access | Toast + go back |
| `RESOURCE_NOT_FOUND` | Not found | Empty state |
| `BUSINESS_RULE_VIOLATION` | Server message | Toast or inline |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Toast; disable button |
| `INTERNAL_ERROR` | Something went wrong | Toast + retry button |
| Network offline | No internet connection | Offline banner |

## 10.6 Timeout Strategy

| Endpoint Class | Timeout |
|----------------|---------|
| Standard CRUD | 15 seconds |
| List/pagination | 20 seconds |
| File presign | 10 seconds |
| Eligibility/EMI | 15 seconds |
| AI chat (stream) | 60 seconds |
| AI voice | 90 seconds |
| Document confirm | 30 seconds |

## 10.7 Feature API Pattern

```
// Pattern (not implementation)
// services/api/application.api.ts
export const applicationApi = {
  list: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  updateStep: (id, step, data) => api.put(`/applications/${id}/step`, data),
  submit: (id) => api.post(`/applications/${id}/submit`),
};
```

---

# 11. OFFLINE STRATEGY

## 11.1 Offline Capabilities Matrix

| Feature | Offline Read | Offline Write | Sync |
|---------|-------------|---------------|------|
| Dashboard (cached) | ✓ | — | On reconnect |
| Product catalog | ✓ | — | Stale-while-revalidate |
| Application list | ✓ (cached) | — | Refetch |
| Application wizard | ✓ (draft) | ✓ | On reconnect |
| Document upload | ✗ | ✓ (queue) | Queue processor |
| EMI calculator | ✓ | ✓ | Local only |
| AI Advisor | ✗ | ✗ | Requires network |
| Lead submit (DSA) | ✗ | ✓ (queue) | On reconnect |
| Profile view | ✓ (cached) | ✗ | — |
| Notifications | ✓ (cached) | — | Refetch |

## 11.2 Offline Storage

| Data | Storage | TTL |
|------|---------|-----|
| Wizard draft | Redux persist | Until submit/cancel |
| Lead draft (DSA) | Redux persist | Until submit |
| Upload queue | Redux persist + FileSystem | Until uploaded |
| Product catalog | React Query cache | 24 hours |
| Profile | React Query cache | 30 minutes |
| Preferences | AsyncStorage | Permanent |

## 11.3 Draft Applications

| Behavior | Detail |
|----------|--------|
| Auto-save | Every step completion → Redux + API (if online) |
| Offline save | Redux persist only; flag `pendingSync: true` |
| Resume | App launch → check wizard slice → prompt resume |
| Multiple drafts | One active draft per product code |
| Expiry | Drafts older than 30 days → prompt discard |
| Sync on reconnect | POST draft to API; merge if server newer |

## 11.4 Document Queue

| Step | Offline | Online |
|------|---------|--------|
| 1. Select file | Store in FileSystem cache | — |
| 2. Request presign | Queue action | Immediate API call |
| 3. Upload to S3 | Queue with file path | Immediate upload |
| 4. Confirm upload | Queue action | Immediate API call |
| 5. Process queue | On reconnect, FIFO | — |

**Queue item structure:**

| Field | Description |
|-------|-------------|
| `id` | Queue item UUID |
| `type` | PRESIGN, UPLOAD, CONFIRM |
| `documentId` | Pre-created document ID |
| `localUri` | File path on device |
| `applicationId` | Parent application |
| `retryCount` | Retry attempts |
| `createdAt` | Queue timestamp |

## 11.5 Retry Sync

| Trigger | Action |
|---------|--------|
| Network restored | `NetInfo` listener → process queues |
| App foreground | Check pending queue |
| Manual retry | Pull-to-refresh on document screen |
| Max retries | 5 per item; then mark failed |
| Failed items | Show in UI with retry button |

## 11.6 Conflict Resolution

| Scenario | Resolution |
|----------|-------------|
| Draft older than server | Prompt: "Newer version on server. Load server version?" |
| Draft newer than server | Push local to server |
| Application status changed server-side | Invalidate cache; show updated status |
| Document already uploaded | Remove from queue; mark complete |
| Lead duplicate (DSA) | Show conflict error; discard draft |

---

# 12. CUSTOMER DASHBOARD ARCHITECTURE

## 12.1 Dashboard Layout

```
┌─────────────────────────────────────────┐
│  Header: Greeting + Notification Bell   │
├─────────────────────────────────────────┤
│  Application Status Card (if active)     │
├─────────────────────────────────────────┤
│  Quick Actions Grid (2×2)               │
│  [Apply] [Check Eligibility]            │
│  [EMI Calc] [AI Advisor]                │
├─────────────────────────────────────────┤
│  AI Insight Card                         │
├─────────────────────────────────────────┤
│  Product Recommendations (horizontal)  │
├─────────────────────────────────────────┤
│  Referral Banner (if eligible)          │
└─────────────────────────────────────────┘
```

## 12.2 Widgets

| Widget | Component | Data Hook |
|--------|-----------|-----------|
| Greeting | `DashboardHeader` | `selectUser` |
| Notification bell | `NotificationBell` | `selectUnreadCount` |
| Application status | `ApplicationStatusCard` | `useActiveApplication()` |
| Quick actions | `QuickActionsGrid` | Static config + dynamic |
| AI insight | `AiInsightCard` | `useAiInsight()` |
| Product recommendations | `ProductCarousel` | `useRecommendedProducts()` |
| Referral banner | `ReferralBanner` | `useReferralSummary()` |

## 12.3 Recommendations

| Source | Priority |
|--------|----------|
| AI Advisor insight | 1 (if available) |
| Eligibility-based | 2 |
| Profile-based | 3 |
| Popular products | 4 (fallback) |

## 12.4 Application Status

| Status | Card Display |
|--------|-------------|
| Draft | "Continue your application" + progress % |
| Submitted | "Application submitted" + stage |
| In progress | Current LOS stage + timeline preview |
| Sanctioned | "Congratulations! Sanctioned" + amount |
| Disbursed | "Loan disbursed" + EMI info |
| Action needed | "Documents required" + CTA |

## 12.5 Quick Actions

| Action | Destination |
|--------|-------------|
| Apply for Loan | ProductCatalog |
| Check Eligibility | EligibilityCheck |
| EMI Calculator | EmiCalculator |
| AI Advisor | AdvisorHome |
| Upload Documents | DocumentDashboard |
| Track Application | ApplicationList |

## 12.6 Dashboard Analytics Events

| Event | Trigger |
|-------|---------|
| `dashboard_viewed` | Screen mount |
| `quick_action_tapped` | Action button press |
| `application_card_tapped` | Status card press |
| `ai_insight_tapped` | AI card press |
| `product_recommendation_tapped` | Product card press |
| `referral_banner_tapped` | Banner press |

---

# 13. PROFILE MODULE ARCHITECTURE

## 13.1 Profile Sections

| Section | Completion Weight | Required For |
|---------|-------------------|--------------|
| Personal Info | 20% | All applications |
| Address | 15% | All applications |
| Employment | 20% | Salaried products |
| Income | 20% | All applications |
| KYC | 25% | Application submit |

## 13.2 Personal Info

| Field | Validation (Yup) | API Field |
|-------|------------------|-----------|
| Full name | Required, 2–100 chars | `fullName` |
| Email | Optional, email format | `email` |
| Date of birth | Required, 21–65 age | `dateOfBirth` |
| Gender | Required, enum | `gender` |
| Marital status | Optional, enum | `maritalStatus` |
| Photo | Optional, image | S3 upload |

## 13.3 Address

| Field | Validation |
|-------|------------|
| Type | PRIMARY, CORRESPONDENCE, OFFICE |
| Line 1 | Required, max 200 |
| Line 2 | Optional |
| City | Required |
| State | Required, Indian state enum |
| Pincode | Required, 6-digit |

| UX | Multiple addresses supported; primary required |

## 13.4 Employment

| Field | Salaried | Self-Employed |
|-------|----------|---------------|
| Employment type | SALARIED | SELF_EMPLOYED, BUSINESS |
| Company name | Required | Business name |
| Designation | Required | — |
| Experience (years) | Required | Business vintage |
| Industry | Optional | Required |

## 13.5 Income

| Field | Validation |
|-------|------------|
| Income type | SALARY, BUSINESS, RENTAL, OTHER |
| Monthly amount | Required, min ₹5,000 |
| Annual amount | Auto-calculated or direct |
| Frequency | MONTHLY, ANNUAL |

## 13.6 Preferences

| Preference | Options |
|------------|---------|
| Language | English (Hindi Phase 2) |
| Communication channel | Push, SMS, WhatsApp, Email |
| Product interests | HL, LAP, BL, AL multi-select |
| Marketing opt-in | Boolean (DPDP consent) |

## 13.7 Document Vault (Profile Scope)

| Access | From ProfileHub → "My Documents" |
|--------|----------------------------------|
| Shows | All customer documents across applications |
| Actions | View, download, re-upload |
| Categories | KYC, Income, Property, Other |

---

# 14. KYC MODULE ARCHITECTURE

## 14.1 KYC Flow

```
KycHub → PAN → Aadhaar → Photo → Address Proof → KycStatus
```

## 14.2 PAN Verification

| Step | UI | API |
|------|-----|-----|
| 1 | Enter PAN number | — |
| 2 | Validate format (Yup) | — |
| 3 | Submit | POST `/customer/kyc/pan` |
| 4 | Show result | Name match, status |
| 5 | Update KYC hub | Invalidate `['kyc']` |

## 14.3 Aadhaar Verification

| Step | UI | API |
|------|-----|-----|
| 1 | Enter Aadhaar (masked input) | — |
| 2 | Request OTP | POST `/customer/kyc/aadhaar/send-otp` |
| 3 | Enter Aadhaar OTP | POST `/customer/kyc/aadhaar/verify` |
| 4 | Show verified | Update status |

## 14.4 Photo Capture

| Requirement | Implementation |
|-------------|----------------|
| Source | Front camera preferred |
| Format | JPEG |
| Max size | 2MB (client compress) |
| Guidelines | Face centered, plain background overlay |
| Upload | Presign → S3 → confirm |

## 14.5 Address Proof

| Accepted Documents |
|--------------------|
| Aadhaar (if not used in Aadhaar step) |
| Utility bill (< 3 months) |
| Bank statement |
| Rent agreement |

## 14.6 Verification Status

| Status | UI Treatment |
|--------|-------------|
| `NOT_STARTED` | Gray badge; CTA to start |
| `IN_PROGRESS` | Amber badge; show pending steps |
| `VERIFIED` | Green badge (#18C964) |
| `REJECTED` | Red badge; reason + re-submit CTA |
| `EXPIRED` | Amber badge; re-verify CTA |

---

# 15. LOAN PRODUCT ARCHITECTURE

## 15.1 Product Family Structure

| Family | Code Prefix | Variants | Icon Color |
|--------|-------------|----------|------------|
| Home Loan | HL- | 4 | #22D3A6 |
| LAP | LAP- | 4 | #18C964 |
| Business Loan | BL- | 5 | #3B82F6 |
| Auto Loan | AL- | 7 | #8B5CF6 |

## 15.2 Product Catalog UX

| Level | Screen | Content |
|-------|--------|---------|
| L1 | ProductCatalogScreen | 4 family cards |
| L2 | ProductFamilyOverview | Variants list |
| L3 | ProductVariantDetail | Variant details + CTA |
| L4 | EligibilityCheck / Wizard | Action |

## 15.3 Product Card Data

| Field | Source |
|-------|--------|
| Name | `products.name` |
| Description | `products.shortDescription` |
| Interest rate range | `products.rateRange` |
| Max amount | `products.maxAmount` |
| Max tenure | `products.maxTenure` |
| Badge | "Popular", "New", "Recommended" |
| Priority | P1/P2/P3 launch flag |

## 15.4 Cross-Product Features

| Feature | Available On |
|---------|-------------|
| Eligibility check | All products |
| EMI calculator | All products |
| AI recommendation | All products |
| Application wizard | All products |
| Document checklist | Per product + variant |
| Lender matching | All products |

## 15.5 Future Products (Architecture Slots)

| Product | Feature Path | Navigation |
|---------|-------------|------------|
| Personal Loan | `features/personal-loan/` | Products tab → new card |
| Gold Loan | `features/gold-loan/` | Products tab → new card |
| Insurance | `features/insurance/` | Products tab → new section |
| Credit Cards | `features/cards/` | Products tab → new card |

---

# 16. HOME LOAN MODULE

## 16.1 Variants

| Code | Name | Priority |
|------|------|----------|
| HL-01 | Fresh Home Loan | P1 |
| HL-02 | Balance Transfer | P1 |
| HL-03 | Top-Up | P1 |
| HL-04 | BT + Top-Up | P2 |

## 16.2 Wizard Steps (HL-01 Fresh)

| Step | Screen | Fields |
|------|--------|--------|
| 1 | Loan Requirements | Amount, tenure, purpose |
| 2 | Property Details | Type, value, location, stage |
| 3 | Personal Details | Pre-filled from profile; confirm |
| 4 | Employment & Income | Pre-filled; confirm/update |
| 5 | Co-applicant (optional) | Name, relationship, income |
| 6 | Document Checklist | Required docs preview |
| 7 | Review & Submit | Summary; consent; submit |

## 16.3 Balance Transfer (HL-02) Additional Steps

| Step | Fields |
|------|--------|
| Existing loan | Lender, outstanding, EMI, tenure remaining |
| BT amount | Requested BT amount |
| Top-up (optional) | Additional amount |

## 16.4 Top-Up (HL-03) Additional Steps

| Step | Fields |
|------|--------|
| Existing loan | KuberOne or external loan details |
| Top-up amount | Requested amount |
| Purpose | Usage of funds |

## 16.5 Eligibility Integration

| Point | Action |
|-------|--------|
| Pre-wizard | Optional eligibility check from product detail |
| Step 1 | Inline eligibility preview |
| Pre-submit | Mandatory eligibility re-check |
| Block | Cannot submit if ineligible (with explanation) |

## 16.6 Document Checklist (HL)

| Document | Required |
|----------|----------|
| PAN | Yes |
| Aadhaar | Yes |
| Salary slips (3 months) | Salaried |
| ITR (2 years) | Self-employed |
| Bank statement (6 months) | Yes |
| Property documents | Sale agreement / allotment |
| Photo | Yes |

## 16.7 Tracking

| Screen | Data |
|--------|------|
| ApplicationDetail | Status, amount, product, dates |
| ApplicationTimeline | S01–S09 stages with dates |
| Document status | Checklist completion % |
| Communication | Notification history |

---

# 17. LAP MODULE

## 17.1 Variants

| Code | Name | Priority |
|------|------|----------|
| LAP-01 | Fresh LAP | P1 |
| LAP-02 | Balance Transfer | P1 |
| LAP-03 | Top-Up | P2 |
| LAP-04 | BT + Top-Up | P2 |

## 17.2 Wizard Steps (LAP-01 Fresh)

| Step | Fields |
|------|--------|
| 1 — Loan Requirements | Amount, tenure, purpose (business/personal) |
| 2 — Property Details | Type, value, occupancy, age, location |
| 3 — Personal/Business Details | Profile confirm |
| 4 — Income Details | Income source, amount |
| 5 — Existing Loans | Current EMIs, outstanding |
| 6 — Document Checklist | Preview |
| 7 — Review & Submit | Summary |

## 17.3 LAP-Specific Fields

| Field | Options |
|-------|---------|
| Property type | Residential, commercial, industrial |
| Occupancy | Self-occupied, rented, vacant |
| Property age | Years since construction |
| Property value | Estimated market value |
| LTV | Auto-calculated; max 60% display |

## 17.4 BT / Top-Up / BT+Top-Up

| Variant | Additional Steps |
|---------|------------------|
| LAP-02 BT | Existing lender, outstanding, BT amount |
| LAP-03 Top-Up | Existing loan details, top-up amount |
| LAP-04 BT+Top-Up | Combined BT and top-up fields |

---

# 18. BUSINESS LOAN MODULE

## 18.1 Variants

| Code | Name | Priority |
|------|------|----------|
| BL-01 | Business Loan | P1 |
| BL-02 | MSME Loan | P1 |
| BL-03 | Working Capital | P1 |
| BL-04 | OD Assistance | P2 |
| BL-05 | CC Assistance | P2 |

## 18.2 Wizard Steps (BL-01)

| Step | Fields |
|------|--------|
| 1 — Loan Requirements | Amount, tenure, purpose |
| 2 — Business Details | Name, type, vintage, industry, GST |
| 3 — Financial Details | Turnover, profit, existing debt |
| 4 — Promoter Details | Profile confirm |
| 5 — Collateral (if applicable) | Asset details |
| 6 — Document Checklist | Preview |
| 7 — Review & Submit | Summary |

## 18.3 Business-Specific Fields

| Field | Validation |
|-------|------------|
| Business type | Proprietorship, partnership, Pvt Ltd, LLP |
| GST number | Optional; format validated if provided |
| Annual turnover | Min per product rule |
| Business vintage | Min 3 years (BL-01) |
| Loan purpose | Expansion, machinery, inventory, WC |

## 18.4 MSME / Working Capital / OD / CC

| Variant | Differentiator |
|---------|----------------|
| BL-02 MSME | MSME registration; subsidized rate display |
| BL-03 WC | Shorter tenure; revolving purpose |
| BL-04 OD | Overdraft limit; current account link |
| BL-05 CC | Cash credit limit; stock hypothecation |

---

# 19. AUTO LOAN MODULE

## 19.1 Variants

| Code | Name | Priority |
|------|------|----------|
| AL-01 | New Car | P1 |
| AL-02 | Used Car | P1 |
| AL-03 | Commercial Vehicle | P2 |
| AL-04 | EV Loan | P2 |
| AL-05 | Balance Transfer | P3 |
| AL-06 | Top-Up | P3 |
| AL-07 | Refinance | P3 |

## 19.2 Wizard Steps (AL-01 New Car)

| Step | Fields |
|------|--------|
| 1 — Vehicle Selection | Make, model, variant, dealer |
| 2 — Loan Requirements | On-road price, down payment, amount, tenure |
| 3 — Personal Details | Profile confirm |
| 4 — Income Details | Income, existing EMIs |
| 5 — Document Checklist | Preview |
| 6 — Review & Submit | Summary |

## 19.3 Auto-Specific Fields

| Field | New Car | Used Car |
|-------|---------|----------|
| Vehicle year | Current year | Max 5 years old |
| On-road price | From dealer quotation | Valuation |
| LTV | Up to 90% | Up to 80% |
| Insurance | Included in checklist | Required |
| RC book | — | Required |

## 19.4 Commercial / EV / BT / Top-Up / Refinance

| Variant | Key Fields |
|---------|------------|
| AL-03 Commercial | Vehicle type, load capacity, commercial license |
| AL-04 EV | Battery warranty, charging infra, green subsidy |
| AL-05 BT | Existing auto loan details |
| AL-06 Top-Up | Additional amount over existing |
| AL-07 Refinance | Restructure terms |

---

# 20. APPLICATION TRACKING MODULE

## 20.1 Application List

| Filter | Options |
|--------|---------|
| Status | All, Active, Completed, Withdrawn |
| Product | HL, LAP, BL, AL |
| Sort | Newest, Oldest, Amount |

| Card Display |
|-------------|
| Product name + variant |
| Application code |
| Status badge (color-coded) |
| Amount + tenure |
| Last updated date |
| Progress indicator |

## 20.2 Application Detail

| Section | Content |
|---------|---------|
| Header | Product, code, status, amount |
| Stage indicator | Current LOS stage (S01–S09) |
| Key dates | Created, submitted, sanctioned, disbursed |
| Actions | Upload docs, contact support, withdraw |
| Linked documents | Document checklist summary |
| Timeline preview | Last 3 events |

## 20.3 Timeline

| Event Type | Icon | Example |
|------------|------|---------|
| STAGE_CHANGE | Arrow | "Moved to Documentation" |
| DOCUMENT | File | "Bank statement uploaded" |
| COMMUNICATION | Message | "SMS sent: Documents required" |
| SYSTEM | Gear | "Application auto-assigned" |
| NOTE | Note | "Credit review initiated" |

| Component | `Timeline` — vertical with timestamps |

## 20.4 Status History

| Status | Badge Color |
|--------|-------------|
| DRAFT | #C7D2D9 (neutral) |
| SUBMITTED | #3B82F6 (blue) |
| IN_PROGRESS | #F59E0B (amber) |
| SANCTIONED | #18C964 (green) |
| DISBURSED | #22D3A6 (primary) |
| REJECTED | #EF4444 (red) |
| WITHDRAWN | #C7D2D9 (neutral) |

## 20.5 Communication History

| Channel | Display |
|---------|---------|
| Push | In-app notification entries |
| SMS | SMS history screen |
| Email | Email history screen |
| WhatsApp | WhatsApp history screen |

---

# 21. DOCUMENT MANAGEMENT MODULE

## 21.1 Upload Flow

| Step | UI | Technical |
|------|-----|-----------|
| 1 | Select document type | From checklist |
| 2 | Choose source | Camera or gallery (`expo-image-picker`) |
| 3 | Preview | Image preview; PDF icon |
| 4 | Compress | Client-side if > 2MB |
| 5 | Upload | Presign → S3 PUT → confirm |
| 6 | Progress | Progress bar with percentage |
| 7 | Complete | Status update; checklist refresh |

## 21.2 Preview

| Format | Viewer |
|--------|--------|
| Image | Pinch-to-zoom image viewer |
| PDF | `react-native-pdf` or WebView |
| Unsupported | Download + open externally |

## 21.3 OCR (Client Display)

| State | UI |
|-------|-----|
| Processing | "Extracting information..." spinner |
| Auto-verified | Green check + extracted fields |
| Manual review | "Under review" amber badge |
| Failed | "Could not verify" + re-upload CTA |

## 21.4 Verification Status

| Status | Color | Action |
|--------|-------|--------|
| PENDING | Amber | Wait |
| AUTO_VERIFIED | #18C964 | None |
| MANUALLY_VERIFIED | #18C964 | None |
| REJECTED | Red | Re-upload |
| EXPIRED | Amber | Re-upload |

## 21.5 Deficiency

| UI | Content |
|----|---------|
| DeficiencyScreen | List of missing/rejected docs |
| Per item | Document name, reason, CTA to upload |
| Banner | On ApplicationDetail when deficiencies exist |
| Push | Notification on new deficiency |

## 21.6 History & Vault

| Feature | Description |
|---------|-------------|
| Version history | View previous uploads of same type |
| Vault | All documents across applications |
| Download | Presigned GET URL → save to device |
| Share | Share document (Phase 2) |

---

# 22. EMI & ELIGIBILITY MODULE

## 22.1 EMI Calculator

| Input | Component | Validation |
|-------|-----------|------------|
| Loan amount | `CurrencyInput` | ₹1L–₹5Cr |
| Interest rate | `Input` (decimal) | 1%–30% |
| Tenure | Slider or picker | 12–360 months |
| Product (optional) | Dropdown | Pre-fill rate range |

| Output | Display |
|--------|---------|
| Monthly EMI | Large primary text (#22D3A6) |
| Total interest | Secondary text |
| Total payment | Secondary text |
| Amortization table | Expandable `AmortizationTable` |
| Chart | Pie chart: principal vs interest |

| API | POST `/emi/calculate` (or client-side with API validation) |

## 22.2 Eligibility Calculator

| Input | Fields |
|-------|--------|
| Product | Product code selection |
| Income | Monthly/annual |
| Employment | Type |
| Age | From profile or input |
| Loan amount | Requested |
| Location | Pincode |
| Existing EMIs | Optional |

| Output | Display |
|--------|---------|
| Eligible | Green card + matched lenders |
| Ineligible | Red card + reasons + alternatives |
| Score | 0–100 gauge |
| Lender matches | Horizontal lender cards |
| Estimated EMI | Per lender |

## 22.3 Savings Calculator

| Scenario | Inputs |
|----------|--------|
| Balance transfer | Current EMI, new rate, remaining tenure |
| Prepayment | Lump sum, timing |
| Tenure reduction | Target tenure |

## 22.4 Loan Comparison

| Input | 2–4 scenarios |
|-------|---------------|
| Per scenario | Amount, rate, tenure, lender name |
| Output | Side-by-side table |
| Highlight | Lowest total cost in #22D3A6 |

---

# 23. AI ADVISOR MODULE

## 23.1 Chat Interface

| Component | Role |
|-----------|------|
| `ChatBubble` | User (right, #102B2E) / AI (left, #102B2E border #22D3A6) |
| `TypingIndicator` | Three-dot animation during response |
| `SuggestionChips` | Quick question chips below input |
| `InputBar` | Text input + send button |
| `StreamingText` | Token-by-token display |

| Layout |
|--------|
| FlatList inverted or standard with auto-scroll |
| KeyboardAvoidingView |
| Safe area bottom padding |

## 23.2 Recommendation Engine (UI)

| Type | Card |
|------|------|
| Product suggestion | `RecommendationCard` with product info + CTA |
| Eligibility | Summary card + "Check now" link |
| Document | Checklist card |
| Next step | Action card with deep link |

## 23.3 Eligibility Guidance

| Flow | Description |
|------|-------------|
| User asks | "Am I eligible for home loan?" |
| AI collects | Missing params via conversation |
| AI calls | Eligibility API (via backend) |
| AI explains | Result in simple language |
| CTA | "Start Application" button |

## 23.4 Document Guidance

| Capability | Example |
|------------|---------|
| List required docs | "For home loan you need..." |
| Explain rejections | "Your bank statement was rejected because..." |
| Guide upload | "Tap Upload Documents to submit" |

## 23.5 Conversation History

| Feature | Implementation |
|---------|----------------|
| Session list | Past sessions with date + preview |
| Resume session | Load messages from API |
| New session | Clear context; fresh start |
| Delete session | Swipe to delete (with confirm) |

## 23.6 AI API Integration

| Endpoint | Purpose |
|----------|---------|
| POST `/ai/advisor/sessions` | Create session |
| POST `/ai/advisor/sessions/{id}/messages` | Send message (SSE stream) |
| GET `/ai/advisor/sessions` | List sessions |
| GET `/ai/advisor/sessions/{id}` | Session detail |
| POST `/ai/advisor/feedback` | Rate response |

---

# 24. AI VOICE MODULE

## 24.1 Voice Session

| Step | Action |
|------|--------|
| 1 | Request microphone permission |
| 2 | Initialize voice session via API |
| 3 | Stream audio to backend (or native STT) |
| 4 | Receive audio/text response |
| 5 | Display transcript in real-time |
| 6 | End session → summary |

## 24.2 Speech Recognition

| Approach | Phase |
|----------|-------|
| Backend STT | Phase 1 — audio stream to API |
| Native STT | Phase 2 — on-device via `expo-speech` |
| Language | English (Hindi Phase 2) |

## 24.3 Voice Response

| Method | Detail |
|--------|--------|
| TTS playback | Stream audio response |
| Text fallback | Show transcript if audio fails |
| Interruption | User can interrupt AI response |

## 24.4 Callback Request

| Field | Type |
|-------|------|
| Preferred date | Date picker |
| Preferred time slot | Morning/Afternoon/Evening |
| Phone number | Pre-filled from profile |
| Topic | Free text or selection |
| Related application | Optional link |

| API | POST `/ai/voice/callback` |

## 24.5 Appointment Booking

| Field | Type |
|-------|------|
| Advisor type | Phone/Video/In-person |
| Date/time | Calendar picker |
| Branch | If in-person |
| Notes | Optional |

---

# 25. REFERRAL MODULE

## 25.1 Referral Dashboard

| Element | Content |
|---------|---------|
| Referral code | Large display + copy button |
| Share button | Native share sheet |
| Stats | Total referrals, converted, earned |
| How it works | 3-step explainer |
| Terms | Link to referral terms |

## 25.2 Referral Tracking

| Column | Data |
|--------|------|
| Name | Masked referee name |
| Date | Referral date |
| Status | PENDING, CONVERTED, EXPIRED |
| Reward | Amount if converted |

## 25.3 Rewards

| Section | Content |
|---------|---------|
| Earned | Total earned amount |
| Pending | Awaiting disbursement trigger |
| Credited | Paid rewards |
| Next milestone | Progress to next reward tier |

## 25.4 Share Mechanism

| Channel | Content |
|---------|---------|
| WhatsApp | Pre-formatted message + link |
| SMS | Short message + link |
| Copy link | `https://app.kuberone.kuberfinserve.com/ref/{code}` |
| Social | Native share sheet |

## 25.5 Leaderboard

| Display | Data |
|---------|------|
| Rank | Position |
| Name | Masked |
| Conversions | Count |
| Self highlight | Current user row in #22D3A6 |

---

# 26. SUPPORT MODULE

## 26.1 Ticket Management

| Screen | Features |
|--------|----------|
| TicketList | Open/closed tabs; status badges |
| CreateTicket | Category, subject, description, attachment |
| TicketDetail | Message thread; status; reply |

| Category | Options |
|----------|---------|
| Application | Status, docs, withdrawal |
| Technical | App bug, login, upload |
| Account | Profile, KYC |
| General | Product inquiry |
| Complaint | Service issue |

## 26.2 FAQ

| UI | `FaqAccordion` — expandable sections |
|----|-------------------------------------|
| Categories | General, Application, KYC, EMI, Referral |
| Search | Filter FAQ by keyword |
| Source | GET `/knowledge/faqs` |

## 26.3 Knowledge Base

| UI | Article list + detail view |
|----|---------------------------|
| Categories | Products, Process, Policies |
| Search | Full-text search |
| Source | GET `/knowledge/articles` |

## 26.4 Live Chat (Phase 2)

| Feature | Detail |
|---------|--------|
| In-app chat | WebSocket or polling |
| AI handoff | Escalate from AI Advisor |
| Agent assignment | Backend routing |
| History | Persisted in ticket |

---

# 27. NOTIFICATION MODULE

## 27.1 Push Notifications (FCM)

| Setup | Detail |
|-------|--------|
| Library | `expo-notifications` + `firebase` |
| Permission | Request on first login |
| Token | Register with backend on login |
| Handler | Foreground: in-app banner; Background: system tray |
| Tap | Deep link to relevant screen |

## 27.2 In-App Notifications

| Feature | Detail |
|---------|--------|
| List | Paginated notification feed |
| Read/unread | Mark on view; bulk mark read |
| Badge | Unread count on tab + bell icon |
| Types | Application, document, sanction, general |

## 27.3 Channel History Screens

| Screen | Content |
|--------|---------|
| SmsHistoryScreen | SMS notifications sent |
| EmailHistoryScreen | Email notifications sent |
| WhatsAppHistoryScreen | WhatsApp messages sent |

*Read-only history; not interactive messaging.*

## 27.4 Notification Preferences

| Channel | Toggle |
|---------|--------|
| Push | On/off per category |
| SMS | On/off |
| Email | On/off |
| WhatsApp | On/off |
| Marketing | Opt-in required (DPDP) |
| Quiet hours | 10 PM – 8 AM |

## 27.5 Notification Routing

| Event Type | Deep Link |
|------------|-----------|
| Application update | `/applications/{id}` |
| Document deficiency | `/applications/{id}/documents` |
| Sanction | `/applications/{id}` |
| Referral converted | `/referrals` |
| Support reply | `/support/tickets/{id}` |
| AI insight | `/ai/advisor` |

---

# 28. SEARCH ARCHITECTURE

## 28.1 Global Search (Customer — Phase 2)

| Scope | Searchable Entities |
|-------|---------------------|
| Applications | By code, product, status |
| Documents | By type, name |
| Products | By name, family |
| FAQ/KB | By keyword |
| Transactions | By date, type (Phase 3) |

| UI | Search bar in header; results grouped by type |

## 28.2 Application Search

| Filter | Options |
|--------|---------|
| Text | Application code, product name |
| Status | Multi-select |
| Product | HL, LAP, BL, AL |
| Date range | From–to |

| Implementation | Client-side filter on cached list (Phase 1); server search (Phase 2) |

## 28.3 Document Search

| Filter | Options |
|--------|---------|
| Type | PAN, Aadhaar, salary slip, etc. |
| Status | Verified, pending, rejected |
| Application | Link to specific application |

## 28.4 Lead Search (DSA)

| Filter | Options |
|--------|---------|
| Text | Customer name, phone, lead code |
| Status | NEW, CONTACTED, QUALIFIED, CONVERTED, etc. |
| Product | Product family |
| Date range | Created date |

| Performance | Server-side paginated search; debounce 300ms |

---

# 29. UI COMPONENT SYSTEM

## 29.1 Component Hierarchy

```
Primitives (ui/) → Composites (forms/, data-display/) → Feature components (features/*/components/)
```

## 29.2 Buttons

| Variant | Background | Text | Border | Use |
|---------|------------|------|--------|-----|
| **Primary** | #22D3A6 | #071A1F | — | Main CTAs |
| **Secondary** | transparent | #22D3A6 | 1px #22D3A6 | Secondary actions |
| **Ghost** | transparent | #FFFFFF | — | Tertiary, nav |
| **Danger** | #EF4444 | #FFFFFF | — | Destructive |
| **Disabled** | #102B2E | #C7D2D9 at 50% | — | Inactive |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| Large | 52px | 24px horizontal | 16px semibold |
| Medium | 44px | 20px horizontal | 14px semibold |
| Small | 36px | 16px horizontal | 12px semibold |

| States | default, pressed (opacity 0.85), loading (spinner), disabled |
|--------|--------------------------------------------------------------|
| Haptic | Light impact on press (optional) |
| Animation | Scale 0.97 on press (Reanimated) |

## 29.3 Cards

| Variant | Background | Border | Shadow |
|---------|------------|--------|--------|
| **Default** | #102B2E | 1px rgba(255,255,255,0.06) | Subtle |
| **Elevated** | #102B2E | — | Medium glow |
| **Interactive** | #102B2E | 1px #22D3A6 on focus | Press scale |
| **Status** | Left border 4px (color by status) | — | — |

| Component | Usage |
|-----------|-------|
| `Card` | Base container |
| `ApplicationCard` | Application list item |
| `ProductCard` | Product catalog item |
| `StatusCard` | Dashboard status |
| `KpiCard` | DSA earnings/performance |

## 29.4 Forms

| Component | Integration |
|-----------|-------------|
| `FormField` | Label + Input + error message wrapper |
| `PhoneInput` | +91 prefix; 10-digit; auto-format |
| `OtpInput` | 6 boxes; auto-advance; auto-submit |
| `CurrencyInput` | ₹ prefix; Indian numbering format |
| `DatePicker` | Native date picker modal |
| `Select` | Bottom sheet picker |
| `Checkbox` | Custom styled; Formik field |
| `RadioGroup` | Horizontal/vertical options |

| Error display | Red (#EF4444) text below field; field border red |
|---------------|--------------------------------------------------|
| Required indicator | Asterisk on label |
| Help text | #C7D2D9 secondary below field |

## 29.5 Inputs

| State | Border | Background |
|-------|--------|------------|
| Default | 1px rgba(255,255,255,0.1) | #102B2E |
| Focus | 1px #22D3A6 | #102B2E |
| Error | 1px #EF4444 | #102B2E |
| Disabled | 1px rgba(255,255,255,0.05) | #0A2226 |

| Properties | borderRadius 12px; padding 14px 16px; font Inter 16px |
|------------|------------------------------------------------------|

## 29.6 Modals & Bottom Sheets

| Type | Use |
|------|-----|
| `Modal` | Confirmations, alerts |
| `BottomSheet` | Filters, selectors, share |
| `ActionSheet` | iOS-style action menu |
| `FullScreenModal` | Wizard steps, camera |

| Library | `@gorhom/bottom-sheet` |
|---------|------------------------|
| Backdrop | rgba(0,0,0,0.6) |
| Animation | Spring open; smooth close |

## 29.7 Tables

| Component | Usage |
|-----------|-------|
| `DataRow` | Key-value display |
| `AmortizationTable` | EMI schedule |
| `ComparisonTable` | Loan comparison |

*Mobile uses row-based layouts, not HTML tables.*

## 29.8 Charts

| Chart | Library | Usage |
|-------|---------|-------|
| Pie | `react-native-chart-kit` or `victory-native` | EMI breakdown |
| Bar | Same | Comparison, performance |
| Line | Same | Trends (Phase 2) |
| Progress | Custom | Profile completion, wizard |

| Colors | Primary #22D3A6; secondary #18C964; neutral #C7D2D9 |
|--------|-----------------------------------------------------|

## 29.9 Timeline

| Element | Style |
|---------|-------|
| Vertical line | 2px #102B2E |
| Active dot | 12px #22D3A6 filled |
| Completed dot | 12px #18C964 filled |
| Pending dot | 12px #102B2E border #C7D2D9 |
| Event card | #102B2E background |
| Timestamp | #C7D2D9 12px |

## 29.10 Lists

| Pattern | Component |
|---------|-----------|
| Flat list | `FlatList` with `ListItem` |
| Section list | `SectionList` for grouped data |
| Pull to refresh | `RefreshControl` tint #22D3A6 |
| Infinite scroll | `onEndReached` + pagination |
| Empty state | `EmptyState` illustration + CTA |
| Skeleton | `Skeleton` shimmer on #102B2E |

## 29.11 Badges

| Variant | Background | Text |
|---------|------------|------|
| Success | #18C964 at 20% | #18C964 |
| Warning | #F59E0B at 20% | #F59E0B |
| Error | #EF4444 at 20% | #EF4444 |
| Info | #3B82F6 at 20% | #3B82F6 |
| Neutral | #C7D2D9 at 20% | #C7D2D9 |
| Primary | #22D3A6 at 20% | #22D3A6 |

| Size | sm (20px height), md (24px), lg (28px) |
|------|----------------------------------------|

---

# 30. DESIGN SYSTEM ARCHITECTURE

## 30.1 Brand Identity

| Attribute | Value |
|-----------|-------|
| **Brand** | KuberOne |
| **Language** | Premium Fintech |
| **Style** | Dark Luxury |
| **Mood** | Trustworthy, sophisticated, modern |
| **Audience** | Urban Indian borrowers and business partners |

## 30.2 Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | #22D3A6 | CTAs, active states, links, brand accent |
| `primaryDark` | #18C964 | Success, verified, accent green |
| `background` | #071A1F | App background, screen base |
| `surface` | #102B2E | Cards, inputs, elevated surfaces |
| `surfaceElevated` | #0A2226 | Disabled inputs, secondary surfaces |
| `textPrimary` | #FFFFFF | Headings, primary content |
| `textSecondary` | #C7D2D9 | Descriptions, labels, secondary |
| `textDisabled` | rgba(199,210,217,0.5) | Disabled text |
| `border` | rgba(255,255,255,0.06) | Card borders, dividers |
| `borderFocus` | #22D3A6 | Focused input border |
| `error` | #EF4444 | Errors, rejected, destructive |
| `warning` | #F59E0B | Pending, SLA warning |
| `info` | #3B82F6 | Informational |
| `success` | #18C964 | Verified, approved, completed |

**Product family accent colors:**

| Product | Accent |
|---------|--------|
| Home Loan | #22D3A6 |
| LAP | #18C964 |
| Business Loan | #3B82F6 |
| Auto Loan | #8B5CF6 |

## 30.3 Typography

| Token | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| `h1` | Inter | 28px | 700 (Bold) | 36px |
| `h2` | Inter | 24px | 600 (SemiBold) | 32px |
| `h3` | Inter | 20px | 600 | 28px |
| `h4` | Inter | 18px | 600 | 24px |
| `body1` | Inter | 16px | 400 (Regular) | 24px |
| `body2` | Inter | 14px | 400 | 20px |
| `caption` | Inter | 12px | 400 | 16px |
| `overline` | Inter | 10px | 600 | 14px |
| `button` | Inter | 14px | 600 | — |
| `buttonLarge` | Inter | 16px | 600 | — |
| `amount` | Inter | 32px | 700 | 40px |
| `amountSmall` | Inter | 20px | 600 | 28px |

| Loading | `expo-font` — Inter Regular, Medium, SemiBold, Bold |
|---------|-----------------------------------------------------|

## 30.4 Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Icon gaps, inline spacing |
| `md` | 12px | Form field gaps |
| `base` | 16px | Standard padding |
| `lg` | 20px | Section gaps |
| `xl` | 24px | Card padding |
| `2xl` | 32px | Section margins |
| `3xl` | 40px | Large gaps |
| `4xl` | 48px | Screen top padding |

## 30.5 Grid & Layout

| Property | Value |
|----------|-------|
| Screen horizontal padding | 16px |
| Card internal padding | 16px–20px |
| Grid columns | 2 (phone), 3 (tablet Phase 3) |
| Gutter | 12px |
| Max content width | 100% (phone); 600px (tablet) |
| Safe area | Respect via SafeAreaProvider |
| Tab bar height | 56px + safe area bottom |

## 30.6 Icons

| Library | `@expo/vector-icons` (Ionicons primary) + custom SVG |
|---------|------------------------------------------------------|
| Size sm | 16px |
| Size md | 20px |
| Size lg | 24px |
| Size xl | 32px |
| Color | Inherit from parent or token |
| Tab icons | Filled (active), outline (inactive) |
| Product icons | Custom SVG per family |

## 30.7 Shadows & Elevation

| Level | Shadow (iOS) | Elevation (Android) |
|-------|----------------|---------------------|
| 0 | none | 0 |
| 1 | 0 1px 3px rgba(0,0,0,0.3) | 2 |
| 2 | 0 4px 12px rgba(0,0,0,0.4) | 4 |
| 3 | 0 8px 24px rgba(0,0,0,0.5) | 8 |
| glow | 0 0 20px rgba(34,211,166,0.15) | — |

*Dark theme uses subtle glow effects over traditional shadows.*

## 30.8 Animations

| Animation | Duration | Easing | Library |
|-----------|----------|--------|---------|
| Screen transition | 300ms | ease-in-out | React Navigation |
| Button press | 150ms | spring | Reanimated |
| Card appear | 250ms | fade + slide up | Reanimated |
| Tab switch | 200ms | ease | React Navigation |
| Bottom sheet | 350ms | spring | @gorhom/bottom-sheet |
| Skeleton shimmer | 1500ms | linear loop | Reanimated |
| Success check | 600ms | spring | Lottie |
| Loading spinner | continuous | linear | Lottie or ActivityIndicator |
| Toast enter/exit | 250ms | spring | Reanimated |
| OTP box fill | 100ms | ease | Animated |
| Progress bar | 500ms | ease-out | Reanimated |

| Principle | Subtle, purposeful, never distracting |
|-----------|---------------------------------------|

## 30.9 Dark Theme

| Property | Value |
|----------|-------|
| Default theme | Dark Luxury (only theme Phase 1) |
| Light theme | Phase 3 (optional) |
| StatusBar | `light-content` |
| NavigationBar (Android) | #071A1F |
| Keyboard appearance | `dark` |

## 30.10 Theme File Structure

```
theme/
├── index.ts                  # ThemeProvider + useTheme hook
├── colors.ts                 # Color tokens
├── typography.ts             # Type scale
├── spacing.ts                # Spacing scale
├── shadows.ts                # Shadow tokens
├── borderRadius.ts           # 8, 12, 16, 24, full
├── animations.ts             # Duration + easing constants
└── components.ts             # Component default styles
```

---

# 31. PERFORMANCE STRATEGY

## 31.1 Lazy Loading

| Target | Strategy |
|--------|----------|
| Screens | React Navigation lazy tab mounting |
| Heavy components | `React.lazy` + Suspense for charts, PDF viewer |
| Images | Progressive load; placeholder → full |
| Fonts | Load during splash; block render until ready |
| AI module | Load OpenAI-dependent screens on first access |
| Lottie | Load animations on demand |

## 31.2 Image Optimization

| Technique | Implementation |
|-----------|----------------|
| Format | WebP where supported; PNG fallback |
| Resolution | @2x assets; serve appropriate size |
| Caching | `expo-image` with disk cache |
| Thumbnails | Server-generated or client resize |
| Product images | CDN (CloudFront) with cache headers |
| Avatar/photo | Client compress before upload |
| SVG icons | Vector; no rasterization needed |

## 31.3 API Optimization

| Technique | Implementation |
|-----------|----------------|
| React Query cache | Avoid redundant fetches |
| Stale-while-revalidate | Show cached data; refresh background |
| Pagination | FlatList `onEndReached`; never load all |
| Selective fields | Request only needed fields (if API supports) |
| Batch requests | Combine dashboard widgets (if API supports) |
| Debounce search | 300ms debounce on search input |
| Cancel in-flight | AbortController on unmount |
| Prefetch | Prefetch application detail on list item visible |

## 31.4 Memory Optimization

| Technique | Implementation |
|-----------|----------------|
| FlatList tuning | `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews` |
| Image cleanup | Release large images on screen unmount |
| Query cache limit | `gcTime` limits; prune old queries |
| Redux persist whitelist | Only persist necessary slices |
| Event listener cleanup | Remove listeners in `useEffect` return |
| Navigation stack | Pop unused screens; avoid deep stacks |
| File cache limit | Max 100MB document cache; LRU eviction |

## 31.5 Bundle Optimization

| Technique | Implementation |
|-----------|----------------|
| Tree shaking | Metro bundler default |
| Hermes engine | Enabled (Expo default) |
| Code splitting | Lazy screens per feature |
| Dependency audit | Remove unused packages |
| Asset bundling | Only bundle used assets |
| Source maps | Production: external only |

## 31.6 Performance Monitoring

| Metric | Tool | Target |
|--------|------|--------|
| App start | Firebase Performance | < 2s |
| Screen render | Custom mark | < 300ms |
| API latency | Axios timing interceptor | < 500ms |
| JS frame rate | React DevTools / Flipper | 60fps |
| Memory | Xcode Instruments / Android Profiler | < 200MB |
| Crash rate | Crashlytics | < 0.5% |

---

# 32. MOBILE SECURITY

## 32.1 JWT Security

| Control | Implementation |
|---------|----------------|
| Storage | `expo-secure-store` (Keychain/Keystore) |
| Never in Redux | Tokens not stored in Redux state |
| Never in logs | Strip tokens from debug logs |
| Transmission | HTTPS only; Authorization header |
| Expiry handling | Auto-refresh; force logout on failure |

## 32.2 Secure Storage

| Data | Storage | Encrypted |
|------|---------|-----------|
| Access token | Secure Store | ✓ (OS-level) |
| Refresh token | Secure Store | ✓ |
| Device ID | AsyncStorage | ✗ (non-sensitive) |
| User preferences | AsyncStorage | ✗ |
| Wizard draft | AsyncStorage (redux-persist) | ✗ (non-sensitive form data) |
| Cached documents | FileSystem | ✗ (temp; cleared on logout) |

## 32.3 Biometric Readiness (Phase 2)

| Feature | Implementation |
|---------|----------------|
| Library | `expo-local-authentication` |
| Unlock app | Biometric gate on app resume |
| Confirm actions | Biometric for sensitive actions (withdraw) |
| Fallback | PIN/password |
| Storage | Biometric preference in AsyncStorage |

## 32.4 Root/Jailbreak Detection Readiness (Phase 2)

| Approach | Detail |
|----------|--------|
| Library | `expo-device` + native module or `jail-monkey` |
| Action | Warn user; restrict sensitive features |
| Scope | KYC screens, document upload, commission view |
| Backend | Report device integrity status |

## 32.5 Encryption

| Layer | Method |
|-------|--------|
| Transit | TLS 1.3 |
| Token storage | OS secure enclave |
| Document upload | S3 SSE-S3 |
| Local cache | No encryption (non-sensitive); sensitive docs cleared on logout |
| Certificate pinning | Phase 2 — `expo-ssl-pinning` or custom |

## 32.6 Additional Security Controls

| Control | Detail |
|---------|--------|
| Screenshot prevention | FLAG_SECURE on KYC screens (Android Phase 2) |
| Clipboard | Clear OTP from clipboard after 60s |
| Deep link validation | Whitelist paths; reject unknown |
| WebView hardening | No arbitrary URL loading |
| ProGuard/R8 | Enabled for Android release builds |
| App Transport Security | iOS ATS enforced |
| Obfuscation | Hermes bytecode (default) |

---

# 33. ANALYTICS ARCHITECTURE

## 33.1 Analytics Stack

| Tool | Purpose |
|------|---------|
| Firebase Analytics | Screen views, events, user properties |
| Firebase Crashlytics | Crash + non-fatal error reporting |
| Custom event layer | `analytics.service.ts` abstraction |

## 33.2 Screen Tracking

| Method | Automatic screen tracking via React Navigation `onStateChange` |
|--------|-------------------------------------------------------------|
| Event name | `screen_view` |
| Parameters | `screen_name`, `screen_class` |
| Convention | Match Screen IA IDs (e.g., `C-AUTH-004`) |

## 33.3 User Journey Tracking

| Journey | Key Events |
|---------|------------|
| Onboarding | `onboarding_started`, `onboarding_completed`, `onboarding_skipped` |
| Registration | `registration_started`, `otp_sent`, `otp_verified`, `registration_completed` |
| Product discovery | `product_catalog_viewed`, `product_detail_viewed`, `product_compared` |
| Eligibility | `eligibility_started`, `eligibility_completed`, `eligibility_failed` |
| Application | `application_started`, `wizard_step_completed`, `application_submitted` |
| Documents | `document_upload_started`, `document_uploaded`, `document_verified` |
| AI | `ai_session_started`, `ai_message_sent`, `ai_recommendation_tapped` |
| Referral | `referral_shared`, `referral_code_copied` |
| Support | `ticket_created`, `faq_viewed` |

## 33.4 Funnel Tracking

| Funnel | Stages |
|--------|--------|
| **Application** | Product view → Eligibility → Wizard start → Step 1..N → Submit |
| **KYC** | KYC hub → PAN → Aadhaar → Photo → Complete |
| **Referral** | Dashboard view → Share → Code applied (backend) → Conversion (backend) |
| **DSA Lead** | Dashboard → Lead create → Submit → Convert (backend) |
| **AI Engagement** | Advisor open → Message sent → Recommendation acted → Application started |

## 33.5 Conversion Tracking

| Conversion | Event | Attribution |
|------------|-------|-------------|
| Application submitted | `application_submitted` | Product code, source |
| KYC completed | `kyc_completed` | Time to complete |
| Referral shared | `referral_shared` | Channel (WhatsApp, SMS, copy) |
| AI to application | `ai_to_application` | Session ID |
| DSA lead submitted | `lead_submitted` | Product, time to submit |
| Document uploaded | `document_uploaded` | Type, upload method (camera/gallery) |

## 33.6 User Properties

| Property | Value |
|----------|-------|
| `user_type` | CUSTOMER, DSA |
| `app_version` | Current version |
| `platform` | ios, android |
| `language` | en, hi |
| `kyc_status` | NOT_STARTED, VERIFIED, etc. |
| `has_active_application` | boolean |
| `profile_completion` | 0–100 |
| `partner_tier` (DSA) | Bronze, Silver, Gold |

---

# 34. ACCESSIBILITY

## 34.1 Font Scaling

| Setting | Support |
|---------|---------|
| System font scale | Respect `PixelRatio.getFontScale()` |
| Max scale | Cap at 1.5× to prevent layout breaks |
| Minimum touch target | 44×44pt regardless of font scale |
| Amount text | Allow scaling on EMI/amount displays |

## 34.2 Screen Reader

| Requirement | Implementation |
|-------------|----------------|
| All buttons | `accessibilityLabel` + `accessibilityRole` |
| Images | `accessibilityLabel` describing content |
| Form fields | Label associated with input |
| Status badges | Announce status text |
| Timeline | Sequential reading order |
| OTP input | Announce "digit X of 6" |
| Loading | `accessibilityLiveRegion` for state changes |
| Errors | Announce error messages |

## 34.3 Color Contrast

| Pair | Ratio | WCAG |
|------|-------|------|
| #FFFFFF on #071A1F | 15.5:1 | AAA ✓ |
| #FFFFFF on #102B2E | 12.8:1 | AAA ✓ |
| #C7D2D9 on #071A1F | 9.2:1 | AAA ✓ |
| #C7D2D9 on #102B2E | 7.6:1 | AAA ✓ |
| #22D3A6 on #071A1F | 8.1:1 | AAA ✓ |
| #22D3A6 on #102B2E | 6.7:1 | AA ✓ |
| #071A1F on #22D3A6 | 8.1:1 | AAA ✓ (button text) |

## 34.4 Accessibility Standards

| Standard | Target |
|----------|--------|
| WCAG | 2.1 Level AA |
| Platform | iOS Accessibility Guidelines |
| Platform | Android Accessibility Guidelines |
| Testing | VoiceOver (iOS) + TalkBack (Android) per release |
| Reduced motion | Respect `AccessibilityInfo.isReduceMotionEnabled` |
| High contrast | Dark theme inherently high contrast |

---

# 35. FUTURE EXPANSION

## 35.1 Expansion Architecture Principle

New products and features integrate as **new feature modules** under `features/` with **no changes** to navigation root, state architecture, or API layer patterns.

## 35.2 Product Expansion

| Module | Path | Navigation Entry |
|--------|------|------------------|
| Insurance | `features/insurance/` | Products tab → Insurance card |
| Credit Cards | `features/cards/` | Products tab → Cards card |
| Personal Loan | `features/personal-loan/` | Products tab → PL card |
| Mutual Funds | `features/wealth/mf/` | Products tab → Wealth section |
| Fixed Deposit | `features/wealth/fd/` | Wealth section |
| Gold Loan | `features/gold-loan/` | Products tab → Gold card |
| Wealth Management | `features/wealth/` | More tab → Wealth |

## 35.3 Feature Expansion

| Feature | Integration |
|---------|-------------|
| Video KYC | Extend `features/kyc/` — WebRTC screen |
| eSign | Extend `features/documents/` — signing WebView |
| Biometric login | Extend `features/auth/` + `features/settings/` |
| Hindi language | i18n files; `features/settings/` language picker |
| Light theme | `theme/light.ts` — ThemeProvider switch |
| Account Aggregator | Extend `features/documents/` — bank fetch flow |
| Chat support | Extend `features/support/` — WebSocket chat |
| Apple Pay / Google Pay | Phase 3 — payment feature module |

## 35.4 DSA Expansion

| Feature | Path |
|---------|------|
| Insurance lead submit | `features/lead-submission/` — product selector extension |
| Team management | `features/team/` (Phase 3) |
| Sub-partner onboarding | `features/sub-partners/` (Phase 3) |

---

# 36. DEVELOPMENT ROADMAP

## 36.1 Phase Overview

| Phase | Name | Weeks | Apps | Exit Criteria |
|-------|------|-------|------|---------------|
| **1** | Platform Foundation | 1–4 | Both | Scaffold, auth, navigation, theme |
| **2** | Customer Core | 5–8 | Customer | Dashboard, profile, products |
| **3** | Applications & Docs | 9–12 | Customer | Wizard, tracking, documents, KYC |
| **4** | Calculators & Products | 13–16 | Customer | EMI, eligibility, all product wizards |
| **5** | AI Features | 17–19 | Customer | AI Advisor, Voice AI |
| **6** | Engagement | 20–22 | Customer | Referral, support, notifications, settings |
| **7** | DSA App | 23–26 | DSA | Full DSA app |
| **8** | Production | 27–30 | Both | Testing, store submission, go-live |

## 36.2 Phase 1: Platform Foundation (Weeks 1–4)

| Week | Deliverables |
|------|-------------|
| W1 | Monorepo mobile scaffold; Expo config; EAS profiles; AppProviders; theme tokens (Dark Luxury) |
| W1 | Redux store setup; React Query client; shared-api integration |
| W2 | Navigation: Root, Auth, Main tabs (both apps); deep link config |
| W2 | UI primitives: Button, Input, Card, Badge, FormField |
| W3 | Auth flow: Splash, Onboarding, Login, OTP, Registration (Customer) |
| W3 | Auth flow: Partner Login, OTP (DSA) |
| W4 | Secure storage; token refresh interceptor; FCM setup |
| W4 | Analytics service; error boundary; network status banner |

**Exit criteria:**
- [ ] Both apps build on iOS + Android via EAS
- [ ] OTP login works end-to-end
- [ ] Navigation between auth and main tabs
- [ ] Dark Luxury theme applied globally
- [ ] Push notification registration works

## 36.3 Phase 2: Customer Core (Weeks 5–8)

| Week | Deliverables |
|------|-------------|
| W5 | Dashboard screen + widgets; notification bell |
| W5 | Profile hub + personal details (Formik + Yup) |
| W6 | Address, employment, income screens |
| W6 | Product catalog + product detail screens |
| W7 | Product family overviews (HL, LAP, BL, AL) |
| W7 | Profile completion progress |
| W8 | More menu; settings screen skeleton |
| W8 | Pull-to-refresh; skeleton loaders; empty states |

## 36.4 Phase 3: Applications & Docs (Weeks 9–12)

| Week | Deliverables |
|------|-------------|
| W9 | Application list + detail + timeline screens |
| W9 | Wizard container + step navigation; wizard Redux slice |
| W10 | HL-01 wizard steps (7 steps) |
| W10 | Document upload flow (camera, gallery, presign, S3) |
| W11 | KYC module: PAN, Aadhaar, photo, address proof |
| W11 | Document dashboard + verification status |
| W12 | Deficiency screen; document vault |
| W12 | Offline wizard persist; document upload queue |

## 36.5 Phase 4: Calculators & Products (Weeks 13–16)

| Week | Deliverables |
|------|-------------|
| W13 | EMI calculator + amortization table |
| W13 | Eligibility check + result screens |
| W14 | LAP-01, BL-01, AL-01 wizard steps |
| W14 | Savings calculator + loan comparison |
| W15 | HL-02 BT, HL-03 Top-Up wizard variants |
| W15 | LAP-02 BT wizard |
| W16 | BL-02 MSME, BL-03 WC wizard variants |
| W16 | AL-02 Used Car wizard; product comparison screen |

## 36.6 Phase 5: AI Features (Weeks 17–19)

| Week | Deliverables |
|------|-------------|
| W17 | AI Advisor home + conversation screen |
| W17 | Chat UI: bubbles, streaming, suggestions |
| W18 | AI recommendations + eligibility results screens |
| W18 | Conversation history |
| W19 | Voice AI: start, session, results screens |
| W19 | Callback request + appointment booking |

## 36.7 Phase 6: Engagement (Weeks 20–22)

| Week | Deliverables |
|------|-------------|
| W20 | Referral dashboard + tracking + share |
| W20 | Rewards + leaderboard |
| W21 | Support: help center, tickets, FAQ, KB |
| W21 | Notification list + channel history screens |
| W22 | Settings: security, notifications, privacy, language |
| W22 | Deep linking for all major flows |

## 36.8 Phase 7: DSA App (Weeks 23–26)

| Week | Deliverables |
|------|-------------|
| W23 | DSA registration + onboarding gate |
| W23 | Partner KYC + agreement screens |
| W24 | DSA dashboard + earnings widgets |
| W24 | Lead submission (create, product select, attach docs) |
| W25 | Lead tracking (list, detail, status, follow-ups) |
| W25 | Commission dashboard + ledger + payout reports |
| W26 | Training module; performance reports; DSA settings |
| W26 | DSA-specific push notifications + deep links |

## 36.9 Phase 8: Production (Weeks 27–30)

| Week | Deliverables |
|------|-------------|
| W27 | E2E testing critical flows (both apps) |
| W27 | Accessibility audit (VoiceOver, TalkBack) |
| W28 | Performance profiling; optimization pass |
| W28 | Security review; penetration test |
| W29 | App Store + Play Store assets; submission |
| W29 | Beta testing (TestFlight + internal track) |
| W30 | Production release; monitoring setup |
| W30 | Post-launch crash monitoring; hotfix process |

---

# APPENDIX A: EXPO CONFIGURATION

| Setting | Customer | DSA |
|---------|----------|-----|
| `name` | KuberOne | KuberOne Partner |
| `slug` | kuberone | kuberone-partner |
| `bundleIdentifier` (iOS) | com.kuberfinserve.kuberone.customer | com.kuberfinserve.kuberone.dsa |
| `package` (Android) | com.kuberfinserve.kuberone.customer | com.kuberfinserve.kuberone.dsa |
| `version` | Semver (e.g., 1.0.0) | Semver |
| `orientation` | portrait | portrait |
| `userInterfaceStyle` | dark | dark |
| `splash.backgroundColor` | #071A1F | #071A1F |
| `primaryColor` | #22D3A6 | #22D3A6 |

**Expo plugins:**

| Plugin | Purpose |
|--------|---------|
| `expo-font` | Inter font loading |
| `expo-secure-store` | Token storage |
| `expo-notifications` | FCM push |
| `expo-image-picker` | Document camera/gallery |
| `expo-camera` | KYC photo capture |
| `expo-file-system` | Document cache |
| `expo-local-authentication` | Biometric (Phase 2) |
| `expo-device` | Device info |
| `expo-constants` | App version |
| `@react-native-firebase/app` | Firebase core |
| `@react-native-firebase/analytics` | Analytics |
| `@react-native-firebase/crashlytics` | Crash reporting |

---

# APPENDIX B: KEY DEPENDENCIES

| Package | Version Strategy | Purpose |
|---------|------------------|---------|
| `expo` | SDK 51+ | Managed workflow |
| `react-native` | Via Expo SDK | Core framework |
| `typescript` | 5.x | Type safety |
| `@reduxjs/toolkit` | Latest | State management |
| `react-redux` | Latest | Redux bindings |
| `redux-persist` | Latest | State persistence |
| `@tanstack/react-query` | v5 | Server state |
| `@react-navigation/native` | v6 | Navigation |
| `@react-navigation/bottom-tabs` | v6 | Tab navigator |
| `@react-navigation/native-stack` | v6 | Stack navigator |
| `axios` | Via shared-api | HTTP client |
| `formik` | Latest | Form management |
| `yup` | Latest | Validation |
| `react-native-reanimated` | Via Expo | Animations |
| `@gorhom/bottom-sheet` | Latest | Bottom sheets |
| `expo-image` | Via Expo | Optimized images |
| `expo-secure-store` | Via Expo | Secure storage |
| `expo-notifications` | Via Expo | Push notifications |
| `lottie-react-native` | Latest | Lottie animations |
| `@react-native-community/netinfo` | Latest | Network status |
| `react-native-svg` | Via Expo | SVG icons |
| `date-fns` | Via shared-utils | Date formatting |

---

# APPENDIX C: ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_APP_ENV` | Yes | development, uat, production |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase config |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM sender |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `EXPO_PUBLIC_DEEP_LINK_DOMAIN` | Yes | Universal link domain |
| `EXPO_PUBLIC_SENTRY_DSN` | Phase 2 | Error tracking |
| `EXPO_PUBLIC_ANALYTICS_ENABLED` | No | Toggle analytics (default true) |

---

# APPENDIX D: NAMING CONVENTIONS

| Element | Convention | Example |
|---------|------------|---------|
| Screen file | `{Name}Screen.tsx` | `DashboardScreen.tsx` |
| Component file | `{Name}.tsx` | `ApplicationCard.tsx` |
| Hook file | `use{Name}.ts` | `useOtpAuth.ts` |
| Redux slice | `{name}.slice.ts` | `auth.slice.ts` |
| Selector file | `{name}.selectors.ts` | `auth.selectors.ts` |
| API file | `{name}.api.ts` | `application.api.ts` |
| Yup schema | `{name}.schema.ts` | `login.schema.ts` |
| Feature folder | kebab-case | `features/ai-advisor/` |
| Route constant | SCREAMING_SNAKE | `SCREEN_DASHBOARD` |
| Analytics event | snake_case | `application_submitted` |
| Theme token | camelCase | `textPrimary` |
| Test file | `{name}.test.tsx` | `Button.test.tsx` |

---

# APPENDIX E: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| Mobile Lead | | | |
| UX Lead | | | |
| Product Owner | | | |

---

# APPENDIX F: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release |

---

# APPENDIX G: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Parent architecture |
| [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md) | Repository layout |
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | API contracts, auth, modules |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | REST endpoints consumed by mobile |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | Screen inventory + navigation IA |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product variants + wizard fields |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Data visibility rules |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | AI Advisor, Voice AI, conversation design |
| [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) | Mobile store deploy, Expo OTA, EAS builds |

---

*End of Document — KuberOne React Native Mobile App Architecture v1.0*

