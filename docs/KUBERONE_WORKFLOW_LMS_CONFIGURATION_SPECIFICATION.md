# KuberOne
## Workflow & LMS Configuration Specification (Document A4)

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Configuration Architecture — Workflow Engine & LMS Rules  
**Document ID:** A4  
**Classification:** Board-Ready | Engineering-Ready | Operations-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Authoritative — Resolves Enterprise Audit CONFLICT-05  
**Related Documents:**
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) — §19 Workflow Engine Configuration
- [KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md](./KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md) — §4.24, §5 Configuration Tables
- [KUBERONE_LEAD_GRADING_CANONICAL_SPECIFICATION.md](./KUBERONE_LEAD_GRADING_CANONICAL_SPECIFICATION.md) — Document A3 (scoring semantics)
- [KUBERONE_API_CATALOG_AND_OPENAPI_GOVERNANCE.md](./KUBERONE_API_CATALOG_AND_OPENAPI_GOVERNANCE.md) — API IDs
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) — Admin settings screens
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) — Physical schema
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) — Config change permissions

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Configuration-driven workflow architecture; 8 config tables; JSON schemas; admin screens; APIs; future product extensibility |
| **Audience** | Engineering, Product, Operations, Admin, DevOps, Compliance |
| **Principle** | **Configuration as first-class data** (Entity Registry R-10) — workflow, LMS, notification, and approval rules persist in dedicated versioned config tables, not unversioned JSON blobs in `system_settings` |
| **Management Path** | Admin Console → Settings → Workflow Config |

---

# Executive Summary

KuberOne's loan origination and lead management operations are driven by a **configuration-driven workflow engine** — not hard-coded product logic. Eight dedicated configuration tables define LOS stage sequences, per-stage SLAs, lead assignment rules, scoring weights, SLA targets, escalation routing, notification rules, and approval gates. This architecture enables **20+ product variants today** and **future products** (insurance, credit cards, mutual funds) without engine redesign.

**Configuration tables:**

| Table | Domain | Purpose |
|-------|--------|---------|
| `workflow_definitions` | LOS | Versioned workflow template per product variant |
| `workflow_stage_configs` | LOS | Per-stage SLA, docs, approval gates |
| `lms_assignment_rules` | LMS | Priority-ordered lead assignment |
| `lms_scoring_config` | LMS | Scoring weights, grade thresholds, gates |
| `lms_sla_rules` | LMS / LOS / Support | SLA master targets |
| `lms_escalation_rules` | LMS / Support | Breach and event escalation routing |
| `notification_rule_configs` | Communication | Event-driven multi-channel notifications |
| `approval_rule_configs` | Audit / LOS | Multi-level approval gates with SoD |

**Key design decisions:**

| Decision | Rationale |
|----------|-----------|
| Version on every change | Audit trail; rollback; no retroactive impact on in-flight applications |
| Effective dating | New config applies to new entities only (leads/apps created after `effective_from`) |
| JSON rule payloads | Flexible conditions without schema migration for every rule variant |
| Separation from `system_settings` | Global feature flags only in system_settings; business rules in dedicated tables |
| Admin-managed | Operations Head + Admin approval for workflow config changes |

This document provides exhaustive table definitions, JSON schema documentation examples, required CRM admin screens, API references, and extensibility patterns aligned with [Business Workflow §19](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) and [Entity Registry §5](./KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md).

---

# 1. Configuration Architecture Overview

## 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KUBERONE CONFIGURATION LAYER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                     │
│  │ workflow_definitions │───▶│ workflow_stage_configs │                 │
│  │ (per product variant)│    │ (S01–S09 overrides)  │                   │
│  └─────────────────────┘    └─────────────────────┘                     │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                     │
│  │ lms_assignment_rules │    │ lms_scoring_config   │                   │
│  │ (routing priority)   │    │ (weights, thresholds)│                   │
│  └─────────────────────┘    └─────────────────────┘                     │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                     │
│  │ lms_sla_rules        │───▶│ lms_escalation_rules │                  │
│  │ (SLA targets)        │    │ (breach routing)     │                  │
│  └─────────────────────┘    └─────────────────────┘                     │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────┐                     │
│  │ notification_rule_   │    │ approval_rule_configs│                  │
│  │ configs              │    │ (SoD approval gates) │                    │
│  └─────────────────────┘    └─────────────────────┘                     │
│                                                                          │
│  Consumed by: Workflow Engine · LMS Engine · SLA Monitor · Notification│
│               Service · Approval Service · CRM Admin · Analytics         │
│                                                                          │
│  Managed via: Admin Console → Settings → Workflow Config               │
│  APIs: API-SET-011–013 · API-LMS-004–006, 009 · API-SET-005–006        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Configuration Resolution Order

| Step | Resolver | Input | Output |
|------|----------|-------|--------|
| 1 | Product Variant Lookup | `product_variant_id` | Candidate workflow definitions |
| 2 | Effective Date Filter | `application.created_at` or `lead.created_at` | Active config version |
| 3 | Stage Config Merge | `workflow_definition` + `workflow_stage_configs` | Resolved stage SLA and gates |
| 4 | Branch Scope Filter | `branch_id`, `region_id` | Branch-specific assignment/SLA overrides |
| 5 | Cache Layer | Redis config cache (TTL 5 min) | Hot path performance |

## 1.3 Versioning Rules (WF §19.3)

| Rule | Detail |
|------|--------|
| Version increment | Every config change creates new version row |
| Effective date | `effective_from` required; `effective_to` null = current |
| In-flight protection | Changes apply to **new** leads/applications only |
| Audit | Who changed, when, old vs new JSON diff in `approval_logs` |
| Rollback | Admin reactivates previous version with new effective_from |
| Approval | Workflow config changes require Operations Head + Admin |

## 1.4 Relationship to system_settings

| Storage | Permitted Content |
|---------|-------------------|
| `system_settings` | Global feature flags, maintenance mode, AI provider keys (encrypted) |
| Config tables (§2) | All business workflow, LMS, SLA, notification, approval rules |
| **Prohibited** | Unversioned workflow JSON in system_settings (R-10 violation) |

---

# 2. Configuration Tables — Complete Specification

## 2.1 workflow_definitions

### 2.1.1 Purpose

Versioned workflow template defining the LOS stage sequence, approval gates, rework rules, and mandatory documents for each **product variant** (e.g., HL-01 Salaried, BL-01 Working Capital).

