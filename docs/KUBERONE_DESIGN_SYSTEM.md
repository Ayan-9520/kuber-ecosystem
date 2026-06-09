# KuberOne
## Design System Specification (Document B1)

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Design System — Visual Language & Component Standards  
**Document ID:** B1  
**Classification:** Design-Ready | Engineering-Ready | Brand-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Authoritative — Mandatory for all KuberOne surfaces  
**Related Documents:**
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) — CRM implementation
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md) — Mobile implementation
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) — Screen inventory
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) — Role-adaptive UI

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Colors, typography, components, spacing, motion, mobile, CRM, accessibility |
| **Audience** | Design, Frontend Engineering, Mobile Engineering, Product, Marketing |
| **Mandatory Brand** | KuberOne · Premium Fintech · Dark Luxury |
| **Compliance Target** | WCAG 2.1 Level AA minimum |

---

# Executive Summary

The KuberOne Design System defines the **visual and interaction language** for all customer-facing mobile apps, partner apps, CRM admin panel, and marketing surfaces. The aesthetic is **Premium Fintech** with a **Dark Luxury** treatment — deep teal backgrounds, luminous mint accents, and refined typography that communicates trust, sophistication, and institutional-grade financial technology.

**Mandatory brand tokens:**

| Token | Value | Usage |
|-------|-------|-------|
| Brand Name | **KuberOne** | All product surfaces |
| Theme | **Premium Fintech** | Overall aesthetic direction |
| Style | **Dark Luxury** | Primary mode; light mode secondary (Phase 2) |
| Primary | **#22D3A6** | CTAs, links, active states, grade A+ indicators |
| Background | **#071A1F** | App and page background |
| Card | **#102B2E** | Elevated surfaces, panels, modals |
| Accent | **#18C964** | Success, positive trends, confirmation |
| Text | **#FFFFFF** | Primary text on dark surfaces |
| Secondary Text | **#C7D2D9** | Labels, captions, metadata |
| Font | **Inter** | All UI text; system fallback stack defined |

This document is **mandatory** for all new screens. Deviations require Design Lead + CTO approval. All components MUST meet **WCAG 2.1 AA** contrast and interaction requirements.

---

# 1. Brand Foundation

## 1.1 Brand Personality

| Attribute | Expression |
|-----------|------------|
| **Trustworthy** | Consistent patterns, clear hierarchy, no visual clutter |
| **Premium** | Generous spacing, subtle shadows, restrained color use |
| **Intelligent** | AI surfaces use distinct but harmonious accent treatment |
| **Accessible** | High contrast text; touch targets ≥ 44×44 pt |
| **Professional** | CRM density optimized for data-heavy workflows |

## 1.2 Logo Usage

| Context | Treatment |
|---------|-------------|
| App header | KuberOne wordmark + optional icon; min clear space = 1× icon height |
| CRM sidebar | Compact icon + wordmark on expand |
| Favicon | Icon only on #071A1F background |
| Partner co-brand | KuberOne primary; partner logo secondary, max 40% width |
| **Prohibited** | Stretching, rotation, unapproved color variants, drop shadows on logo |

## 1.3 Voice & Tone (UI Copy)

| Context | Tone | Example |
|---------|------|---------|
| Customer app | Warm, clear, reassuring | "Your application is being reviewed" |
| CRM | Direct, operational | "3 A+ leads require contact within 1 hour" |
| Error states | Helpful, non-blaming | "We couldn't verify your document. Please try again." |
| AI surfaces | Advisory, transparent | "AI suggestion — final decision is yours" |

---

# 2. Color System

## 2.1 Core Palette (Mandatory)

| Token Name | Hex | RGB | Usage |
|------------|-----|-----|-------|
| `color-primary` | **#22D3A6** | 34, 211, 166 | Primary buttons, links, focus rings, A+ grade badge |
| `color-background` | **#071A1F** | 7, 26, 31 | Page/app background |
| `color-card` | **#102B2E** | 16, 43, 46 | Cards, panels, sidebar, table rows |
| `color-accent` | **#18C964** | 24, 201, 100 | Success states, positive metrics, confirmation |
| `color-text-primary` | **#FFFFFF** | 255, 255, 255 | Headings, body text, input values |
| `color-text-secondary` | **#C7D2D9** | 199, 210, 217 | Labels, placeholders, timestamps |