### 2.1.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `product_variant_id` | UUID | No | FK → product_variants |
| `workflow_code` | VARCHAR(32) | No | Unique code e.g. `WF-HL-01-v3` |
| `version` | INTEGER | No | Monotonic version per product variant |
| `effective_from` | TIMESTAMPTZ | No | Config activation timestamp |
| `effective_to` | TIMESTAMPTZ | Yes | Deactivation timestamp |
| `is_active` | BOOLEAN | No | Active flag (one active per variant at a time) |
| `stage_sequence` | JSONB | No | Ordered array of stage codes S01–S09 |
| `approval_gates` | JSONB | No | Stage → approval requirement map |
| `rework_rules` | JSONB | No | Stage transition rework definitions |
| `mandatory_document_codes` | JSONB | No | Document codes required for workflow |
| `metadata` | JSONB | Yes | Extension fields (product-specific) |
| `created_by` | UUID | No | FK → employees |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |
| `approved_by` | UUID | Yes | FK → employees (dual approval) |
| `approved_at` | TIMESTAMPTZ | Yes | Approval timestamp |

### 2.1.3 Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| Primary | `id` | PK |
| Unique | `(product_variant_id, version)` | Version integrity |
| Partial | `(product_variant_id, is_active) WHERE is_active = true` | Active workflow resolution |

### 2.1.4 JSON Schema — stage_sequence

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/workflow-stage-sequence/v1",
  "title": "WorkflowStageSequence",
  "type": "object",
  "required": ["stages"],
  "properties": {
    "stages": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["stageCode", "order"],
        "properties": {
          "stageCode": {
            "type": "string",
            "enum": ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09"]
          },
          "order": { "type": "integer", "minimum": 1 },
          "displayName": { "type": "string" },
          "isOptional": { "type": "boolean", "default": false },
          "skipCondition": {
            "type": "object",
            "properties": {
              "expression": { "type": "string", "description": "Rule expression e.g. eligibility.autoPass == true" }
            }
          }
        }
      }
    },
    "defaultEntryStage": { "type": "string", "default": "S01" },
    "terminalStages": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["S08", "S09"]
    }
  },
  "example": {
    "stages": [
      { "stageCode": "S01", "order": 1, "displayName": "Lead Created" },
      { "stageCode": "S02", "order": 2, "displayName": "Qualified" },
      { "stageCode": "S03", "order": 3, "displayName": "Document Collection" },
      { "stageCode": "S04", "order": 4, "displayName": "Eligibility Check" },
      { "stageCode": "S05", "order": 5, "displayName": "Bank Login" },
      { "stageCode": "S06", "order": 6, "displayName": "Credit Review" },
      { "stageCode": "S07", "order": 7, "displayName": "Sanction" },
      { "stageCode": "S08", "order": 8, "displayName": "Disbursement" },
      { "stageCode": "S09", "order": 9, "displayName": "Portfolio Handoff", "isOptional": true }
    ],
    "defaultEntryStage": "S01",
    "terminalStages": ["S08", "S09"]
  }
}
```

### 2.1.5 JSON Schema — approval_gates

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/workflow-approval-gates/v1",
  "title": "WorkflowApprovalGates",
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "required": ["requiredRoleCodes"],
    "properties": {
      "requiredRoleCodes": {
        "type": "array",
        "items": { "type": "string" },
        "minItems": 1
      },
      "minApprovers": { "type": "integer", "minimum": 1, "default": 1 },
      "approvalType": {
        "type": "string",
        "enum": ["SEQUENTIAL", "PARALLEL", "ANY_ONE"]
      },
      "escalationAfterHours": { "type": "number", "minimum": 0 },
      "sodRules": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "ruleCode": { "type": "string" },
            "cannotBeSameAs": { "type": "string" }
          }
        }
      }
    }
  },
  "example": {
    "S04": {
      "requiredRoleCodes": ["CREDIT_EXECUTIVE"],
      "minApprovers": 1,
      "approvalType": "SEQUENTIAL",
      "escalationAfterHours": 24
    },
    "S07": {
      "requiredRoleCodes": ["OPERATIONS_EXECUTIVE", "BRANCH_MANAGER"],
      "minApprovers": 1,
      "approvalType": "ANY_ONE",
      "escalationAfterHours": 48,
      "sodRules": [{ "ruleCode": "SoD-03", "cannotBeSameAs": "CREDIT_EXECUTIVE" }]
    }
  }
}
```

---

## 2.2 workflow_stage_configs

### 2.2.1 Purpose

Per-stage overrides within a workflow definition — SLA days, mandatory role, auto-transition rules, handler module assignment.

### 2.2.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `workflow_definition_id` | UUID | No | FK → workflow_definitions |
| `stage_code` | VARCHAR(8) | No | S01–S09 |
| `sla_days` | INTEGER | Yes | Target days in stage |
| `sla_business_days_only` | BOOLEAN | No | Default true |
| `mandatory_role_code` | VARCHAR(64) | Yes | Role required to advance stage |
| `auto_transition_rules` | JSONB | Yes | Conditions for automatic stage advance |
| `handler_module` | VARCHAR(64) | Yes | Backend module responsible |
| `is_skippable` | BOOLEAN | No | Default false |
| `metadata` | JSONB | Yes | Stage-specific extensions |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |

### 2.2.3 JSON Schema — auto_transition_rules

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/workflow-auto-transition/v1",
  "title": "AutoTransitionRules",
  "type": "object",
  "properties": {
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["condition", "targetStage"],
        "properties": {
          "condition": {
            "type": "object",
            "properties": {
              "allDocumentsVerified": { "type": "boolean" },
              "eligibilityStatus": { "type": "string", "enum": ["PASS", "FAIL", "EXCEPTION"] },
              "expression": { "type": "string" }
            }
          },
          "targetStage": { "type": "string" },
          "delayMinutes": { "type": "integer", "minimum": 0, "default": 0 },
          "notifyRoles": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  },
  "example": {
    "rules": [
      {
        "condition": { "allDocumentsVerified": true, "eligibilityStatus": "PASS" },
        "targetStage": "S05",
        "delayMinutes": 0,
        "notifyRoles": ["OPERATIONS_EXECUTIVE"]
      }
    ]
  }
}
```

### 2.2.4 Product Parameterization Example (WF §19.2)

| Parameter | HL-01 (Salaried) | BL-01 (WC) | AL-01 (New) |
|-----------|------------------|------------|-------------|
| S03 `sla_days` | 5 | 7 | 3 |
| S04 `mandatory_role_code` | CREDIT_EXECUTIVE | CREDIT_EXECUTIVE | null (auto) |
| S03 mandatory docs (ref) | PAN, Aadhaar, ITR, salary slips, property | PAN, Aadhaar, ITR, GST, bank stmt | PAN, Aadhaar, salary, quotation |
| FOIR max (metadata) | 55% | 50% (DSCR) | 50% |
| LTV max (metadata) | 80% | N/A | 85% |
| Min CIBIL (metadata) | 650 | 700 | 650 |

---

## 2.3 lms_assignment_rules

### 2.3.1 Purpose

Priority-ordered lead auto-assignment rule engine configuration, scoped by branch and optionally region.

### 2.3.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `name` | VARCHAR(128) | No | Rule set name |
| `version` | INTEGER | No | Version number |
| `branch_id` | UUID | Yes | FK → branches (null = org default) |
| `region_id` | UUID | Yes | FK → regions (optional override) |
| `rules` | JSONB | No | Priority-ordered assignment rules |
| `effective_from` | TIMESTAMPTZ | No | Activation date |
| `effective_to` | TIMESTAMPTZ | Yes | Deactivation date |
| `is_active` | BOOLEAN | No | Active flag |
| `created_by` | UUID | No | FK → employees |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |

### 2.3.3 JSON Schema — rules

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/lms-assignment-rules/v1",
  "title": "LmsAssignmentRules",
  "type": "object",
  "required": ["rules"],
  "properties": {
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["priority", "ruleCode", "condition", "assignTo"],
        "properties": {
          "priority": { "type": "integer", "minimum": 1 },
          "ruleCode": {
            "type": "string",
            "enum": [
              "PARTNER_AFFINITY",
              "EXISTING_RELATIONSHIP",
              "PRODUCT_SPECIALIST",
              "GRADE_PRIORITY",
              "GEOGRAPHIC",
              "LOAD_BALANCE",
              "CAMPAIGN_OVERRIDE"
            ]
          },
          "condition": {
            "type": "object",
            "properties": {
              "partnerIdPresent": { "type": "boolean" },
              "gradeIn": { "type": "array", "items": { "type": "string" } },
              "productCode": { "type": "string" },
              "pincode": { "type": "string" },
              "campaignId": { "type": "string" },
              "requiresCertification": { "type": "boolean" }
            }
          },
          "assignTo": {
            "type": "object",
            "required": ["type"],
            "properties": {
              "type": {
                "type": "string",
                "enum": ["MAPPED_EXECUTIVE", "ROLE", "EMPLOYEE", "POOL", "ROUND_ROBIN"]
              },
              "roleCode": { "type": "string" },
              "employeeId": { "type": "string", "format": "uuid" },
              "poolCode": { "type": "string" },
              "preferSenior": { "type": "boolean", "default": false }
            }
          },
          "slaSeconds": { "type": "integer", "description": "Max time before next rule tried" }
        }
      }
    },
    "fallbackPool": { "type": "string", "default": "BRANCH_UNASSIGNED" },
    "maxLeadsPerExecutive": { "type": "integer", "minimum": 1, "default": 50 }
  },
  "example": {
    "rules": [
      {
        "priority": 1,
        "ruleCode": "PARTNER_AFFINITY",
        "condition": { "partnerIdPresent": true },
        "assignTo": { "type": "MAPPED_EXECUTIVE" }
      },
      {
        "priority": 4,
        "ruleCode": "GRADE_PRIORITY",
        "condition": { "gradeIn": ["A+"] },
        "assignTo": { "type": "ROLE", "roleCode": "SENIOR_SALES_EXECUTIVE", "preferSenior": true },
        "slaSeconds": 60
      },
      {
        "priority": 6,
        "ruleCode": "LOAD_BALANCE",
        "condition": {},
        "assignTo": { "type": "ROUND_ROBIN", "poolCode": "BRANCH_SALES_POOL" }
      }
    ],
    "fallbackPool": "BRANCH_UNASSIGNED",
    "maxLeadsPerExecutive": 50
  }
}
```

---

## 2.4 lms_scoring_config

### 2.4.1 Purpose

Lead scoring factor weights, grade thresholds, AI weight, and gate rules. Aligns with [Document A3](./KUBERONE_LEAD_GRADING_CANONICAL_SPECIFICATION.md).

### 2.4.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `product_family_id` | UUID | Yes | FK → product_families (null = global default) |
| `version` | INTEGER | No | Version number |
| `factor_weights` | JSONB | No | 15 factor weights |
| `grade_thresholds` | JSONB | No | A+, A, B, C minimum scores |
| `ai_weight` | DECIMAL(3,2) | No | Default 0.30 |
| `rule_weight` | DECIMAL(3,2) | No | Default 0.70 |
| `gate_rules` | JSONB | No | Score cap and force-reject gates |
| `conversion_probability_defaults` | JSONB | Yes | Per-grade probability defaults |
| `effective_from` | TIMESTAMPTZ | No | Activation date |
| `effective_to` | TIMESTAMPTZ | Yes | Deactivation date |
| `is_active` | BOOLEAN | No | Active flag |
| `created_by` | UUID | No | FK → employees |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |

### 2.4.3 JSON Schema — factor_weights

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/lms-factor-weights/v1",
  "title": "LmsFactorWeights",
  "type": "object",
  "required": [
    "INCOME_ELIGIBILITY", "CIBIL_SCORE", "PRODUCT_NEED_MATCH",
    "TIMELINE_URGENCY", "DOCUMENT_READINESS", "COLLATERAL_IDENTIFIED",
    "DOWN_PAYMENT_READINESS", "EMPLOYMENT_STABILITY", "FOIR_HEADROOM",
    "LEAD_SOURCE_QUALITY", "ENGAGEMENT_LEVEL", "GEOGRAPHIC_ELIGIBILITY",
    "EXISTING_CUSTOMER", "CO_APPLICANT_AVAILABILITY", "PROFILE_COMPLETENESS"
  ],
  "properties": {
    "INCOME_ELIGIBILITY": { "type": "number", "minimum": 0, "maximum": 1 },
    "CIBIL_SCORE": { "type": "number", "minimum": 0, "maximum": 1 },
    "PRODUCT_NEED_MATCH": { "type": "number", "minimum": 0, "maximum": 1 },
    "TIMELINE_URGENCY": { "type": "number", "minimum": 0, "maximum": 1 },
    "DOCUMENT_READINESS": { "type": "number", "minimum": 0, "maximum": 1 },
    "COLLATERAL_IDENTIFIED": { "type": "number", "minimum": 0, "maximum": 1 },
    "DOWN_PAYMENT_READINESS": { "type": "number", "minimum": 0, "maximum": 1 },
    "EMPLOYMENT_STABILITY": { "type": "number", "minimum": 0, "maximum": 1 },
    "FOIR_HEADROOM": { "type": "number", "minimum": 0, "maximum": 1 },
    "LEAD_SOURCE_QUALITY": { "type": "number", "minimum": 0, "maximum": 1 },
    "ENGAGEMENT_LEVEL": { "type": "number", "minimum": 0, "maximum": 1 },
    "GEOGRAPHIC_ELIGIBILITY": { "type": "number", "minimum": 0, "maximum": 1 },
    "EXISTING_CUSTOMER": { "type": "number", "minimum": 0, "maximum": 1 },
    "CO_APPLICANT_AVAILABILITY": { "type": "number", "minimum": 0, "maximum": 1 },
    "PROFILE_COMPLETENESS": { "type": "number", "minimum": 0, "maximum": 1 },
    "excludedFactors": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Factors excluded for product family; weights redistributed"
    }
  },
  "example": {
    "INCOME_ELIGIBILITY": 0.15,
    "CIBIL_SCORE": 0.12,
    "PRODUCT_NEED_MATCH": 0.10,
    "TIMELINE_URGENCY": 0.10,
    "DOCUMENT_READINESS": 0.08,
    "COLLATERAL_IDENTIFIED": 0.10,
    "DOWN_PAYMENT_READINESS": 0.08,
    "EMPLOYMENT_STABILITY": 0.07,
    "FOIR_HEADROOM": 0.07,
    "LEAD_SOURCE_QUALITY": 0.05,
    "ENGAGEMENT_LEVEL": 0.05,
    "GEOGRAPHIC_ELIGIBILITY": 0.03,
    "EXISTING_CUSTOMER": 0.03,
    "CO_APPLICANT_AVAILABILITY": 0.03,
    "PROFILE_COMPLETENESS": 0.02
  }
}
```

### 2.4.4 JSON Schema — grade_thresholds and gate_rules

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/lms-grade-config/v1",
  "title": "LmsGradeConfig",
  "type": "object",
  "properties": {
    "grade_thresholds": {
      "type": "object",
      "required": ["A_PLUS", "A", "B", "C"],
      "properties": {
        "A_PLUS": { "type": "integer", "minimum": 0, "maximum": 100, "default": 85 },
        "A": { "type": "integer", "default": 70 },
        "B": { "type": "integer", "default": 50 },
        "C": { "type": "integer", "default": 30 }
      }
    },
    "grade_aliases": {
      "type": "object",
      "properties": {
        "A_PLUS": { "type": "string", "default": "Hot" },
        "A": { "type": "string", "default": "Warm" },
        "B": { "type": "string", "default": "Moderate" },
        "C": { "type": "string", "default": "Cold" },
        "REJECTED": { "type": "string", "default": "Rejected" }
      }
    },
    "ai_weight": { "type": "number", "default": 0.30 },
    "rule_weight": { "type": "number", "default": 0.70 },
    "gate_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["gateCode", "condition", "effect"],
        "properties": {
          "gateCode": { "type": "string" },
          "condition": { "type": "object" },
          "effect": {
            "type": "object",
            "properties": {
              "capScoreAt": { "type": "integer" },
              "forceGrade": { "type": "string" },
              "reasonCode": { "type": "string" }
            }
          }
        }
      }
    },
    "conversion_probability_defaults": {
      "type": "object",
      "properties": {
        "A_PLUS": { "type": "number", "default": 0.30 },
        "A": { "type": "number", "default": 0.18 },
        "B": { "type": "number", "default": 0.10 },
        "C": { "type": "number", "default": 0.04 },
        "REJECTED": { "type": "number", "default": 0.005 }
      }
    }
  },
  "example": {
    "grade_thresholds": { "A_PLUS": 85, "A": 70, "B": 50, "C": 30 },
    "grade_aliases": { "A_PLUS": "Hot", "A": "Warm", "B": "Moderate", "C": "Cold" },
    "ai_weight": 0.30,
    "rule_weight": 0.70,
    "gate_rules": [
      {
        "gateCode": "GATE_INCOME_FLOOR",
        "condition": { "incomePercentOfMinimum": { "lt": 50 } },
        "effect": { "capScoreAt": 29, "forceGrade": "REJECTED", "reasonCode": "R-01" }
      },
      {
        "gateCode": "GATE_FRAUD",
        "condition": { "fraudFlagActive": true },
        "effect": { "forceGrade": "REJECTED", "reasonCode": "R-06" }
      }
    ]
  }
}
```

---

## 2.5 lms_sla_rules

### 2.5.1 Purpose

SLA master targets by domain (LMS, LOS, SUPPORT, COMMISSION) — sourced from [Business Workflow Appendix B](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md).

### 2.5.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `domain` | ENUM | No | LMS, LOS, SUPPORT, COMMISSION |
| `sla_name` | VARCHAR(128) | No | Human-readable SLA name |
| `sla_code` | VARCHAR(64) | No | Machine code e.g. `LMS_A_PLUS_FIRST_CONTACT` |
| `target_value` | DECIMAL | No | Numeric target |
| `target_unit` | ENUM | No | MINUTES, HOURS, DAYS, PERCENT |
| `measurement_formula` | TEXT | Yes | How SLA is calculated |
| `grade_filter` | VARCHAR(8) | Yes | Optional grade scope (A+, A, etc.) |
| `stage_code` | VARCHAR(8) | Yes | Optional LOS stage scope |
| `workflow_stage_config_id` | UUID | Yes | FK → workflow_stage_configs |
| `effective_from` | TIMESTAMPTZ | No | Activation date |
| `effective_to` | TIMESTAMPTZ | Yes | Deactivation date |
| `is_active` | BOOLEAN | No | Active flag |