## 2.2 Extended Palette

| Token Name | Hex | Usage |
|------------|-----|-------|
| `color-background-elevated` | #0D2328 | Modals, dropdowns, popovers |
| `color-background-sunken` | #051216 | Input fields, inset areas |
| `color-border-default` | #1E3E42 | Card borders, dividers |
| `color-border-focus` | #22D3A6 | Focus state borders |
| `color-border-subtle` | #163033 | Table row separators |
| `color-primary-hover` | #1BB896 | Primary button hover |
| `color-primary-pressed` | #159B7D | Primary button pressed |
| `color-primary-muted` | #22D3A620 | Primary tint backgrounds (12.5% opacity) |
| `color-accent-hover` | #14A855 | Accent button hover |
| `color-accent-muted` | #18C96420 | Success background tint |

## 2.3 Semantic Colors

| Token | Hex | Usage | WCAG on #102B2E |
|-------|-----|-------|-----------------|
| `color-success` | #18C964 | Success toasts, verified badges | 4.6:1 (AA) |
| `color-warning` | #F5A524 | SLA warnings, pending states | 4.5:1 (AA) |
| `color-error` | #F31260 | Errors, rejections, SLA breach | 4.5:1 (AA) |
| `color-info` | #0070F3 | Informational banners | 4.5:1 (AA) |
| `color-neutral` | #889096 | Disabled text, inactive icons | 3.2:1 (large text only) |

## 2.4 Lead Grade Colors (Canonical — Document A3)

| Grade | Badge Background | Badge Text | Alias Label Color |
|-------|------------------|------------|-------------------|
| A+ (Hot) | #22D3A6 | #071A1F | #22D3A6 |
| A (Warm) | #0070F3 | #FFFFFF | #0070F3 |
| B (Moderate) | #F5A524 | #071A1F | #F5A524 |
| C (Cold) | #889096 | #FFFFFF | #889096 |
| Rejected | #F31260 | #FFFFFF | #F31260 |

## 2.5 LOS Stage Colors

| Stage Range | Color Token | Usage |
|-------------|-------------|-------|
| S01–S02 (Early) | #0070F3 | Pipeline start |
| S03–S04 (Docs/Credit) | #F5A524 | In-progress |
| S05–S06 (Lender) | #7828C8 | External review |
| S07–S08 (Sanction/Disburse) | #18C964 | Near completion |
| S09 (Portfolio) | #22D3A6 | Closed loop |

## 2.6 Data Visualization Palette

| Order | Hex | Usage |
|-------|-----|-------|
| 1 | #22D3A6 | Primary series |
| 2 | #0070F3 | Secondary series |
| 3 | #F5A524 | Tertiary |
| 4 | #7828C8 | Quaternary |
| 5 | #F31260 | Negative/denied |
| 6 | #889096 | Baseline/comparison |

**Chart rules:** Maximum 6 series per chart; always include legend; never rely on color alone — use patterns or labels.

## 2.7 Contrast Requirements (WCAG 2.1 AA)

| Pairing | Minimum Ratio | Status |
|---------|---------------|--------|
| #FFFFFF on #071A1F | 15.4:1 | Pass AAA |
| #FFFFFF on #102B2E | 12.1:1 | Pass AAA |
| #C7D2D9 on #102B2E | 7.8:1 | Pass AAA |
| #22D3A6 on #071A1F | 8.2:1 | Pass AAA |
| #22D3A6 on #102B2E | 6.4:1 | Pass AA |
| #071A1F on #22D3A6 | 8.2:1 | Pass AAA (button text) |

---

# 3. Typography

## 3.1 Font Family

| Token | Value |
|-------|-------|
| `font-family-primary` | **Inter**, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif |
| `font-family-mono` | "JetBrains Mono", "Fira Code", Consolas, monospace |

**Inter loading:** Self-hosted WOFF2 preferred; Google Fonts fallback acceptable. `font-display: swap` mandatory.

## 3.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-display-lg` | 36px / 2.25rem | 700 | 1.2 | -0.02em | Marketing hero |
| `text-display` | 30px / 1.875rem | 700 | 1.25 | -0.02em | Page titles (CRM) |
| `text-heading-lg` | 24px / 1.5rem | 600 | 1.3 | -0.01em | Section headers |
| `text-heading` | 20px / 1.25rem | 600 | 1.35 | -0.01em | Card titles |
| `text-heading-sm` | 16px / 1rem | 600 | 1.4 | 0 | Subsection headers |
| `text-body-lg` | 16px / 1rem | 400 | 1.5 | 0 | Primary body (mobile) |
| `text-body` | 14px / 0.875rem | 400 | 1.5 | 0 | Primary body (CRM) |
| `text-body-sm` | 12px / 0.75rem | 400 | 1.5 | 0.01em | Captions, metadata |
| `text-label` | 12px / 0.75rem | 500 | 1.4 | 0.04em | Form labels, badges |
| `text-overline` | 11px / 0.6875rem | 600 | 1.4 | 0.08em | Category labels (uppercase) |

## 3.3 Typography Rules

| Rule | Detail |
|------|--------|
| Maximum line length | 65–75 characters for body text |
| Heading hierarchy | Single H1 per screen; no skipped levels |
| Numeric data | Tabular figures (`font-variant-numeric: tabular-nums`) in tables and dashboards |
| Currency | ₹ prefix; Indian numbering (lakhs/crores) in CRM; compact in mobile |
| Truncation | Ellipsis after 2 lines for cards; full text in tooltip |
| ALL CAPS | Overline and badge labels only; never body paragraphs |

---

# 4. Spacing & Layout

## 4.1 Spacing Scale (4px Base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | — |
| `space-1` | 4px | Icon-text gap |
| `space-2` | 8px | Compact padding |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Card padding (mobile) |
| `space-5` | 20px | Section gap |
| `space-6` | 24px | Card padding (CRM) |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Page margin (mobile) |
| `space-12` | 48px | Large section gap |
| `space-16` | 64px | Page header margin |

## 4.2 Grid Systems

| Surface | Columns | Gutter | Margin |
|---------|---------|--------|--------|
| Mobile (320–428px) | 4 | 16px | 16px |
| Tablet (768px+) | 8 | 24px | 32px |
| CRM Desktop (1280px+) | 12 | 24px | 32px |
| CRM Wide (1536px+) | 12 | 32px | 48px |

## 4.3 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Badges, chips |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 16px | Modals, bottom sheets |
| `radius-full` | 9999px | Avatars, pills |

## 4.4 Shadows (Dark Luxury)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.4) | Subtle elevation |
| `shadow-md` | 0 4px 12px rgba(0,0,0,0.5) | Cards, dropdowns |
| `shadow-lg` | 0 8px 24px rgba(0,0,0,0.6) | Modals |
| `shadow-glow-primary` | 0 0 20px rgba(34,211,166,0.15) | Primary CTA emphasis |
| `shadow-glow-accent` | 0 0 16px rgba(24,201,100,0.12) | Success celebration |

---

# 5. Buttons

## 5.1 Button Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | #22D3A6 | #071A1F | none | Main CTAs |
| **Secondary** | transparent | #22D3A6 | 1px #22D3A6 | Secondary actions |
| **Accent** | #18C964 | #071A1F | none | Confirm, success actions |
| **Ghost** | transparent | #FFFFFF | none | Tertiary, toolbar |
| **Danger** | #F31260 | #FFFFFF | none | Delete, reject |
| **Disabled** | #163033 | #889096 | none | Inactive state |

## 5.2 Button Sizes

| Size | Height | Padding (H) | Font | Min Touch Target |
|------|--------|-------------|------|------------------|
| `sm` | 32px | 12px | 12px/500 | 44px tap area |
| `md` | 40px | 16px | 14px/500 | 44px tap area |
| `lg` | 48px | 24px | 16px/600 | 48px tap area |
| `xl` | 56px | 32px | 16px/600 | 56px (mobile primary CTA) |

## 5.3 Button States

| State | Primary Treatment |
|-------|-------------------|
| Default | #22D3A6 background |
| Hover | #1BB896 + shadow-glow-primary |
| Pressed | #159B7D; scale 0.98 |
| Focus | 2px #22D3A6 outline, 2px offset |
| Loading | Spinner replaces label; width preserved |
| Disabled | 50% opacity; no pointer events |

## 5.4 Icon Buttons

| Property | Value |
|----------|-------|
| Size | 40×40px (md); 32×32px (sm) |
| Icon size | 20px (md); 16px (sm) |
| Border radius | radius-md |
| Focus | Same as text buttons |