### 2.5.3 JSON Schema — measurement_formula

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/lms-sla-measurement/v1",
  "title": "SlaMeasurementFormula",
  "type": "object",
  "properties": {
    "startEvent": { "type": "string", "description": "e.g. lead.scored, application.stage_entered" },
    "endEvent": { "type": "string", "description": "e.g. lead.first_contact, application.stage_exited" },
    "businessHoursOnly": { "type": "boolean", "default": true },
    "businessHoursConfig": {
      "type": "object",
      "properties": {
        "timezone": { "type": "string", "default": "Asia/Kolkata" },
        "startHour": { "type": "integer", "default": 9 },
        "endHour": { "type": "integer", "default": 19 },
        "workingDays": {
          "type": "array",
          "items": { "type": "integer", "minimum": 0, "maximum": 6 },
          "default": [1, 2, 3, 4, 5, 6]
        }
      }
    },
    "pauseConditions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "condition": { "type": "string" },
          "reason": { "type": "string" }
        }
      }
    }
  },
  "example": {
    "startEvent": "lead.scored",
    "endEvent": "lead.first_contact",
    "businessHoursOnly": false,
    "businessHoursConfig": {
      "timezone": "Asia/Kolkata",
      "startHour": 0,
      "endHour": 24,
      "workingDays": [0, 1, 2, 3, 4, 5, 6]
    }
  }
}
```

### 2.5.4 Canonical SLA Seed Data (Appendix B)

| Domain | sla_code | Target | Unit |
|--------|----------|--------|------|
| LMS | LMS_A_PLUS_FIRST_CONTACT | 1 | HOURS |
| LMS | LMS_A_FIRST_CONTACT | 4 | HOURS |
| LMS | LMS_B_FIRST_CONTACT | 24 | HOURS |
| LMS | LMS_C_FIRST_CONTACT | 48 | HOURS |
| LMS | LMS_AUTO_ASSIGN | 1 | MINUTES |
| LOS | LOS_S01_TO_S02 | 48 | HOURS |
| LOS | LOS_S03_DOC_COLLECTION | 7 | DAYS |
| LOS | LOS_S06_LENDER_REVIEW | 15 | DAYS |
| SUPPORT | SUP_P1_FIRST_RESPONSE | 1 | HOURS |
| COMMISSION | COM_DISPUTE_RESOLUTION | 10 | DAYS |

---

## 2.6 lms_escalation_rules

### 2.6.1 Purpose

SLA breach and event-triggered escalation routing to roles and employees.

### 2.6.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `sla_rule_id` | UUID | Yes | FK → lms_sla_rules |
| `trigger_event` | VARCHAR(64) | No | e.g. `SLA_BREACH`, `FRAUD_FLAG`, `VIP_LEAD` |
| `trigger_condition` | JSONB | Yes | Additional conditions |
| `escalation_level` | INTEGER | No | 1 = first escalation |
| `escalate_to_role` | VARCHAR(64) | Yes | Target role code |
| `escalate_to_employee_id` | UUID | Yes | Specific employee override |
| `notify_channels` | JSONB | No | PUSH, SMS, EMAIL, CRM_ALERT |
| `cooldown_minutes` | INTEGER | No | Min time between repeat escalations |
| `is_active` | BOOLEAN | No | Active flag |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |

### 2.6.3 JSON Schema — notify_channels and trigger_condition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/lms-escalation-rule/v1",
  "title": "LmsEscalationRule",
  "type": "object",
  "required": ["triggerEvent", "escalationLevel", "notifyChannels"],
  "properties": {
    "triggerEvent": {
      "type": "string",
      "enum": [
        "SLA_BREACH",
        "SLA_WARNING_80PCT",
        "UNASSIGNED_TIMEOUT",
        "FRAUD_FLAG",
        "VIP_LEAD",
        "GRADE_OVERRIDE",
        "MANUAL_ESCALATION"
      ]
    },
    "triggerCondition": {
      "type": "object",
      "properties": {
        "gradeIn": { "type": "array", "items": { "type": "string" } },
        "slaCode": { "type": "string" },
        "breachDurationMinutes": { "type": "integer" },
        "amountGreaterThan": { "type": "number" },
        "domain": { "type": "string" }
      }
    },
    "escalationLevel": { "type": "integer", "minimum": 1, "maximum": 5 },
    "escalateToRole": { "type": "string" },
    "escalateToEmployeeId": { "type": "string", "format": "uuid" },
    "notifyChannels": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["PUSH", "SMS", "EMAIL", "CRM_ALERT", "PHONE"]
      },
      "minItems": 1
    },
    "cooldownMinutes": { "type": "integer", "default": 60 },
    "includeDataPackage": { "type": "boolean", "default": true }
  },
  "example": {
    "triggerEvent": "SLA_BREACH",
    "triggerCondition": {
      "gradeIn": ["A+"],
      "slaCode": "LMS_A_PLUS_FIRST_CONTACT",
      "breachDurationMinutes": 60
    },
    "escalationLevel": 1,
    "escalateToRole": "BRANCH_MANAGER",
    "notifyChannels": ["PUSH", "SMS"],
    "cooldownMinutes": 30,
    "includeDataPackage": true
  }
}
```

---

## 2.7 notification_rule_configs

### 2.7.1 Purpose

Event-driven notification routing replacing ad-hoc notification_settings for new events. Complements legacy `notification_settings` for backward compatibility.

### 2.7.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `event_code` | VARCHAR(64) | No | e.g. `LEAD_SCORED_A_PLUS`, `SLA_BREACH` |
| `channels` | JSONB | No | Enabled channels per event |
| `template_codes` | JSONB | No | Template ID per channel |
| `delay_minutes` | INTEGER | No | Default 0 |
| `conditions` | JSONB | Yes | Conditional send rules |
| `audience_type` | ENUM | No | ASSIGNEE, ROLE, CUSTOMER, PARTNER, MANAGEMENT |
| `audience_config` | JSONB | Yes | Role codes, specific IDs |
| `is_enabled` | BOOLEAN | No | Enable flag |
| `version` | INTEGER | No | Version number |
| `effective_from` | TIMESTAMPTZ | No | Activation date |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |

### 2.7.3 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/notification-rule-config/v1",
  "title": "NotificationRuleConfig",
  "type": "object",
  "required": ["eventCode", "channels", "templateCodes", "audienceType"],
  "properties": {
    "eventCode": {
      "type": "string",
      "enum": [
        "LEAD_CREATED",
        "LEAD_SCORED_A_PLUS",
        "LEAD_SCORED_A",
        "LEAD_ASSIGNED",
        "SLA_WARNING",
        "SLA_BREACH",
        "APPLICATION_STAGE_CHANGED",
        "DOCUMENT_DEFICIENCY",
        "COMMISSION_APPROVED",
        "ESCALATION_CREATED"
      ]
    },
    "channels": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["PUSH", "SMS", "EMAIL", "WHATSAPP", "IN_APP"]
      }
    },
    "templateCodes": {
      "type": "object",
      "additionalProperties": { "type": "string" },
      "description": "Channel → template code mapping"
    },
    "delayMinutes": { "type": "integer", "minimum": 0, "default": 0 },
    "conditions": {
      "type": "object",
      "properties": {
        "gradeIn": { "type": "array", "items": { "type": "string" } },
        "businessHoursOnly": { "type": "boolean" },
        "channelPreferenceRespected": { "type": "boolean", "default": true }
      }
    },
    "audienceType": {
      "type": "string",
      "enum": ["ASSIGNEE", "ROLE", "CUSTOMER", "PARTNER", "MANAGEMENT"]
    },
    "audienceConfig": {
      "type": "object",
      "properties": {
        "roleCodes": { "type": "array", "items": { "type": "string" } },
        "includeAssignee": { "type": "boolean", "default": true }
      }
    },
    "priority": { "type": "string", "enum": ["P1", "P2", "P3", "P4"] }
  },
  "example": {
    "eventCode": "LEAD_SCORED_A_PLUS",
    "channels": ["PUSH", "SMS"],
    "templateCodes": {
      "PUSH": "TPL-LMS-APLUS-ASSIGN-01",
      "SMS": "TPL-SMS-APLUS-01"
    },
    "delayMinutes": 0,
    "conditions": { "businessHoursOnly": false },
    "audienceType": "ASSIGNEE",
    "audienceConfig": { "includeAssignee": true },
    "priority": "P1"
  }
}
```

---

## 2.8 approval_rule_configs

### 2.8.1 Purpose

Configurable approval gates with Segregation of Duties (SoD) enforcement for commissions, credit exceptions, and workflow stage transitions.

### 2.8.2 Column Specification

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `entity_type` | VARCHAR(64) | No | APPLICATION, COMMISSION, WORKFLOW_CONFIG, PARTNER |
| `stage_code` | VARCHAR(8) | Yes | LOS stage if applicable |
| `approval_type` | VARCHAR(32) | No | SEQUENTIAL, PARALLEL, ANY_ONE |
| `required_role_codes` | JSONB | No | Roles that may approve |
| `min_approvers` | INTEGER | No | Minimum approver count |
| `sod_rules` | JSONB | Yes | Segregation of duties constraints |
| `escalation_after_hours` | INTEGER | Yes | Auto-escalation timeout |
| `amount_thresholds` | JSONB | Yes | Tiered approval by amount |
| `version` | INTEGER | No | Version number |
| `effective_from` | TIMESTAMPTZ | No | Activation date |
| `effective_to` | TIMESTAMPTZ | Yes | Deactivation date |
| `is_active` | BOOLEAN | No | Active flag |
| `created_by` | UUID | No | FK → employees |

### 2.8.3 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "kuberone://schemas/approval-rule-config/v1",
  "title": "ApprovalRuleConfig",
  "type": "object",
  "required": ["entityType", "approvalType", "requiredRoleCodes", "minApprovers"],
  "properties": {
    "entityType": {
      "type": "string",
      "enum": ["APPLICATION", "COMMISSION", "WORKFLOW_CONFIG", "PARTNER", "CREDIT_EXCEPTION"]
    },
    "stageCode": { "type": "string" },
    "approvalType": {
      "type": "string",
      "enum": ["SEQUENTIAL", "PARALLEL", "ANY_ONE"]
    },
    "requiredRoleCodes": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "minApprovers": { "type": "integer", "minimum": 1 },
    "sodRules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["ruleCode", "description"],
        "properties": {
          "ruleCode": { "type": "string" },
          "description": { "type": "string" },
          "submitterCannotApprove": { "type": "boolean", "default": true },
          "excludedRolePairs": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "roleA": { "type": "string" },
                "roleB": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "escalationAfterHours": { "type": "integer" },
    "amountThresholds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "minAmount": { "type": "number" },
          "maxAmount": { "type": "number" },
          "additionalRoles": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  },
  "example": {
    "entityType": "COMMISSION",
    "approvalType": "SEQUENTIAL",
    "requiredRoleCodes": ["FINANCE_HEAD"],
    "minApprovers": 1,
    "sodRules": [
      {
        "ruleCode": "SoD-04",
        "description": "Commission submitter cannot approve own batch",
        "submitterCannotApprove": true
      }
    ],
    "escalationAfterHours": 48,
    "amountThresholds": [
      { "minAmount": 0, "maxAmount": 100000, "additionalRoles": [] },
      { "minAmount": 100001, "maxAmount": null, "additionalRoles": ["MANAGEMENT"] }
    ]
  }
}
```

---

# 3. Admin Screens Required (CRM Settings)

All screens live under **Admin Console → Settings → Workflow Config** per [CRM Admin Panel Architecture](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md).

## 3.1 Screen Inventory

| Screen ID | Name | Path | Primary Role | Config Table(s) |
|-----------|------|------|--------------|-----------------|
| CRM-SET-WF-01 | Workflow Definitions List | `/admin/settings/workflows` | Admin | workflow_definitions |
| CRM-SET-WF-02 | Workflow Definition Editor | `/admin/settings/workflows/{id}` | Admin | workflow_definitions, workflow_stage_configs |
| CRM-SET-WF-03 | Stage Config Panel | `/admin/settings/workflows/{id}/stages` | Admin | workflow_stage_configs |
| CRM-SET-LMS-01 | Lead Assignment Rules | `/admin/settings/lms/assignment` | Admin | lms_assignment_rules |
| CRM-SET-LMS-02 | Lead Scoring Config | `/admin/settings/lms/scoring` | Admin | lms_scoring_config |
| CRM-SET-LMS-03 | SLA Rules Master | `/admin/settings/lms/sla` | Admin | lms_sla_rules |
| CRM-SET-LMS-04 | Escalation Rules | `/admin/settings/lms/escalations` | Admin | lms_escalation_rules |
| CRM-SET-NTF-01 | Notification Rules | `/admin/settings/notifications/rules` | Admin | notification_rule_configs |
| CRM-SET-APR-01 | Approval Gates | `/admin/settings/approvals` | Admin | approval_rule_configs |
| CRM-SET-WF-04 | Config Version History | `/admin/settings/workflows/history` | Admin, Compliance | All config tables |
| CRM-SET-WF-05 | Config Diff Viewer | `/admin/settings/workflows/diff` | Admin, Operations Head | All config tables |