---

# 6. Cards

## 6.1 Card Variants

| Variant | Background | Border | Shadow | Usage |
|---------|------------|--------|--------|-------|
| **Default** | #102B2E | 1px #1E3E42 | shadow-sm | Standard content |
| **Elevated** | #0D2328 | none | shadow-md | Featured content |
| **Interactive** | #102B2E | 1px #1E3E42 | shadow-sm → shadow-md on hover | Clickable cards |
| **AI Insight** | #102B2E | 1px #22D3A640 | shadow-glow-primary | Copilot suggestions |
| **SLA Alert** | #F3126010 | 1px #F31260 | none | Breach warnings |

## 6.2 Card Anatomy

| Element | Specification |
|---------|---------------|
| Padding | 16px (mobile) / 24px (CRM) |
| Header | text-heading-sm; optional action icon right |
| Body | text-body; space-4 below header |
| Footer | border-top 1px #1E3E42; padding-top space-4 |
| Border radius | radius-lg |

## 6.3 Lead Card (CRM)

| Element | Treatment |
|---------|-------------|
| Grade badge | Top-right; grade colors from §2.4 |
| Customer name | text-heading-sm; #FFFFFF |
| Product + amount | text-body; #C7D2D9 |
| SLA clock | text-body-sm; #F5A524 when < 20% time remaining |
| Assignee avatar | 32px circle; border 2px #22D3A6 if A+ |

---

# 7. Forms

## 7.1 Input Fields

| Property | Value |
|----------|-------|
| Background | #051216 |
| Border | 1px #1E3E42 |
| Border (focus) | 2px #22D3A6 |
| Border (error) | 2px #F31260 |
| Text | #FFFFFF, text-body |
| Placeholder | #889096 |
| Label | text-label; #C7D2D9; above field |
| Height | 40px (md); 48px (lg mobile) |
| Padding | 12px horizontal |
| Border radius | radius-md |

## 7.2 Input States

| State | Treatment |
|-------|-----------|
| Default | Border #1E3E42 |
| Focus | Border #22D3A6; shadow-glow-primary subtle |
| Error | Border #F31260; error message below in #F31260 |
| Disabled | Background #163033; text #889096 |
| Read-only | Background #102B2E; no border change |

## 7.3 Select & Dropdown

| Property | Value |
|----------|-------|
| Menu background | #0D2328 |
| Menu border | 1px #1E3E42 |
| Item height | 40px |
| Item hover | Background #163033 |
| Selected item | Background #22D3A620; checkmark #22D3A6 |

## 7.4 Checkbox & Radio

| Property | Value |
|----------|-------|
| Size | 20×20px |
| Unchecked border | #1E3E42 |
| Checked fill | #22D3A6 |
| Checkmark/icon | #071A1F |
| Focus ring | 2px #22D3A6 offset 2px |

## 7.5 Form Layout Rules

| Rule | Detail |
|------|--------|
| Label always visible | No placeholder-only labels |
| Error placement | Directly below field; aria-describedby linked |
| Required indicator | Asterisk (*) in #F31260 after label |
| Group spacing | space-5 between field groups |
| Mobile | Single column; full-width inputs |
| CRM | Two-column for short fields; full-width for text areas |

---

# 8. Tables (CRM)

## 8.1 Data Table Specification

| Element | Treatment |
|---------|-------------|
| Header background | #0D2328 |
| Header text | text-label; #C7D2D9; uppercase |
| Row background | #102B2E |
| Row hover | #163033 |
| Row selected | #22D3A610 |
| Row border | 1px #163033 bottom |
| Cell padding | 12px 16px |
| Font | text-body; tabular-nums for numbers |
| Sticky header | Yes; shadow-sm on scroll |

## 8.2 Table Features

| Feature | Specification |
|---------|---------------|
| Sort indicator | Chevron #22D3A6 on active column |
| Pagination | Bottom bar; #102B2E background |
| Row actions | Icon buttons; visible on hover (desktop) or swipe (mobile) |
| Empty state | Centered illustration + message + CTA |
| Loading | Skeleton rows; shimmer #163033 → #1E3E42 |
| Density toggle | Compact (40px row) / Standard (48px) / Comfortable (56px) |

## 8.3 Responsive Table Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Full table |
| Tablet | Hide low-priority columns; horizontal scroll fallback |
| Mobile CRM | Card list view; table columns become card fields |