## 3.2 Screen Functional Requirements

### CRM-SET-WF-02 — Workflow Definition Editor

| Feature | Requirement |
|---------|-------------|
| Product variant selector | Dropdown of active product variants |
| Stage sequence builder | Drag-and-drop S01–S09 ordering |
| Approval gate mapper | Per-stage role assignment |
| Mandatory docs checklist | Multi-select from document_rules catalog |
| Version preview | Show impact: new apps only |
| Submit for approval | Dual approval workflow (Operations Head + Admin) |
| Validation | JSON schema validation before save |

### CRM-SET-LMS-02 — Lead Scoring Config

| Feature | Requirement |
|---------|-------------|
| Factor weight sliders | 15 factors; sum must equal 100% |
| AI weight slider | 0–50%; rule weight auto-calculated |
| Grade threshold inputs | A+, A, B, C minimum scores |
| Alias display preview | Hot/Warm/Moderate/Cold preview |
| Gate rule editor | Add/edit/remove gates with reason codes |
| Product family scope | Global vs per-family override |
| Test scoring | Sandbox lead ID → preview grade |

### CRM-SET-LMS-01 — Lead Assignment Rules

| Feature | Requirement |
|---------|-------------|
| Priority-ordered rule list | Drag to reorder |
| Branch/region scope | Branch-specific overrides |
| Condition builder | Visual condition editor |
| Assign-to selector | Role, employee, pool, round-robin |
| Grade filter | A+ priority rule highlight |
| Simulation | Preview assignment for sample lead |

## 3.3 RBAC for Admin Screens

| Permission | Roles |
|------------|-------|
| `settings.view:all` | Admin, Super Admin, Operations Head (read) |
| `settings.configure:all` | Admin, Super Admin |
| `leads.configure:all` | Admin (LMS scoring, assignment) |
| `workflows.approve:all` | Operations Head |
| `settings.audit:all` | Compliance (read-only history) |

---

# 4. APIs Required

## 4.1 Workflow Configuration APIs

| API ID | Method | Path | Purpose | Permission |
|--------|--------|------|---------|------------|
| API-SET-011 | GET | /admin/workflows | List workflow definitions | `settings.view:all` |
| API-SET-012 | PUT | /admin/workflows/{id} | Update workflow definition (new version) | `settings.configure:all` |
| API-SET-013 | POST | /admin/workflows | Create new workflow definition | `settings.configure:all` |

## 4.2 LMS Configuration APIs

| API ID | Method | Path | Purpose | Permission |
|--------|--------|------|---------|------------|
| API-LMS-004 | GET | /crm/lms/assignment-rules | Get active assignment rules | `leads.view:branch` |
| API-LMS-005 | PUT | /crm/lms/assignment-rules | Update assignment rules (new version) | `leads.configure:all` |
| API-LMS-006 | GET | /crm/lms/scoring-config | Get active scoring config | `leads.view:branch` |
| API-LMS-009 | PUT | /crm/lms/scoring-config | Update scoring config (new version) | `leads.configure:all` |

## 4.3 SLA & Escalation APIs (Phase 1 — Admin Extension)

| API ID | Method | Path | Purpose | Permission |
|--------|--------|------|---------|------------|
| API-LMS-003 | GET | /crm/lms/sla | SLA compliance dashboard data | `leads.view:branch` |
| API-SET-014* | GET | /admin/settings/sla-rules | List SLA rules | `settings.view:all` |
| API-SET-015* | PUT | /admin/settings/sla-rules | Update SLA rules | `settings.configure:all` |
| API-SET-016* | GET | /admin/settings/escalation-rules | List escalation rules | `settings.view:all` |
| API-SET-017* | PUT | /admin/settings/escalation-rules | Update escalation rules | `settings.configure:all` |

*Proposed API IDs for Phase 1 extension; register in API Catalog on implementation.*

## 4.4 Notification & Approval APIs

| API ID | Method | Path | Purpose | Permission |
|--------|--------|------|---------|------------|
| API-SET-005 | GET | /admin/settings/notifications | Get notification settings | `settings.view:all` |
| API-SET-006 | PATCH | /admin/settings/notifications | Update notification settings | `settings.configure:all` |
| API-SET-018* | GET | /admin/settings/notification-rules | List notification_rule_configs | `settings.view:all` |
| API-SET-019* | PUT | /admin/settings/notification-rules | Update notification rules | `settings.configure:all` |
| API-SET-020* | GET | /admin/settings/approval-rules | List approval_rule_configs | `settings.view:all` |
| API-SET-021* | PUT | /admin/settings/approval-rules | Update approval rules | `settings.configure:all` |
| API-AUD-005 | GET | /compliance/approval-logs | Approval audit trail | `audit.view:all` |

## 4.5 Runtime Consumption APIs (Engines)

| Consumer | Config Read | Cache TTL |
|----------|-------------|-----------|
| Workflow Engine | workflow_definitions + workflow_stage_configs | 5 min |
| LMS Scoring Engine | lms_scoring_config | 5 min |
| Assignment Engine | lms_assignment_rules | 5 min |
| SLA Monitor | lms_sla_rules + lms_escalation_rules | 1 min |
| Notification Service | notification_rule_configs | 5 min |
| Approval Service | approval_rule_configs | 5 min |

---

# 5. Configuration Change Workflow

## 5.1 Change Request Process

| Step | Actor | Action |
|------|-------|--------|
| 1 | Admin | Draft config change in CRM-SET editor |
| 2 | System | Validate JSON schema; run impact preview |
| 3 | Admin | Submit for approval |
| 4 | Operations Head | Review; approve or reject |
| 5 | System | Create new version row; set effective_from |
| 6 | System | Invalidate config cache |
| 7 | System | Log diff in approval_logs |
| 8 | System | Notify stakeholders (notification_rule_configs) |

## 5.2 Emergency Override

| Condition | Process |
|-----------|---------|
| Production SLA failure due to config | Super Admin hotfix with 4-hour retroactive review |
| Fraud rule gap | Compliance Manager + Super Admin immediate gate addition |
| Rollback | Reactivate previous version; new effective_from = now |