---

# 9. Charts & Data Visualization

## 9.1 Chart Container

| Property | Value |
|----------|-------|
| Background | #102B2E |
| Border | 1px #1E3E42 |
| Border radius | radius-lg |
| Padding | space-6 |
| Title | text-heading-sm |
| Legend | Below or right; text-body-sm |

## 9.2 Chart Types

| Type | Usage | Colors |
|------|-------|--------|
| Line | Trends over time | Primary + data viz palette |
| Bar | Comparisons, funnels | Primary for positive; #F31260 for negative |
| Donut/Pie | Composition (source mix) | Max 5 segments + "Other" |
| Gauge | SLA compliance, score | #22D3A6 fill; #163033 track |
| Funnel | Lead pipeline | Gradient #22D3A6 → #889096 |
| Sparkline | Inline trend | #22D3A6; no axes |

## 9.3 Chart Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Color independence | Data labels on hover; patterns for print |
| Screen reader | aria-label with summary statistic |
| Motion | No auto-animating charts; animate on viewport entry only |
| Tooltip | #0D2328 background; #FFFFFF text; shadow-md |

## 9.4 CRM Dashboard Charts

| Dashboard | Key Charts |
|-----------|------------|
| LMS | Grade funnel, SLA gauge, source pie |
| LOS | Stage pipeline, aging histogram |
| Partner | Leaderboard bar, A+ % trend line |
| Management | Revenue line, conversion by region bar |

---

# 10. Icons

## 10.1 Icon System

| Property | Value |
|----------|-------|
| Library | Lucide Icons (primary); custom KuberOne icons for brand |
| Style | Outlined; 1.5px stroke |
| Sizes | 16px (inline), 20px (buttons), 24px (nav), 32px (empty states) |
| Color | Inherit text color; #22D3A6 for active nav |

## 10.2 Icon Usage Rules