---

# 6. Future Extensibility

## 6.1 Extension Principle (WF §22.1)

New products (insurance, credit cards, mutual funds, FD, gold loan, wealth) **do not require workflow engine redesign**. Each product adds:

1. New `workflow_definitions` entry (may simplify stages)
2. New `workflow_stage_configs` rows
3. New document checklist template reference
4. New eligibility rules (existing table)
5. New commission rules (existing table)
6. Optional product-family `lms_scoring_config` override
7. New CRM screens per Screen Planning

## 6.2 Future Product Workflow Summary

| Product | workflow_code Prefix | Stages | Differs From Loan LOS |
|---------|---------------------|--------|----------------------|
| Insurance | INS-S01 to INS-S06 | 6 | Premium, not disbursement |
| Credit Card | CC-S01 to CC-S03 | 3 | Simplified 3-stage flow |
| Mutual Funds | MF-O01 to MF-O04 | 4 | Order flow, not LOS |
| Fixed Deposit | FD-B01 to FD-B03 | 3 | Rate lock, booking |
| Gold Loan | GL-S01 to GL-S10 | 10 | Extra valuation stage |
| Wealth Advisory | WM-A01 to WM-A05 | 5 | Portfolio, not loan |
| Video KYC | VKYC-01 to VKYC-03 | 3 | Sub-flow plugs into S03 |
| eSign | ESIGN-01 to ESIGN-02 | 2 | Sub-flow plugs into S07 |

## 6.3 Extension Patterns

| Pattern | Implementation |
|---------|----------------|
| Sub-flow embedding | `metadata.subFlowCode` in workflow_stage_configs |
| Simplified stage sequence | Omit S05–S06 for credit card instant decision |
| Cross-product assignment | lms_assignment_rules condition on `productFamily` |
| Product-specific gates | lms_scoring_config scoped by product_family_id |
| Regulatory approval gate | approval_rule_configs per entity_type |

## 6.4 Schema Evolution Strategy

| Change Type | Approach |
|-------------|----------|
| New JSON field | Add to schema; backward compatible default |
| New stage code | Extend enum; workflow engine plugin registration |
| New assignment rule code | Add to ruleCode enum; engine handler map |
| Breaking change | New config version; migration script for templates |

---

# 7. Operational Monitoring

## 7.1 Config Health Metrics

| Metric | Alert Threshold |
|--------|-----------------|
| Active config missing for product variant | Any variant without active workflow |
| Config cache miss rate | > 5% |
| Config validation failure on save | Any failure |
| Stale config (effective_to passed, is_active true) | Any occurrence |
| Assignment rule with zero matching leads (30 days) | Review required |

## 7.2 Audit & Compliance

| Requirement | Implementation |
|-------------|----------------|
| Config change audit | approval_logs + created_by on all tables |
| SoD on config change | Submitter ≠ sole approver |
| Compliance read access | CRM-SET-WF-04 read-only for Compliance role |
| Retention | Config versions retained 10 years |

---

# Appendix A: Entity Relationship Diagram (Configuration Layer)

```
product_variants ──1:N──▶ workflow_definitions ──1:N──▶ workflow_stage_configs
                                                              │
lms_sla_rules ──1:N──▶ lms_escalation_rules                    │
                                                              │
lms_scoring_config (standalone, optional product_family scope) │
lms_assignment_rules (standalone, branch/region scope)       │
notification_rule_configs (standalone)                         │
approval_rule_configs (standalone)                             │
```

---

# Appendix B: Config Table Quick Reference

| Table | Primary Key | Scope | Versioned | API |
|-------|-------------|-------|-----------|-----|
| workflow_definitions | id | product_variant | Yes | API-SET-011–013 |
| workflow_stage_configs | id | workflow_definition | Yes (via parent) | API-SET-012 |
| lms_assignment_rules | id | branch/region | Yes | API-LMS-004–005 |
| lms_scoring_config | id | product_family/global | Yes | API-LMS-006, 009 |
| lms_sla_rules | id | domain | Yes | API-SET-014* |
| lms_escalation_rules | id | sla_rule | Yes | API-SET-016* |
| notification_rule_configs | id | event | Yes | API-SET-018* |
| approval_rule_configs | id | entity_type/stage | Yes | API-SET-020* |

---

# Appendix C: JSON Schema Index

| Schema ID | Config Element |
|-----------|----------------|
| kuberone://schemas/workflow-stage-sequence/v1 | workflow_definitions.stage_sequence |
| kuberone://schemas/workflow-approval-gates/v1 | workflow_definitions.approval_gates |
| kuberone://schemas/workflow-auto-transition/v1 | workflow_stage_configs.auto_transition_rules |
| kuberone://schemas/lms-assignment-rules/v1 | lms_assignment_rules.rules |
| kuberone://schemas/lms-factor-weights/v1 | lms_scoring_config.factor_weights |
| kuberone://schemas/lms-grade-config/v1 | lms_scoring_config composite |
| kuberone://schemas/lms-sla-measurement/v1 | lms_sla_rules.measurement_formula |
| kuberone://schemas/lms-escalation-rule/v1 | lms_escalation_rules composite |
| kuberone://schemas/notification-rule-config/v1 | notification_rule_configs composite |
| kuberone://schemas/approval-rule-config/v1 | approval_rule_configs composite |

---

# Appendix D: Cross-Document Traceability

| Topic | Authoritative Doc | Section |
|-------|-------------------|---------|
| Config architecture | Business Workflow | §19 |
| Table definitions | Entity Registry | §4.24, §5 |
| Scoring semantics | Document A3 | §2–6 |
| Admin screens | CRM Admin Panel | §Settings |
| API IDs | API Catalog | SET, LMS |
| RBAC permissions | RBAC & Permissions | settings.*, leads.configure |
| Future products | Business Workflow | §22 |

---

# Appendix E: Glossary

| Term | Definition |
|------|------------|
| **Workflow Definition** | Versioned template for a product variant's LOS stages |
| **Stage Config** | Per-stage SLA and handler overrides |
| **Effective Dating** | Config applies only to entities created after effective_from |
| **Gate Rule** | Scoring or transition precondition |
| **SoD** | Segregation of Duties — submitter cannot approve own action |
| **Config Cache** | Redis layer for hot-path config reads |

---

*End of Document A4 — Workflow & LMS Configuration Specification*