| Rule | Detail |
|------|--------|
| Always pair with label | Nav items, primary actions (except icon-only with aria-label) |
| Grade icons | Flame (A+), TrendingUp (A), Minus (B), Snowflake (C), XCircle (Rejected) |
| Status icons | CheckCircle (#18C964), AlertTriangle (#F5A524), XCircle (#F31260) |
| AI indicator | Sparkles icon #22D3A6 before AI-generated content |

---

# 11. Shadows & Elevation

## 11.1 Elevation Scale

| Level | Shadow Token | Usage |
|-------|--------------|-------|
| 0 | none | Flat backgrounds |
| 1 | shadow-sm | Cards at rest |
| 2 | shadow-md | Dropdowns, popovers |
| 3 | shadow-lg | Modals, drawers |
| 4 | shadow-glow-primary | Hero CTAs, AI panels |

## 11.2 Layer Order (Z-Index)

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Base | 0 | Page content |
| Sticky | 100 | Headers, table headers |
| Dropdown | 200 | Menus, tooltips |
| Overlay | 300 | Modal backdrop |
| Modal | 400 | Dialogs, drawers |
| Toast | 500 | Notifications |
| Loading | 600 | Full-screen loader |

---

# 12. Animations & Motion

## 12.1 Timing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | General transitions |
| `ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| `ease-out` | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| `ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful micro-interactions |

## 12.2 Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 100ms | Hover color changes |
| `duration-fast` | 200ms | Button press, toggle |
| `duration-normal` | 300ms | Modal enter/exit |
| `duration-slow` | 500ms | Page transitions (mobile) |

## 12.3 Motion Rules

| Rule | Detail |
|------|--------|
| `prefers-reduced-motion` | Disable all non-essential animation; instant transitions |
| Page transitions | Slide left (forward); slide right (back) on mobile |
| Modal | Fade + scale 0.95→1.0; 300ms |
| Toast | Slide from top-right; auto-dismiss 5s |
| Skeleton shimmer | 1.5s loop; disabled with reduced motion |
| Loading spinner | Primary color #22D3A6; 24px standard |
| **Prohibited** | Parallax, excessive bounce, animation > 500ms for UI feedback |

---

# 13. Mobile Guidelines

## 13.1 Platform Coverage

| Platform | Minimum Version | Framework |
|----------|-----------------|-----------|
| iOS | 15+ | React Native |
| Android | API 24 (7.0)+ | React Native |

## 13.2 Mobile Navigation

| Pattern | Usage |
|---------|-------|
| Bottom tab bar | 4–5 primary destinations; active #22D3A6 |
| Stack navigation | Drill-down flows; back gesture enabled |
| Bottom sheet | Filters, actions, confirmations |
| Pull to refresh | List screens; #22D3A6 spinner |

## 13.3 Mobile-Specific Components

| Component | Specification |
|-----------|---------------|
| Tab bar height | 56px + safe area inset |
| Header height | 56px; large title on scroll collapse (iOS) |
| FAB | 56×56px; #22D3A6; shadow-glow-primary; bottom-right |
| Swipe actions | Left: archive; Right: call/message |
| OTP input | 6 boxes; 48×56px each; gap 8px |

## 13.4 Touch & Gesture

| Requirement | Value |
|-------------|-------|
| Minimum touch target | 44×44pt (iOS HIG) / 48×48dp (Material) |
| Tap feedback | Opacity 0.7 or scale 0.98 on press |
| Long press | Context menu; 500ms threshold |
| Safe areas | Respect notch, home indicator, status bar |

## 13.5 Mobile Typography Adjustments

| Element | Mobile Adjustment |
|---------|-------------------|
| Body text | 16px minimum (prevents iOS zoom on focus) |
| Page title | text-heading-lg (24px) |
| Input height | 48px (lg) for primary forms |

## 13.6 Customer App vs DSA App

| Aspect | Customer App | DSA App |
|--------|--------------|---------|
| Primary CTA | "Apply Now" / "Check Eligibility" | "Submit Lead" / "Track Commission" |
| Navigation | Home, Apply, Track, Profile | Leads, Submit, Commissions, Profile |
| Density | Spacious; single-column | Moderate; list-heavy |
| AI Advisor | Prominent entry point | Secondary |

---

# 14. CRM Guidelines

## 14.1 CRM Layout

| Element | Specification |
|---------|---------------|
| Sidebar width | 240px expanded; 64px collapsed |
| Sidebar background | #071A1F |
| Content area | #071A1F background; #102B2E cards |
| Top bar height | 56px |
| Breadcrumbs | text-body-sm; #C7D2D9; current page #FFFFFF |

## 14.2 CRM Navigation

| Section | Icon | Active State |
|---------|------|--------------|
| Dashboard | LayoutDashboard | #22D3A6 icon + left border 3px |
| Leads (LMS) | Users | Same |
| Applications (LOS) | FileText | Same |
| Partners | Handshake | Same |
| Commissions | IndianRupee | Same |
| Analytics | BarChart3 | Same |
| Support | Headphones | Same |
| Settings | Settings | Same |

## 14.3 Role-Adaptive UI

| Role | UI Adaptation |
|------|---------------|
| Sales Executive | Lead queue prominent; simplified analytics |
| Branch Manager | SLA breach panel; team performance |
| Credit Executive | Application credit queue; document review |
| Operations | LOS stage queues; bank login panel |
| Admin | Full settings access; config editors |
| Management | Aggregated dashboards; no PII detail drill-down |
| Compliance | Audit log access; fraud flags |

## 14.4 CRM Density & Productivity

| Feature | Specification |
|---------|---------------|
| Keyboard shortcuts | `/` search; `G+L` leads; `G+A` applications |
| Bulk actions | Checkbox select; action bar appears |
| Inline edit | Double-click cell (where permitted) |
| Quick filters | Chip bar below table header |
| Copilot panel | Right drawer 360px; toggle with sparkles icon |

## 14.5 CRM Lead Grading UI (Document A3)

| Element | Treatment |
|---------|-------------|
| Grade badge | §2.4 colors; tooltip shows alias |
| Score gauge | Circular; #22D3A6 fill; 0–100 center text |
| Factor breakdown | Horizontal bar chart; weight label |
| SLA clock | Countdown; red pulse at < 15 min (A+) |

---

# 15. Accessibility (WCAG 2.1 AA)

## 15.1 Compliance Target

All KuberOne surfaces MUST meet **WCAG 2.1 Level AA**. AAA targeted for primary text pairings where feasible.

## 15.2 Perceivable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | Alt text for all meaningful images | aria-label on icons; alt on illustrations |
| 1.3.1 Info and Relationships | Semantic HTML | Proper heading hierarchy; table headers |
| 1.4.1 Use of Color | Color not sole indicator | Icons + text with status colors |
| 1.4.3 Contrast (Minimum) | 4.5:1 text; 3:1 large text | Verified in §2.7 |
| 1.4.4 Resize Text | 200% zoom without loss | Relative units (rem); no fixed px containers |
| 1.4.11 Non-text Contrast | 3:1 UI components | Focus rings, input borders verified |

## 15.3 Operable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.1.1 Keyboard | All functionality keyboard accessible | Tab order; focus visible |
| 2.4.3 Focus Order | Logical focus sequence | DOM order matches visual |
| 2.4.7 Focus Visible | Visible focus indicator | 2px #22D3A6 outline |
| 2.5.5 Target Size | 44×44px minimum | Applied to all interactive elements |

## 15.4 Understandable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.1.1 Language of Page | lang attribute | `lang="en"` or `lang="hi"` |
| 3.2.1 On Focus | No context change on focus | Dropdown opens on click, not focus |
| 3.3.1 Error Identification | Errors clearly described | Field-level error messages |
| 3.3.2 Labels or Instructions | All inputs labeled | Visible labels; aria-required |

## 15.5 Robust

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 4.1.2 Name, Role, Value | ARIA for custom components | Tested with screen readers |
| 4.1.3 Status Messages | aria-live for dynamic updates | Toast, SLA alerts, form errors |

## 15.6 Accessibility Testing Checklist

| Test | Tool / Method | Frequency |
|------|---------------|-----------|
| Automated scan | axe-core in CI | Every PR |
| Contrast verification | Stark / WebAIM | New color tokens |
| Screen reader | VoiceOver (iOS), TalkBack (Android), NVDA (CRM) | Major releases |
| Keyboard navigation | Manual | Every new screen |
| Reduced motion | prefers-reduced-motion | Every animation |

---

# 16. Component Inventory (Reference)

| Component | Variants | Primary Surface |
|-----------|----------|-----------------|
| Button | 6 variants × 4 sizes | All |
| Card | 5 variants | All |
| Input | Text, number, phone, OTP, currency | All |
| Select | Single, multi, searchable | CRM, forms |
| Table | Standard, compact, card-list | CRM |
| Badge | Grade, status, count | CRM, mobile |
| Toast | Success, error, warning, info | All |
| Modal | Standard, confirmation, form | All |
| Drawer | Left (nav), right (copilot) | CRM |
| BottomSheet | Action, filter, form | Mobile |
| Tabs | Underline, pill | All |
| Avatar | Image, initials, status dot | CRM |
| Skeleton | Text, card, table row | All |
| Gauge | Score, SLA, progress | CRM, mobile |
| EmptyState | Illustration + message + CTA | All |

---

# Appendix A: Design Token Reference (Complete)

| Category | Token Count | Source Section |
|----------|-------------|----------------|
| Colors | 28 | §2 |
| Typography | 10 scale tokens | §3 |
| Spacing | 11 | §4.1 |
| Radius | 5 | §4.3 |
| Shadows | 5 | §4.4 |
| Motion | 7 | §12 |

---

# Appendix B: CRM Screen Token Mapping

| Screen | Primary Tokens |
|--------|----------------|
| Lead List | color-card, grade colors, text-body |
| Lead Detail | color-primary, shadow-glow-primary (AI panel) |
| Application Pipeline | LOS stage colors |
| Dashboard | Chart palette, gauge tokens |
| Settings | form inputs, secondary buttons |

---

# Appendix C: Do's and Don'ts

| Do | Don't |
|----|-------|
| Use #22D3A6 sparingly for emphasis | Fill entire screens with primary color |
| Maintain dark luxury aesthetic | Use bright white backgrounds in dark mode |
| Show grade code + alias in CRM | Show only alias in system logs |
| Test contrast for every new color pair | Assume brand colors pass WCAG |
| Respect reduced motion | Auto-play animations |
| Use Inter consistently | Mix multiple font families |

---

# Appendix D: Cross-Document Traceability

| Topic | Document |
|-------|----------|
| Lead grade colors | Document A3 |
| CRM screen IDs | Screen Planning & IA |
| Mobile architecture | React Native Mobile Architecture |
| RBAC-adaptive UI | RBAC & Permissions |

---

*End of Document B1 — Design System Specification*
