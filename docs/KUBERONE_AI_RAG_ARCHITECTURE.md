# KuberOne
## AI + RAG Architecture Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise AI & RAG Architecture (AIA)  
**Classification:** OpenAI Ready | RAG Ready | Voice AI Ready | Developer Ready | Production Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**AI Stack:** OpenAI GPT · RAG · Vector Storage · Knowledge Base · Prompt Engineering · AI Analytics · Voice AI  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne AI Platform — Intelligent Financial Services Layer |
| **Scope** | Complete AI architecture — Advisor, Copilot, Voice, RAG, Knowledge, Analytics, Governance |
| **Audience** | AI Engineers, Backend, Mobile, CRM, Product, Compliance, Board |
| **Status** | Authoritative AI Master Guide |
| **Out of Scope** | Source code, API implementations, prompt source files, model weights |

---

## Architecture Statistics

| Metric | Count |
|--------|-------|
| **AI products** | 6 (Advisor, Copilot, Voice, Knowledge AI, Support AI, Management AI) |
| **Future AI agents** | 6 |
| **Languages** | 3 (English, Hindi, Hinglish) |
| **Loan product families** | 4 (20 variants) |
| **Lead grades** | 5 (A+, A, B, C, Rejected) |
| **RAG source categories** | 7 |
| **Prompt template families** | 6 |
| **Escalation targets** | 4 |
| **Development phases** | 5 |
| **OCR document types** | 12+ |

---

# 30. EXECUTIVE SUMMARY

*Board-level AI architecture summary — presented first.*

## Strategic AI Position

KuberOne AI is not a chatbot bolt-on — it is a **dedicated intelligence layer** powering every customer touchpoint, sales workflow, and management decision across the Kuber Finserve ecosystem. Built on **OpenAI GPT-4o**, **Retrieval-Augmented Generation (RAG)** over lender and product policies, and a **multi-agent architecture** (Advisor, Copilot, Voice), AI is the **primary competitive differentiator** for KuberOne in India's crowded loan distribution market.

## AI Product Portfolio

| Product | Agent Name | Users | Core Value |
|---------|------------|-------|------------|
| **AI Loan Advisor** | KuberOne AI Advisor | Customers | 24/7 loan guidance in English/Hindi/Hinglish |
| **AI Sales Copilot** | KuberOne Copilot | Sales, Branch Mgr | Lead score, NBA, approval prediction |
| **AI Voice Assistant** | KuberOne Voice | Customers | Hands-free loan inquiry and booking |
| **Knowledge AI** | — (RAG backbone) | All AI products | Accurate policy-grounded responses |
| **Support AI** | KuberOne Support AI | Customers, Support | FAQ, status, escalation |
| **Management AI** | KuberOne Insights | Leadership | Revenue, conversion, forecast insights |

## Business Impact

| Dimension | Expected Impact |
|-----------|-----------------|
| **Revenue** | 15–20% higher conversion via AI-guided eligibility + product match |
| **Cost** | 30% reduction in support tickets via self-service AI |
| **Speed** | 40% faster lead qualification with AI scoring |
| **Quality** | 15% lower rejection rate via pre-qualification |
| **Partner productivity** | DSA lead quality improved via AI pre-screening |
| **Management** | Real-time AI-generated business insights |

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **OpenAI API (not self-hosted)** | No GPU infra; pay-per-use; best-in-class reasoning |
| **RAG over fine-tuning** | Knowledge changes frequently (lender policies); RAG is updatable |
| **Phase 1 vector store: MySQL + embedding cache** | Simplicity; sufficient for <100K chunks |
| **Phase 2 vector store: pgvector or Qdrant** | Scale to 1M+ chunks; hybrid search |
| **Human-in-the-loop** | AI advises; humans decide on credit, sanction, disbursement |
| **Structured output** | Copilot uses JSON schema for scores, predictions, NBAs |
| **Multi-language** | English + Hindi + Hinglish for Tier 2/3 India reach |

## Development Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| **1** | AI Advisor + RAG foundation | Weeks 1–6 |
| **2** | Lead scoring + qualification AI | Weeks 7–9 |
| **3** | Sales Copilot | Weeks 10–13 |
| **4** | Voice AI | Weeks 14–17 |
| **5** | Management AI + analytics | Weeks 18–20 |

**Board Recommendation:** Approve this AI + RAG Architecture as the master blueprint for all KuberOne AI investment. AI is a **core platform capability**, not a feature — budget accordingly for OpenAI API costs, knowledge curation, and ongoing governance.

---

# 1. AI VISION

## 1.1 Business Goals

| # | Goal | Success Metric | AI Enabler |
|---|------|----------------|------------|
| 1 | **Increase loan conversion** | +15% application completion | AI Advisor guides customers to right product |
| 2 | **Reduce rejection rate** | -15% credit rejections | Pre-eligibility AI before submission |
| 3 | **Accelerate sales cycle** | -25% lead-to-disbursement TAT | Copilot NBA + lead scoring |
| 4 | **Lower support cost** | -30% ticket volume | Support AI handles FAQs and status |
| 5 | **Improve partner quality** | +20% DSA lead conversion | AI pre-qualification on DSA leads |
| 6 | **Enable data-driven leadership** | Weekly AI insights to CEO | Management AI dashboards |
| 7 | **Differentiate brand** | #1 AI-powered loan app (marketing) | Voice + multilingual advisor |
| 8 | **Regulatory confidence** | Zero AI-caused compliance incidents | Governance + human-in-the-loop |

## 1.2 Customer Goals

| Goal | AI Capability |
|------|---------------|
| Understand which loan is right for me | Product recommendation AI |
| Know if I'm eligible before applying | Eligibility AI |
| Get help in my language | English, Hindi, Hinglish |
| Know what documents I need | Document guidance AI |
| Track my application via conversation | Status query AI |
| Get human help when needed | Escalation to sales/support |
| Calculate EMI and compare loans | EMI assistance in conversation |
| Voice interaction while driving/busy | Voice AI assistant |

## 1.3 Sales Goals

| Goal | AI Capability |
|------|---------------|
| Prioritize best leads | Lead scoring (A+ to Rejected) |
| Know approval likelihood | Approval probability prediction |
| Know what to do next | Next Best Action (NBA) |
| Identify missing documents instantly | Document deficiency AI |
| Get lender recommendation | Lender matching AI |
| Reduce manual research | RAG-powered policy lookup |
| Follow up at right time | Follow-up suggestion engine |

## 1.4 Operational Goals

| Goal | AI Capability |
|------|---------------|
| Faster document processing | OCR AI (PAN, Aadhaar, bank statements) |
| Auto-classify uploaded documents | Document classification AI |
| Reduce manual eligibility checks | Eligibility engine + AI explanation |
| Consistent policy answers | RAG over lender policies |
| Credit analyst assistance | Credit analysis AI (FOIR, LTV, DSCR) |
| Compliance-safe responses | Compliance prompts + guard rails |

## 1.5 Automation Goals

| Automation | Phase | Trigger |
|------------|-------|---------|
| Lead auto-scoring | Phase 2 | Lead created/updated |
| Document auto-classification | Phase 2 | Document uploaded |
| OCR field extraction | Phase 2 | Document confirmed |
| Deficiency auto-detection | Phase 2 | Stage change |
| Copilot insights | Phase 3 | Lead/application opened |
| Follow-up reminders | Phase 3 | NBA engine |
| Support auto-response | Phase 3 | FAQ match > 0.9 similarity |
| Management weekly digest | Phase 5 | Scheduled |

## 1.6 Future Expansion Goals

| Expansion | AI Agent | Timeline |
|-----------|----------|----------|
| Insurance advisory | Insurance Advisor | Year 2 |
| Credit card recommendations | Credit Card Advisor | Year 2 |
| Mutual fund guidance | Investment Advisor | Year 2 |
| Wealth portfolio analysis | Wealth Advisor | Year 3 |
| Collection reminders | Collection Assistant | Year 2 |
| Loan renewal outreach | Renewal Assistant | Year 2 |
| Video KYC assistance | KYC Guide Agent | Year 2 |
| Autonomous lead nurture | Nurture Agent | Year 3 |

---

# 2. AI PLATFORM OVERVIEW

## 2.1 AI Ecosystem Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KUBERONE AI PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  CUSTOMER-FACING AI                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ KuberOne AI      │  │ KuberOne Voice   │  │ KuberOne Support │        │
│  │ Advisor          │  │ Assistant        │  │ AI               │        │
│  │ (Chat + RAG)     │  │ (STT→LLM→TTS)   │  │ (FAQ + Status)   │        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │
│           │                     │                     │                     │
├───────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│  INTERNAL AI                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ KuberOne Sales   │  │ Credit Analysis  │  │ KuberOne         │        │
│  │ Copilot          │  │ AI               │  │ Management AI    │        │
│  │ (CRM sidebar)    │  │ (Credit assist)  │  │ (Insights)       │        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │
│           │                     │                     │                     │
├───────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│  AI INFRASTRUCTURE (Shared)                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ RAG Engine │ │ Prompt     │ │ Knowledge  │ │ AI         │            │
│  │            │ │ Engine     │ │ Base       │ │ Analytics  │            │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘            │
│        │              │              │              │                      │
│  ┌─────▼──────────────▼──────────────▼──────────────▼──────┐            │
│  │              OpenAI GPT-4o API + Embeddings API            │            │
│  └─────────────────────────────────────────────────────────┘            │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Vector Store (Phase 1: MySQL) · OCR · Guard Rails · Audit │            │
│  └─────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   Customer App    DSA App       CRM Admin      Management
```

## 2.2 AI Loan Advisor (KuberOne AI Advisor)

| Attribute | Value |
|-----------|-------|
| **Agent name** | KuberOne AI Advisor |
| **Channels** | Customer App (chat), WhatsApp (Phase 2), Web widget (Phase 2) |
| **Languages** | English, Hindi, Hinglish |
| **Model** | GPT-4o (chat); text-embedding-3-small (RAG) |
| **RAG** | Yes — product policies, FAQs, eligibility rules |
| **Users** | Customers (primary), DSA (limited product queries) |

## 2.3 AI Sales Copilot (KuberOne Copilot)

| Attribute | Value |
|-----------|-------|
| **Channels** | CRM Admin (drawer), DSA App (limited) |
| **Model** | GPT-4o with structured JSON output |
| **RAG** | Yes — sales scripts, lender policies, SOPs |
| **Users** | Sales Executive, RM, Branch Manager, Credit (read-only) |

## 2.4 AI Voice Assistant (KuberOne Voice)

| Attribute | Value |
|-----------|-------|
| **Channels** | Customer App (in-app voice), outbound calls (Phase 3) |
| **STT** | OpenAI Whisper API / Deepgram |
| **LLM** | GPT-4o (same advisor logic) |
| **TTS** | OpenAI TTS / ElevenLabs |
| **Languages** | English, Hindi (Phase 1); Hinglish (Phase 2) |

## 2.5 Knowledge AI (RAG Backbone)

| Attribute | Value |
|-----------|-------|
| **Role** | Shared retrieval layer for all AI products |
| **Sources** | 7 categories (policies, FAQs, SOPs, scripts, etc.) |
| **Not user-facing** | Infrastructure — powers Advisor, Copilot, Support |

## 2.6 Analytics AI (KuberOne Insights)

| Attribute | Value |
|-----------|-------|
| **Channels** | Management dashboards, weekly email digest |
| **Model** | GPT-4o for narrative insights; SQL for data |
| **Users** | CEO, Directors, Heads (aggregated data only) |

## 2.7 Future AI Agents

| Agent | Domain | Integration Point |
|-------|--------|-------------------|
| Insurance Advisor | Insurance products | New `ai/insurance` module |
| Credit Card Advisor | Card products | New `ai/cards` module |
| Investment Advisor | Mutual funds | New `ai/wealth` module |
| Wealth Advisor | Portfolio management | New `ai/wealth` module |
| Collection Assistant | Post-disbursement | New `ai/collections` module |
| Renewal Assistant | Top-up, BT renewal | Extend copilot |

---

# 3. AI ARCHITECTURE

## 3.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                                      │
│  Customer App (chat UI, voice UI) · CRM (copilot drawer) · Management   │
├─────────────────────────────────────────────────────────────────────────┤
│  CONVERSATION LAYER                                                      │
│  Session mgmt · Intent detection · State machine · Memory · Streaming   │
├─────────────────────────────────────────────────────────────────────────┤
│  PROMPT LAYER                                                            │
│  System prompts · Role prompts · Product prompts · Compliance prompts   │
├─────────────────────────────────────────────────────────────────────────┤
│  RAG LAYER                                                               │
│  Query embedding · Vector search · Reranking · Context assembly         │
├─────────────────────────────────────────────────────────────────────────┤
│  KNOWLEDGE LAYER                                                         │
│  Ingestion pipeline · Chunking · Embedding · Versioning · Index mgmt    │
├─────────────────────────────────────────────────────────────────────────┤
│  ANALYTICS LAYER                                                         │
│  Token tracking · Conversation metrics · Accuracy · Adoption · Cost     │
├─────────────────────────────────────────────────────────────────────────┤
│  SECURITY LAYER                                                          │
│  Guard rails · PII masking · Prompt injection defense · Audit · RBAC    │
├─────────────────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER                                                       │
│  OpenAI API · Eligibility Engine · EMI Engine · LMS/LOS · Notification  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Presentation Layer

| Surface | Component | Protocol |
|---------|-----------|----------|
| Customer chat | `ConversationScreen` (mobile) | REST + SSE streaming |
| Voice session | `VoiceSessionScreen` (mobile) | WebSocket audio stream |
| CRM copilot | `CopilotDrawer` (admin) | REST (polling + cache) |
| Management insights | Dashboard widgets | REST (scheduled) |
| Support AI | In-app + ticket handoff | REST |

## 3.3 Conversation Layer

| Component | Responsibility |
|-----------|----------------|
| **Session Manager** | Create, resume, expire sessions; link to customer |
| **Intent Detector** | Classify user message intent (14 intents) |
| **State Machine** | Manage conversation flow states |
| **Memory Manager** | Short-term (session) + long-term (profile) memory |
| **Context Builder** | Assemble customer, product, application context |
| **Response Generator** | Orchestrate RAG + LLM + post-processing |
| **Stream Handler** | SSE token streaming to client |
| **Guard Rail Filter** | Pre/post LLM safety checks |

## 3.4 Prompt Layer

| Component | Responsibility |
|-----------|----------------|
| **Prompt Registry** | Versioned prompt templates in DB |
| **Prompt Composer** | Assemble system + role + context + RAG + user |
| **Token Budget Manager** | Allocate tokens across prompt sections |
| **Prompt Version Control** | A/B testing; rollback capability |
| **Compliance Injector** | Auto-append disclaimers and restrictions |

## 3.5 RAG Layer

| Component | Responsibility |
|-----------|----------------|
| **Query Embedder** | Convert user query to vector (OpenAI embeddings) |
| **Vector Searcher** | Cosine similarity search in vector store |
| **Reranker** | Cross-encoder rerank top-K results (Phase 2) |
| **Context Assembler** | Format retrieved chunks for prompt injection |
| **Source Attributor** | Tag responses with source references |
| **Freshness Checker** | Warn if retrieved content is stale (> 90 days) |

## 3.6 Knowledge Layer

| Component | Responsibility |
|-----------|----------------|
| **Ingestion Pipeline** | PDF/DOCX/FAQ → chunks → embeddings → index |
| **Chunk Manager** | Split, overlap, metadata tagging |
| **Version Manager** | Track content versions; reindex on change |
| **Index Manager** | Full reindex, incremental update, delete |
| **Quality Validator** | Test retrieval quality post-index |

## 3.7 Analytics Layer

| Component | Responsibility |
|-----------|----------------|
| **Token Tracker** | Per-session, per-user, per-product token counts |
| **Conversation Logger** | Metadata-only logs (no PII) |
| **Accuracy Tracker** | User feedback (thumbs up/down) + outcome correlation |
| **Adoption Tracker** | DAU/MAU of AI features per channel |
| **Cost Monitor** | Daily/monthly OpenAI spend; budget alerts |
| **Funnel Impact** | AI session → application conversion correlation |

## 3.8 Security Layer

| Component | Responsibility |
|-----------|----------------|
| **Input Sanitizer** | Strip injection patterns; max length |
| **PII Masker** | Mask PAN, Aadhaar, phone in logs and prompts where possible |
| **Moderation Filter** | OpenAI moderation API on input + output |
| **RBAC Enforcer** | AI endpoints respect role permissions |
| **Audit Writer** | Log all AI interactions (metadata) |
| **Rate Limiter** | Per-user, per-endpoint, global limits |
| **Disclaimer Injector** | Financial advice disclaimer on every session |

---

# 4. KUBERONE AI ADVISOR

## 4.1 Agent Identity

| Attribute | Value |
|-----------|-------|
| **Official name** | KuberOne AI Advisor |
| **Display name (EN)** | KuberOne AI Advisor |
| **Display name (HI)** | कuberOne AI सलाहकार |
| **Persona** | Professional, warm, knowledgeable loan expert |
| **Tone** | Helpful, clear, never pushy; explains in simple language |
| **Avatar** | KuberOne branded AI icon (teal #22D3A6 accent) |

## 4.2 Languages

| Language | Code | Phase | Notes |
|----------|------|-------|-------|
| **English** | `en` | Phase 1 | Default; professional Indian English |
| **Hindi** | `hi` | Phase 1 | Devanagari script responses |
| **Hinglish** | `hi-en` | Phase 2 | Roman script Hindi-English mix; auto-detect |

**Language detection:** Auto-detect from user message; confirm on first message if ambiguous. User can switch via preference or command ("Speak in Hindi").

## 4.3 Capabilities

| # | Capability | Description |
|---|------------|-------------|
| 1 | **Product discovery** | Explain HL, LAP, BL, AL products and variants |
| 2 | **Eligibility guidance** | Run eligibility check; explain results |
| 3 | **EMI calculation** | Calculate and explain EMI scenarios |
| 4 | **Product recommendation** | Suggest best product based on profile |
| 5 | **Lender recommendation** | Suggest matched lenders with rationale |
| 6 | **Document guidance** | List required documents per product/stage |
| 7 | **Application assistance** | Guide through application steps |
| 8 | **Status queries** | Answer "where is my application?" |
| 9 | **FAQ answers** | RAG-powered answers from knowledge base |
| 10 | **Comparison** | Compare products, lenders, EMI scenarios |
| 11 | **Referral info** | Explain referral program |
| 12 | **Appointment booking** | Schedule callback with human advisor |
| 13 | **Voice interaction** | Full capability via voice channel |
| 14 | **Multilingual** | Respond in English, Hindi, Hinglish |

## 4.4 Responsibilities

| Responsibility | Detail |
|----------------|--------|
| Educate customers | Explain loan products without jargon |
| Pre-qualify | Collect income, employment, requirement before suggesting |
| Ground responses in facts | RAG retrieval from verified policies only |
| Cite sources | Attribute policy information to source documents |
| Guide next steps | Clear CTA after every recommendation |
| Maintain context | Remember conversation within session |
| Respect consent | Confirm before using profile data |
| Escalate appropriately | Transfer to human when needed |

## 4.5 Limitations (Hard Rules)

| # | Limitation | Enforcement |
|---|------------|-------------|
| 1 | **Cannot approve or reject loans** | No API call to credit/sanction endpoints |
| 2 | **Cannot guarantee approval** | Disclaimer + "eligibility is indicative" |
| 3 | **Cannot provide legal advice** | Redirect to legal professional |
| 4 | **Cannot share other customers' data** | Scope locked to own profile |
| 5 | **Cannot modify applications** | Read-only application data |
| 6 | **Cannot disclose commission rates to customers** | Partner economics hidden |
| 7 | **Cannot make rate promises** | "Rates subject to lender approval" |
| 8 | **Cannot process payments** | No payment gateway access |
| 9 | **Cannot access credit bureau directly** | CIBIL referenced only if in profile (Phase 2) |
| 10 | **Cannot override eligibility engine** | Engine result is authoritative; AI explains only |

## 4.6 Escalation Rules

| Trigger | Escalation Target | Action |
|---------|-------------------|--------|
| User says "talk to human" / "agent" | Sales Executive / Support | Create ticket; notify |
| User expresses frustration (3+ negative) | Support Team | Apologize; offer human |
| Complex dispute or complaint | Support Team | Create complaint ticket |
| Credit-specific question beyond AI scope | Sales Executive | Schedule callback |
| Application stuck > 7 days | RM (if assigned) | Notify RM |
| AI confidence < 0.5 on response | Internal flag | Suggest human; log for review |
| Regulatory/compliance question | Compliance Team | "Let me connect you with our team" |
| User requests loan modification post-sanction | Operations | Create ops ticket |

## 4.7 Conversation Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Progressive disclosure** | Ask one question at a time during qualification |
| **Confirmation loops** | "You mentioned ₹50L home loan — is that correct?" |
| **Suggestion chips** | Quick-tap options for common questions |
| **Structured cards** | Product/lender recommendations as rich cards |
| **CTA buttons** | "Check Eligibility", "Start Application", "Upload Documents" |
| **Typing indicator** | Show while AI processes |
| **Streaming** | Token-by-token display for natural feel |
| **Session greeting** | Branded welcome + disclaimer on first message |
| **Graceful errors** | "I'm having trouble — let me connect you with our team" |

---

# 5. AI CUSTOMER JOURNEY

## 5.1 Journey Stages

```
Greeting → Requirement Collection → Qualification → Eligibility Guidance
    → Product Recommendation → Lender Recommendation → Application Assistance
    → Follow-Up → Escalation (if needed)
```

## 5.2 Greeting

| Element | Content |
|---------|---------|
| Welcome | "Hello! I'm KuberOne AI Advisor, your personal loan guide." |
| Disclaimer | "I provide guidance only — final approval is by the lender." |
| Language offer | "I can help in English or Hindi. How would you like to proceed?" |
| Quick chips | ["Home Loan", "Business Loan", "Check Eligibility", "Track Application"] |
| Returning user | "Welcome back, {name}! You have an active {product} application at stage {stage}." |

## 5.3 Requirement Collection

| Question | Purpose | Extraction |
|----------|---------|------------|
| What type of loan? | Product family | Intent: PRODUCT_INQUIRY |
| Loan amount needed? | Sizing | Entity: amount |
| Purpose of loan? | Product variant | Entity: purpose |
| Employment type? | Eligibility | Entity: employment |
| Monthly income? | Eligibility | Entity: income |
| Property/vehicle details? | Product-specific | Entity: collateral |
| Location (city/pincode)? | Lender matching | Entity: location |

**Smart collection:** Pre-fill from customer profile; only ask missing fields.

## 5.4 Qualification

| Check | Source | Action if fail |
|-------|--------|----------------|
| Age 21–65 | Profile or asked | Suggest alternative or explain ineligibility |
| Minimum income | Profile or asked | Suggest lower amount or different product |
| Employment type | Profile or asked | Suggest suitable product |
| Location serviceable | Pincode check | Inform limited lender options |
| Existing applications | Application data | Inform about active application |

## 5.5 Eligibility Guidance

| Step | Action |
|------|--------|
| 1 | Collect/confirm required parameters |
| 2 | Call eligibility engine API |
| 3 | Receive score + pass/fail + lender matches |
| 4 | AI explains result in simple language |
| 5 | If fail: suggest alternatives or improvements |
| 6 | If pass: proceed to product recommendation |
| 7 | Display eligibility card with score gauge |

## 5.6 Product Recommendation

| Input | Output |
|-------|--------|
| Profile + requirements + eligibility | Ranked product list (1–3) |
| Per product | Name, variant, amount range, tenure, estimated rate, why recommended |
| CTA | "Start Application" button per product |

## 5.7 Lender Recommendation

| Input | Output |
|-------|--------|
| Product + eligibility result | Top 3 lender matches |
| Per lender | Name, estimated rate, EMI, TAT, highlights |
| Disclaimer | "Final terms subject to lender approval" |
| CTA | "Apply with {lender}" (selects lender on application) |

## 5.8 Application Assistance

| Stage | AI Help |
|-------|---------|
| S01 Draft | Guide wizard steps; explain each field |
| S02 Submitted | Confirm submission; explain next steps |
| S03 Documentation | List required docs; explain how to upload |
| S04–S05 Processing | Status updates; manage expectations |
| S06 Sanctioned | Explain sanction terms |
| Deficiency | List missing docs; guide re-upload |

## 5.9 Follow-Up

| Trigger | AI Action |
|---------|-----------|
| 24h after eligibility check, no application | "Ready to start your application?" |
| 48h after draft application | "Your application is saved — shall we continue?" |
| Document deficiency | "You need to upload {doc} — here's how" |
| Post-sanction | "Congratulations! Here are your next steps" |

## 5.10 Escalation

*See Section 4.6 and Section 26 for full escalation framework.*

---

# 6. AI CONVERSATION ARCHITECTURE

## 6.1 Intent Detection

| Intent Code | Description | Example Utterance |
|-------------|-------------|-------------------|
| `GREETING` | Hello, hi | "Hi", "Namaste" |
| `PRODUCT_INQUIRY` | Ask about products | "What is home loan?" |
| `ELIGIBILITY_CHECK` | Check eligibility | "Am I eligible for 50 lakh loan?" |
| `EMI_CALCULATION` | Calculate EMI | "What is EMI for 30 lakh?" |
| `PRODUCT_RECOMMENDATION` | Which product is best | "Which loan should I take?" |
| `LENDER_RECOMMENDATION` | Which bank is best | "Best bank for home loan?" |
| `DOCUMENT_GUIDANCE` | What docs needed | "Documents for business loan?" |
| `APPLICATION_STATUS` | Track application | "Where is my application?" |
| `APPLICATION_ASSIST` | Help with application | "Help me apply" |
| `COMPARISON` | Compare options | "Compare HL vs LAP" |
| `REFERRAL_INFO` | Referral program | "How does referral work?" |
| `COMPLAINT` | Issue/complaint | "My application is stuck" |
| `ESCALATION` | Want human | "Talk to someone" |
| `GENERAL_FAQ` | General question | RAG-retrieved FAQ |
| `OFF_TOPIC` | Non-loan topic | Redirect politely |

**Detection method:** Phase 1 — GPT function calling with intent enum; Phase 2 — fine-tuned classifier for cost reduction.

## 6.2 Context Management

| Context Type | Storage | TTL | Contents |
|--------------|---------|-----|----------|
| **Session context** | `chat_sessions` + Redis (Phase 2) | Session lifetime | Intent, state, collected entities |
| **Conversation history** | `chat_messages` | 90 days | Last 20 message pairs in prompt |
| **Customer profile** | API fetch per message | Real-time | Name, income, employment, KYC status |
| **Application context** | API fetch if active | Real-time | Stage, product, deficiencies |
| **RAG context** | Ephemeral per message | — | Top-5 retrieved chunks |
| **Product catalog** | Cache | 1 hour | Active products, rates |

**Token budget allocation (8K context window):**

| Section | Max Tokens |
|---------|------------|
| System prompt | 800 |
| RAG chunks | 2,000 |
| Customer context | 500 |
| Application context | 500 |
| Conversation history | 3,000 |
| User message | 500 |
| Response reserve | 700 |

## 6.3 Memory Strategy

| Memory | Scope | Implementation |
|--------|-------|----------------|
| **Short-term** | Current session | All messages in session; state machine variables |
| **Working memory** | Current task | Collected entities (amount, product, income) in session metadata |
| **Long-term** | Cross-session | Customer profile (from DB); previous session summaries (Phase 2) |
| **Episodic** | Past sessions | Last 3 session summaries injected (Phase 2) |

**No training on customer conversations** — conversations are not used for model fine-tuning.

## 6.4 Conversation States

| State | Entry | Actions | Exit |
|-------|-------|---------|------|
| `IDLE` | Session start | Greet; show chips | User message |
| `COLLECTING_REQUIREMENTS` | Product inquiry | Ask questions one-by-one | All required entities collected |
| `QUALIFYING` | Requirements complete | Run qualification checks | Pass or fail |
| `ELIGIBILITY` | Qualified | Run eligibility engine | Result received |
| `RECOMMENDING` | Eligible | Product + lender recommendation | User selects or asks more |
| `APPLICATION_ASSIST` | User wants to apply | Guide application steps | Application submitted or abandoned |
| `STATUS_QUERY` | Status intent | Fetch and explain status | Answered |
| `FAQ` | General question | RAG retrieval + answer | Answered |
| `ESCALATING` | Escalation trigger | Create ticket; handoff message | Ticket created |
| `CLOSING` | User done | Thank you; offer feedback | Session end |

## 6.5 Response Generation Pipeline

| Step | Component |
|------|-----------|
| 1 | Receive user message |
| 2 | Sanitize input (guard rails) |
| 3 | Moderation check (OpenAI) |
| 4 | Detect intent |
| 5 | Update state machine |
| 6 | Build context (profile + application + history) |
| 7 | RAG retrieval (if knowledge needed) |
| 8 | Compose prompt |
| 9 | Call GPT-4o (streaming) |
| 10 | Parse response (text + structured cards) |
| 11 | Post-process (disclaimer, source attribution) |
| 12 | Moderation check on output |
| 13 | Store messages |
| 14 | Stream to client |
| 15 | Log analytics (tokens, intent, latency) |

## 6.6 Safety Rules

| Rule | Enforcement |
|------|-------------|
| No guaranteed approval language | Output filter replaces "guaranteed" → "likely" |
| No specific rate promises | Append "subject to lender approval" |
| No PII in logs | Mask before logging |
| No harmful content | OpenAI moderation API |
| No competitor bashing | System prompt prohibits |
| No investment advice | Redirect to qualified advisor |
| Max response length | 1,000 tokens |
| Refuse off-topic | Politely redirect to loan topics |
| Refuse role-play/jailbreak | System prompt hardened |

---

# 7. LEAD QUALIFICATION AI

## 7.1 Qualification Inputs

| Factor | Source | Analysis |
|--------|--------|----------|
| **Income** | Profile / lead data | vs product minimum; FOIR calculation |
| **Occupation** | Profile / lead data | Salaried vs self-employed vs business |
| **Property value** | Lead details (HL/LAP) | LTV calculation; min property value |
| **Vehicle value** | Lead details (AL) | On-road price; LTV |
| **Business turnover** | Lead details (BL) | vs product minimum; vintage |
| **Location** | Address / pincode | Serviceable area check |
| **Loan requirement** | Lead amount | vs product min/max range |
| **Age** | Profile | 21–65 eligibility |
| **Existing EMIs** | Profile / declared | FOIR impact |
| **Engagement** | App activity | Response rate, doc uploads |
| **Source quality** | Lead source | Historical conversion by source |

## 7.2 Qualification Outputs

| Output | Type | Description |
|--------|------|-------------|
| `leadScore` | 0–100 | Combined AI + rules score |
| `leadGrade` | A+ / A / B / C / Rejected | Letter grade |
| `leadQuality` | HOT / WARM / MODERATE / COLD | Qualitative label |
| `conversionPotential` | 0.0–1.0 | Probability of disbursement |
| `qualificationFactors` | Array | {factor, status, impact, detail} |
| `recommendedProduct` | string | Best-fit product code |
| `riskFlags` | Array | Identified risk indicators |
| `suggestedAction` | string | Next step for sales |

## 7.3 Qualification Flow

| Step | Action |
|------|--------|
| 1 | Lead created or updated → trigger qualification |
| 2 | Load lead data + customer profile |
| 3 | Run rule-based checks (age, income, location) |
| 4 | Run product-specific checks (LTV, turnover, etc.) |
| 5 | Calculate rule-based score (0–100) |
| 6 | AI enhancement: GPT analyzes engagement + patterns |
| 7 | Merge: 70% rules + 30% AI (configurable) |
| 8 | Assign grade (A+ to Rejected) |
| 9 | Store in `lead_scores` + `ai_predictions` |
| 10 | Notify sales executive if HOT/A+ |

---

# 8. LEAD SCORING ENGINE

## 8.1 Grade Definitions

| Grade | Score Range | Label | SLA | Action |
|-------|-------------|-------|-----|--------|
| **A+** | 85–100 | Hot — High conversion | Contact within 1 hour | Immediate call |
| **A** | 70–84 | Warm — Good potential | Contact within 4 hours | Priority call |
| **B** | 50–69 | Moderate — Needs nurturing | Contact within 24 hours | Standard follow-up |
| **C** | 30–49 | Cold — Low priority | Contact within 48 hours | Nurture campaign |
| **Rejected** | 0–29 | Unqualified | No contact required | Archive or re-engage later |

## 8.2 Scoring Factors & Weightage

| Factor | Weight | Scoring Logic |
|--------|--------|---------------|
| Income eligibility | 20% | Income vs product minimum (ratio) |
| Product match | 15% | Requirement matches available product |
| Profile completeness | 10% | % of profile fields filled |
| Engagement | 15% | App opens, response rate, doc uploads |
| Source quality | 10% | Historical conversion rate of source |
| Geographic match | 10% | Serviceable pincode |
| Age eligibility | 5% | Within product age range |
| FOIR health | 10% | EMI-to-income ratio < 50% = full marks |
| AI engagement signal | 5% | AI advisor interaction quality |

## 8.3 Business Logic

| Rule | Effect |
|------|--------|
| Income < 50% of minimum | Cap score at 29 (Rejected) |
| Non-serviceable pincode | Cap score at 39 (C) |
| DSA-submitted lead with complete data | +10 bonus |
| Customer with active application | Exclude from new lead scoring |
| Duplicate lead (same phone + product < 30 days) | Flag DUPLICATE; no rescore |
| Re-activated lead | Reset score; apply 7-day cooldown |

## 8.4 Output Structure

| Field | Type | Example |
|-------|------|---------|
| `leadId` | UUID | — |
| `ruleScore` | number | 72 |
| `aiScore` | number | 78 |
| `combinedScore` | number | 74 |
| `grade` | enum | A |
| `quality` | enum | WARM |
| `conversionPotential` | number | 0.65 |
| `factors` | array | [{factor, score, weight, detail}] |
| `riskFlags` | array | [{category, severity, message}] |
| `recommendedAction` | string | "Call within 4 hours" |
| `scoredAt` | ISO datetime | — |
| `modelVersion` | string | v1.0 |

---

# 9. ELIGIBILITY AI

## 9.1 Architecture

Eligibility AI is a **hybrid system**: the **eligibility rules engine** (deterministic) makes the decision; **AI explains** the result in natural language and suggests alternatives.

```
Customer query → AI extracts params → Eligibility Engine (rules) → Result
    → AI explains result → Recommendations (if ineligible)
```

## 9.2 Product-Specific Eligibility

### Home Loan (HL-01 to HL-04)

| Check | Rule | AI Explanation |
|-------|------|----------------|
| Age | 21–65 at maturity | "You qualify on age" |
| Income | ≥ ₹25K/month salaried | "Your income meets the minimum" |
| LTV | ≤ 80% (90% < ₹30L) | "You can borrow up to ₹X against property value" |
| Amount | ₹5L–₹5Cr | "Your requested amount is within range" |
| Property | Residential preferred | "Property type is acceptable" |

### LAP (LAP-01 to LAP-04)

| Check | Rule |
|-------|------|
| Age | 25–70 at maturity |
| Property value | ≥ ₹10L |
| LTV | ≤ 60% residential, 50% commercial |
| Income | ≥ ₹20K/month |

### Business Loan (BL-01 to BL-05)

| Check | Rule |
|-------|------|
| Business vintage | ≥ 3 years |
| Turnover | ≥ ₹10L/year |
| Profitability | Positive (last 2 years) |
| GST | Required if turnover > ₹20L |

### Auto Loan (AL-01 to AL-07)

| Check | Rule |
|-------|------|
| Age | 21–65 at maturity |
| Income | ≥ ₹15K/month |
| LTV | ≤ 90% new, 80% used |
| Vehicle age | ≤ 5 years (used) |

## 9.3 AI-Generated Outputs

| Output | Description |
|--------|-------------|
| `eligible` | boolean — from engine |
| `score` | 0–100 — from engine |
| `assessment` | AI-generated natural language summary |
| `loanAmountEstimate` | {min, max, recommended} |
| `riskIndicators` | Array of risk flags with severity |
| `improvementSuggestions` | "Increase income proof", "Add co-applicant" |
| `alternativeProducts` | If ineligible for requested product |
| `lenderMatches` | Top 3 from lender matching engine |

---

# 10. PRODUCT RECOMMENDATION AI

## 10.1 Recommendation Logic

| Input | Processing |
|-------|------------|
| Customer profile | Income, age, employment, location |
| Stated requirement | Amount, purpose, collateral |
| Eligibility results | Per-product pass/fail |
| AI conversation context | Expressed preferences |
| Historical patterns | Similar profiles → successful products |

## 10.2 Recommendation Output

| Field | Description |
|-------|-------------|
| `rank` | 1, 2, 3 |
| `productFamily` | HL, LAP, BL, AL |
| `productCode` | HL-01, LAP-01, etc. |
| `productName` | Display name |
| `variantName` | Fresh, BT, Top-Up, etc. |
| `recommendedAmount` | ₹ amount |
| `recommendedTenure` | Months |
| `estimatedRate` | % range |
| `estimatedEmi` | ₹ monthly |
| `confidence` | HIGH / MEDIUM / LOW |
| `reasons` | Array of why recommended |
| `cta` | "Start Application" deep link |

## 10.3 Cross-Sell Recommendations

| Trigger | Cross-Sell |
|---------|------------|
| HL sanctioned | Home insurance |
| BL sanctioned | Business insurance, OD/CC |
| AL sanctioned | Vehicle insurance |
| Disbursed 12+ months | Top-up, BT |
| High income customer | LAP (if property owner) |

**Cross-sell presented as:** "You may also benefit from..." — never aggressive.

---

# 11. LENDER RECOMMENDATION AI

## 11.1 Lender Categories

| Category | Examples | CRM Display |
|----------|----------|-------------|
| **Banks** | HDFC, SBI, ICICI, Axis, Kotak | Bank logo + name |
| **NBFCs** | Bajaj Finserv, Tata Capital, L&T Finance | NBFC badge |
| **Fintech lenders** | Phase 2 partners | Fintech badge |

## 11.2 Recommendation Factors

| Factor | Weight | Source |
|--------|--------|--------|
| Eligibility match | Required (filter) | Lender policies |
| Interest rate | 25% | `lender_policies.rateRange` |
| Approval probability | 20% | Historical + AI prediction |
| LTV alignment | 15% | `lender_policies.maxLtv` |
| Processing fee / ROI | 15% | Total cost of loan |
| TAT (turnaround) | 15% | `lender_policies.avgTat` |
| Geographic coverage | 10% | Serviceable pincodes |

## 11.3 Recommendation Output

| Field | Description |
|-------|-------------|
| `lenderId` | UUID |
| `lenderName` | Display name |
| `lenderType` | BANK, NBFC, FINTECH |
| `matchScore` | 0–100 |
| `estimatedRate` | % |
| `estimatedEmi` | ₹ |
| `estimatedTat` | Days |
| `processingFee` | ₹ or % |
| `totalCostOfLoan` | ₹ (interest + fees) |
| `approvalProbability` | 0.0–1.0 |
| `highlights` | ["Lowest rate", "Fastest TAT"] |
| `considerations` | ["Higher processing fee"] |

## 11.4 AI Enhancement

GPT provides **natural language comparison** of top lenders: "HDFC offers the lowest rate at 8.5%, while ICICI has faster processing at 12 days. Based on your priority of {lowest EMI}, I recommend HDFC."

---

# 12. AI SALES COPILOT

## 12.1 Copilot Overview

| Attribute | Value |
|-----------|-------|
| **Name** | KuberOne Copilot |
| **Channel** | CRM Admin drawer; DSA App (limited) |
| **Model** | GPT-4o + structured JSON output |
| **Trigger** | Auto on lead/application detail open; manual refresh |
| **Refresh** | On data change; max every 60 seconds |

## 12.2 Lead Insights

| Insight | Data |
|---------|------|
| Lead grade + score | A+ to Rejected with factor breakdown |
| Conversion probability | 0.0–1.0 with confidence |
| Urgency | HIGH / MEDIUM / LOW |
| Best contact time | AI-suggested based on engagement patterns |
| Competitor risk | Customer checking other lenders (Phase 2) |
| Engagement summary | Last activity, response rate |

## 12.3 Approval Probability

| Input | Weight |
|-------|--------|
| Eligibility score | 25% |
| Document completeness | 20% |
| Income adequacy (FOIR) | 20% |
| Credit indicators | 15% (Phase 2 — CIBIL) |
| Lender match quality | 10% |
| Historical approval rate (product + lender) | 10% |

| Output | Format |
|--------|--------|
| `approvalProbability` | 0.72 (72%) |
| `confidenceLevel` | HIGH / MEDIUM / LOW |
| `positiveFactors` | Array |
| `negativeFactors` | Array |
| `disclaimer` | "Advisory only — credit team decides" |

## 12.4 Disbursal Probability

| Extension of approval probability with: |
|----------------------------------------|
| Lender TAT historical data |
| Document verification completeness |
| Ops processing backlog |
| Seasonal patterns |

## 12.5 Risk Analysis

| Category | Signals |
|----------|---------|
| Income risk | FOIR > 60% |
| Document risk | OCR forgery flags |
| Behavioral risk | Multiple applications |
| Geographic risk | Non-serviceable area |
| Duplicate risk | Similar apps across partners |
| Compliance risk | Missing consent, expired KYC |

## 12.6 Next Best Action (NBA)

| Priority | Example Actions |
|----------|-----------------|
| 1 (urgent) | "Call customer — A+ lead, not contacted in 2 hours" |
| 2 (today) | "Request bank statement via WhatsApp" |
| 3 (this week) | "Follow up on document deficiency" |
| 4 (nurture) | "Send product comparison for LAP" |

**One-click actions:** Log call, send doc request, assign, send WhatsApp template.

## 12.7 Missing Documents

| Detection | Compare checklist vs uploaded vs verified |
|-----------|------------------------------------------|
| Priority | Blocking (required for stage) vs optional |
| Message | AI-generated customer-friendly message |
| Channel | Suggest WhatsApp/SMS based on preference |
| Action | One-click send deficiency notice |

## 12.8 Follow-Up Suggestions

| Context | Suggestion |
|---------|------------|
| Lead not contacted 4h | "Call now — SLA at risk" |
| Customer viewed app but no action | "Send WhatsApp with product details" |
| Document uploaded, not verified | "Expedite verification — high approval probability" |
| Sanctioned 3+ days, no bank login | "Initiate bank login with {lender}" |
| Dormant 7+ days | "Re-engagement campaign or manual call" |

---

# 13. CREDIT ANALYSIS AI

## 13.1 Purpose

Assist **Credit Executives** with structured analysis — **advisory only**; credit decision remains human (SoD enforced).

## 13.2 Analysis Dimensions

| Dimension | Calculation | Threshold |
|-----------|-------------|-----------|
| **FOIR** | (Existing EMIs + Proposed EMI) / Monthly Income | ≤ 50% ideal; ≤ 65% max |
| **LTV** | Loan Amount / Property/Vehicle Value | Per product max |
| **DSCR** | Net Operating Income / Total Debt Service | ≥ 1.25 (business loans) |
| **Income stability** | Employment vintage / business vintage | Per product min |
| **Bank statement analysis** | Avg balance, salary credits, bounce rate | AI flags anomalies |
| **ITR analysis** | Income trend, profit consistency | YoY growth/decline |

## 13.3 Credit Indicators

| Indicator | Source | Flag |
|-----------|--------|------|
| CIBIL score | Bureau API (Phase 2) | < 650 = high risk |
| EMI bounce history | Bank statement OCR | > 2 bounces = flag |
| Income mismatch | Declared vs OCR/ITR | > 20% variance = flag |
| Existing loan count | Application data | > 3 active = flag |
| Recent enquiries | CIBIL (Phase 2) | > 5 in 30 days = flag |

## 13.4 Risk Factors Output

| Field | Type |
|-------|------|
| `overallRisk` | LOW / MEDIUM / HIGH |
| `foir` | {value, status, threshold} |
| `ltv` | {value, status, threshold} |
| `dscr` | {value, status, threshold} (BL only) |
| `riskFlags` | [{category, severity, detail, mitigation}] |
| `recommendation` | PROCEED / REVIEW / REJECT (advisory) |
| `suggestedConditions` | ["Co-applicant required", "Additional collateral"] |
| `narrative` | AI-generated credit note draft |

## 13.5 CRM Integration

| Surface | Credit tab → "AI Analysis" panel |
|---------|----------------------------------|
| Display | Risk gauge + factor cards + narrative |
| Action | Credit analyst can copy narrative to credit notes |
| SoD | AI cannot set approve/reject status |

---

# 14. DOCUMENT AI

## 14.1 Document Classification

| Input | Output |
|-------|--------|
| Uploaded file (image/PDF) | Predicted `documentType` |
| Types | PAN_CARD, AADHAAR, SALARY_SLIP, BANK_STATEMENT, ITR, etc. |
| Confidence | 0.0–1.0 |
| Action | Auto-assign type if confidence > 0.9; else manual review |

**Model:** Phase 1 — GPT-4o vision; Phase 2 — dedicated classification model.

## 14.2 Document Validation

| Validation | Method |
|------------|--------|
| Format check | File type, size, dimensions |
| Expiry check | Document date vs current date |
| Name match | OCR name vs profile name (fuzzy) |
| PAN format | Regex + OCR extraction |
| Aadhaar format | Masked display; last 4 digits match |
| Salary slip recency | Within 3 months |
| Bank statement period | Minimum 6 months |

## 14.3 Document Completeness

| Check | Logic |
|-------|-------|
| Required vs uploaded | Checklist from application stage + product |
| Required vs verified | Only verified docs count |
| Score | completeness% = verified / required × 100 |
| Blockers | List docs blocking stage advancement |

## 14.4 Document Guidance (AI Advisor)

| Query | Response |
|-------|----------|
| "What documents do I need?" | Checklist for product + stage |
| "How do I upload?" | Step-by-step with app navigation |
| "Why was my document rejected?" | Reason + re-upload guidance |
| "Is photo accepted?" | Format requirements |

## 14.5 Document Deficiency Detection

| Trigger | Application stage change or document rejection |
|---------|-----------------------------------------------|
| Detection | Compare checklist vs verified set |
| Output | List of deficiencies with priority |
| Auto-action | Send deficiency notice via notification engine |
| Copilot | Surface in NBA panel |

---

# 15. OCR AI

## 15.1 OCR Pipeline

| Step | Component |
|------|-----------|
| 1 | Document uploaded to S3 |
| 2 | OCR worker picks from queue |
| 3 | OCR provider processes (AWS Textract / GPT-4o Vision) |
| 4 | Field extraction per document template |
| 5 | Validation against expected format |
| 6 | Cross-reference with customer profile |
| 7 | Store in `document_verifications.extractedData` |
| 8 | Auto-verify or flag for manual review |

## 15.2 Document-Specific OCR

### PAN Card

| Field | Extraction |
|-------|------------|
| PAN number | AAAAA9999A format |
| Name | Full name |
| Father's name | If visible |
| DOB | Date of birth |
| Validation | PAN API verification (separate) |

### Aadhaar

| Field | Extraction |
|-------|------------|
| Aadhaar number | Masked (last 4 only stored) |
| Name | Full name |
| DOB / Year of birth | Date |
| Address | Full address |
| Validation | Aadhaar OTP verification (separate) |

### Bank Statements

| Field | Extraction |
|-------|------------|
| Account holder | Name |
| Account number | Masked |
| Bank name | Institution |
| Statement period | From–to dates |
| Salary credits | Monthly amounts (pattern detection) |
| Average balance | Computed |
| EMI debits | Recurring debit detection |
| Bounce/NACH returns | Flag count |

### ITR (Income Tax Return)

| Field | Extraction |
|-------|------------|
| Assessment year | AY XXXX-XX |
| Total income | Gross total income |
| Taxable income | Net taxable |
| Name | Assessee name |
| PAN | PAN number |

### GST Documents

| Field | Extraction |
|-------|------------|
| GSTIN | 15-char GST number |
| Business name | Legal name |
| Registration date | Date |
| Turnover | If visible in GSTR |

### Property Documents

| Document | Fields |
|----------|--------|
| Sale deed | Buyer, seller, property address, value, date |
| Property tax | Owner, address, assessed value |
| Approved plan | Plot area, construction area |

### Vehicle Documents

| Document | Fields |
|----------|--------|
| Invoice | Dealer, vehicle make/model, on-road price |
| RC book | Owner, vehicle number, registration date |
| Insurance | Policy number, validity |

## 15.3 OCR Quality Thresholds

| Confidence | Action |
|------------|--------|
| > 0.95 | Auto-verify (if cross-ref passes) |
| 0.80–0.95 | Auto-verify with flag for spot check |
| 0.60–0.80 | Manual review required |
| < 0.60 | Reject; request re-upload |

---

# 16. KNOWLEDGE BASE ARCHITECTURE

## 16.1 Knowledge Source Categories

| Category | Content | Owner | Update Frequency |
|----------|---------|-------|------------------|
| **Bank policies** | Individual bank lending policies | Compliance + Admin | On lender update |
| **Lender policies** | NBFC/fintech policies | Compliance + Admin | On lender update |
| **Product policies** | KuberOne product rules, eligibility | Product team | On product change |
| **FAQs** | Customer-facing Q&A | Content team | Monthly |
| **SOPs** | Standard operating procedures | Operations | On process change |
| **Training materials** | DSA/partner training content | Training team | Quarterly |
| **Sales scripts** | Call scripts, objection handling | Sales Head | Monthly |
| **Regulatory** | RBI guidelines, DPDP, fair practice | Compliance | On regulatory change |

## 16.2 Knowledge Base Structure

| Entity | Table | Key Fields |
|--------|-------|------------|
| Article | `kb_articles` | title, content, category, productCode, tags, version |
| FAQ | `kb_faqs` | question, answer, category, productCode |
| SOP | `kb_articles` (type=SOP) | process, steps, roles |
| Script | `kb_sales_scripts` | scenario, script, objections |
| RAG source | `rag_sources` | chunk, embedding, metadata |
| Policy | `kb_articles` (type=POLICY) | lender, product, effective dates |

## 16.3 Knowledge Ownership

| Role | Responsibility |
|------|----------------|
| **Compliance** | Bank/lender policies, regulatory content |
| **Product** | Product policies, eligibility rules documentation |
| **Content Manager** | FAQs, customer-facing articles |
| **Sales Head** | Sales scripts |
| **Training Manager** | Training materials |
| **Admin** | CMS operations, publish workflow |
| **AI Team** | RAG index quality, retrieval testing |

## 16.4 Knowledge Freshness Policy

| Content Type | Max Age Before Review | Alert |
|--------------|----------------------|-------|
| Lender policies | 90 days | Stale flag in RAG |
| Product policies | 60 days | Stale flag |
| FAQs | 180 days | Review reminder |
| SOPs | 90 days | Review reminder |
| Sales scripts | 60 days | Review reminder |
| Regulatory | On publication of change | Immediate update required |

---

# 17. RAG ARCHITECTURE

## 17.1 RAG Pipeline Overview

```
Knowledge Source → Ingestion → Chunking → Embedding → Vector Store
    → (at query time) Query Embedding → Retrieval → Reranking
    → Prompt Assembly → LLM Generation → Source Attribution
```

## 17.2 Knowledge Ingestion

*Detailed in Section 18.*

## 17.3 Document Chunking

| Parameter | Value |
|-----------|-------|
| Chunk size | 500 tokens |
| Overlap | 50 tokens |
| Splitter | Recursive character (respect paragraphs, headers) |
| Metadata per chunk | sourceId, title, category, productCode, chunkIndex, version |
| Max chunks per document | 200 |
| Min chunk size | 100 tokens (merge smaller) |

## 17.4 Embeddings

| Attribute | Value |
|-----------|-------|
| Model | `text-embedding-3-small` (OpenAI) |
| Dimensions | 1536 |
| Batch size | 100 chunks per API call |
| Normalization | L2 normalize before storage |
| Cache | Embedding cache for identical text (hash-based) |

## 17.5 Vector Storage Strategy

### Phase 1 (Launch — < 100K chunks)

| Attribute | Value |
|-----------|-------|
| Storage | MySQL `rag_sources` table |
| Embedding column | `JSON` array (1536 floats) |
| Search | Application-layer cosine similarity |
| Index | Product code + category B-tree filter; then brute-force cosine on filtered set |
| Performance | < 200ms for 10K filtered chunks |
| Cache | Redis cache for frequent queries (Phase 2) |

### Phase 2 (Growth — 100K–1M chunks)

| Attribute | Value |
|-----------|-------|
| Storage | **pgvector** extension on PostgreSQL sidecar OR **Qdrant** self-hosted |
| Index | HNSW index for approximate nearest neighbor |
| Search | Hybrid: vector similarity + keyword (BM25) |
| Performance | < 50ms retrieval |
| Filtering | Metadata filters (product, category, lender) |

### Phase 3 (Scale — 1M+ chunks)

| Attribute | Value |
|-----------|-------|
| Storage | Qdrant Cloud or Pinecone |
| Features | Multi-tenant namespaces per product |
| Hybrid search | Dense + sparse vectors |
| Reranking | Cross-encoder reranker (Cohere or local) |

## 17.6 Retrieval

| Step | Detail |
|------|--------|
| 1 | Embed user query |
| 2 | Apply metadata filters (productCode, category, isActive) |
| 3 | Cosine similarity search → top-20 candidates |
| 4 | Rerank (Phase 2) → top-5 |
| 5 | Deduplicate overlapping chunks from same source |
| 6 | Check freshness (warn if source > 90 days old) |
| 7 | Format for prompt injection |

**Retrieval parameters:**

| Parameter | Value |
|-----------|-------|
| Top-K (retrieval) | 20 |
| Top-K (after rerank) | 5 |
| Min similarity threshold | 0.7 |
| Max chunk tokens in prompt | 2,000 total |

## 17.7 Ranking (Phase 2 Reranker)

| Factor | Weight |
|--------|--------|
| Vector similarity | 40% |
| Keyword match (BM25) | 20% |
| Source authority (policy > FAQ) | 15% |
| Freshness (recency) | 10% |
| Product relevance | 15% |

## 17.8 Prompt Assembly

| Section | Content |
|---------|---------|
| System prompt | Role, rules, limitations, language |
| RAG context | "Reference material:" + formatted chunks with source IDs |
| Customer context | Profile summary (no PII beyond name) |
| Conversation history | Recent messages |
| User query | Current message |
| Instruction | "Answer based on reference material. Cite sources. If unsure, say so." |

## 17.9 Response Generation

| Post-processing | Action |
|-----------------|--------|
| Source attribution | Append "[Source: {title}]" for policy claims |
| Disclaimer | Append if financial advice detected |
| Structured cards | Extract product/lender recommendations as JSON |
| Language | Respond in detected/selected language |
| Length limit | Truncate if > 1,000 tokens |

---

# 18. KNOWLEDGE INGESTION PIPELINE

## 18.1 Ingestion Sources

| Source Type | Format | Ingestion Method |
|-------------|--------|------------------|
| PDF | Bank/lender policy PDFs | Upload → text extraction (pdf-parse) |
| DOCX | Internal SOPs, training docs | Upload → text extraction (mammoth) |
| HTML/Markdown | FAQs, articles from CMS | Direct from KB CMS |
| Structured JSON | Product policies, eligibility rules | Auto-sync from product DB |
| Manual text | Sales scripts, quick updates | CMS text editor |
| Web scrape (Phase 2) | Public lender rate pages | Scheduled scraper (with approval) |

## 18.2 Ingestion Pipeline Steps

| Step | Worker | Action |
|------|--------|--------|
| 1 | Admin/Compliance | Upload or publish content in KB CMS |
| 2 | Event | `KB_CONTENT_UPDATED` emitted |
| 3 | `rag-index.worker` | Picks up event |
| 4 | Extract | Parse document to plain text |
| 5 | Clean | Remove headers/footers, normalize whitespace |
| 6 | Metadata | Tag: category, productCode, lender, version, author |
| 7 | Chunk | Split into 500-token chunks with overlap |
| 8 | Embed | Batch embed via OpenAI Embeddings API |
| 9 | Store | Upsert chunks in `rag_sources` (replace old version) |
| 10 | Validate | Run 3 test queries; verify retrieval quality |
| 11 | Event | `RAG_SOURCE_INDEXED` |
| 12 | Notify | Admin dashboard shows index status |

## 18.3 Versioning

| Rule | Implementation |
|------|----------------|
| New version | Increment `version`; mark old chunks `isActive = false` |
| History | Old versions retained for audit (not in retrieval) |
| Rollback | Reactivate previous version chunks |
| Diff | Store change summary between versions |

## 18.4 Manual Upload Flow (Admin)

| Step | UI |
|------|-----|
| 1 | Admin → Knowledge → Upload document |
| 2 | Select file (PDF/DOCX) |
| 3 | Fill metadata: title, category, product, lender, tags |
| 4 | Preview extracted text |
| 5 | Submit → ingestion pipeline triggered |
| 6 | Monitor indexing status in RAG Index Status panel |

## 18.5 Bulk Ingestion (Phase 2)

| Method | Detail |
|--------|--------|
| ZIP upload | Multiple PDFs with metadata CSV |
| API sync | Lender portal policy API (future) |
| Scheduled | Nightly sync of product DB policies |

---

# 19. PROMPT ENGINEERING FRAMEWORK

## 19.1 Prompt Registry

| Storage | `ai_prompts` table |
|---------|-------------------|
| Fields | id, name, category, version, template, variables, isActive, createdAt |
| Versioning | Semantic version (v1.0, v1.1); only one active per name |
| A/B testing | Multiple versions with traffic split (Phase 2) |

## 19.2 System Prompts

| Prompt Name | Used By | Key Instructions |
|-------------|---------|------------------|
| `advisor_system_v1` | AI Advisor | Persona, languages, limitations, disclaimer |
| `copilot_system_v1` | Sales Copilot | Internal assistant, structured output, SoD |
| `voice_system_v1` | Voice AI | Concise responses, conversational tone |
| `support_system_v1` | Support AI | FAQ-focused, escalation rules |
| `management_system_v1` | Management AI | Aggregated data only, narrative insights |
| `ocr_system_v1` | Document OCR | Field extraction schema per doc type |

**Advisor system prompt structure:**

| Section | Content |
|---------|---------|
| Identity | "You are KuberOne AI Advisor by Kuber Finserve" |
| Role | Loan guidance expert for Indian market |
| Languages | Respond in user's language (EN/HI/Hinglish) |
| Rules | 10 limitations (Section 4.5) |
| RAG instruction | "Use reference material; cite sources" |
| Tone | Professional, warm, simple language |
| Disclaimer | "This is guidance, not a loan approval" |
| Output format | Text + optional structured recommendations |

## 19.3 Role Prompts

| Role | Prompt Addition |
|------|-----------------|
| Customer (Advisor) | Full product access; own data only |
| Sales (Copilot) | Lead/application context; NBA focus |
| Credit (Copilot read) | Risk analysis; no decision authority |
| Support | Ticket context; FAQ focus |
| Management | Aggregated metrics only; no PII |

## 19.4 Product Prompts

| Product | Injected Context |
|---------|------------------|
| HL-01 | Home loan rules, LTV, age, income thresholds |
| LAP-01 | LAP rules, property types, LTV |
| BL-01 | Business loan rules, vintage, turnover |
| AL-01 | Auto loan rules, LTV, vehicle age |
| (per variant) | Variant-specific rules (BT, Top-Up, etc.) |

## 19.5 Eligibility Prompts

| Prompt | Purpose |
|--------|---------|
| `eligibility_explain_v1` | Explain eligibility engine result in simple language |
| `eligibility_collect_v1` | Ask for missing eligibility parameters |
| `eligibility_alternative_v1` | Suggest alternatives when ineligible |

## 19.6 Sales Prompts

| Prompt | Purpose |
|--------|---------|
| `copilot_lead_insight_v1` | Generate lead insights JSON |
| `copilot_nba_v1` | Generate next best action |
| `copilot_approval_predict_v1` | Approval probability analysis |
| `copilot_missing_docs_v1` | Document deficiency message |
| `copilot_followup_v1` | Follow-up suggestion |

## 19.7 Compliance Prompts

| Injection | Always appended |
|-----------|----------------|
| Financial disclaimer | "This is not a loan approval or guarantee" |
| Rate disclaimer | "Rates are indicative and subject to lender approval" |
| PII warning | "Do not repeat customer's PAN, Aadhaar, or account numbers" |
| Regulatory | "Follow RBI fair practice guidelines" |
| DPDP | "Customer data used with consent only" |
| No competitor disparagement | "Do not criticize specific lenders" |

## 19.8 Prompt Variables

| Variable | Source |
|----------|--------|
| `{{customer_name}}` | Profile (first name only) |
| `{{product_code}}` | Current product context |
| `{{application_stage}}` | LOS stage |
| `{{language}}` | User language preference |
| `{{rag_context}}` | Retrieved chunks |
| `{{eligibility_result}}` | Engine output JSON |
| `{{lead_score}}` | Lead scoring output |

## 19.9 Prompt Governance

| Practice | Detail |
|----------|--------|
| All prompts in DB | No hardcoded prompts in code |
| Review before activate | Compliance + AI lead approval |
| Change log | Every prompt change audited |
| Test suite | 20 test queries per prompt version |
| Rollback | One-click revert to previous version |
| Token audit | Log token count per prompt version |

---

# 20. AI VOICE ASSISTANT

## 20.1 Voice Architecture

```
Customer speaks → STT → Text → Intent Detection → LLM (Advisor logic)
    → Text response → TTS → Audio playback
```

## 20.2 Speech To Text (STT)

| Provider | Use Case |
|----------|----------|
| **OpenAI Whisper API** | Phase 1 — batch transcription |
| **Deepgram** | Phase 1 — real-time streaming STT |
| **OpenAI Realtime API** | Phase 2 — native voice-to-voice |

| Configuration | Value |
|---------------|-------|
| Language | en, hi (auto-detect) |
| Sample rate | 16kHz |
| Format | PCM / Opus |
| Noise handling | Client-side noise suppression |

## 20.3 Intent Detection (Voice)

Same intent taxonomy as chat (Section 6.1) with voice-specific additions:

| Intent | Voice Example |
|--------|---------------|
| `CALLBACK_REQUEST` | "Call me back tomorrow" |
| `APPOINTMENT` | "Book an appointment" |
| `REPEAT` | "Can you repeat that?" |
| `SPEAK_SLOWER` | "Speak slower please" |

## 20.4 LLM Processing

| Approach | Detail |
|----------|--------|
| Phase 1 | STT text → same Advisor chat pipeline → TTS output |
| Phase 2 | OpenAI Realtime API — native audio-in/audio-out |
| Context | Same context builder as chat |
| RAG | Same RAG retrieval (responses spoken, not displayed) |
| Response length | Shorter responses for voice (max 150 words) |

## 20.5 Text To Speech (TTS)

| Provider | Voice |
|----------|-------|
| **OpenAI TTS** | `nova` (female, warm) for EN; Phase 2 Hindi voice |
| **ElevenLabs** | Phase 2 — custom KuberOne branded voice |

| Configuration | Value |
|---------------|-------|
| Speed | 1.0x (adjustable 0.8–1.2) |
| Format | MP3 / Opus stream |
| Language | Match detected language |

## 20.6 Voice-Specific Capabilities

| Capability | Description |
|------------|-------------|
| Appointment booking | Schedule callback with sales executive |
| Callback requests | Request call at preferred time |
| Status queries | "What is my loan status?" (spoken) |
| EMI queries | "What is EMI for 30 lakh?" (spoken answer) |
| Product inquiry | "Tell me about home loans" (spoken) |
| Language switch | "Hindi mein bolo" → switch to Hindi |

---

# 21. VOICE AI CALL FLOW

## 21.1 In-App Voice Session Flow

| Step | Actor | Action |
|------|-------|--------|
| 1 | Customer | Tap voice button on Advisor screen |
| 2 | App | Request microphone permission |
| 3 | App | Initialize voice session via API |
| 4 | System | Play greeting (TTS): "Hello, I'm KuberOne AI Advisor" |
| 5 | Customer | Speaks query |
| 6 | STT | Stream audio → transcribe |
| 7 | System | Intent detection + processing (same as chat) |
| 8 | System | Generate response (RAG + LLM) |
| 9 | TTS | Stream audio response |
| 10 | Customer | Continues conversation or ends |
| 11 | System | Store session transcript |
| 12 | App | Show text transcript alongside audio |

## 21.2 Incoming Call Flow (Phase 3 — Outbound/Inbound)

| Step | Action |
|------|--------|
| 1 | Call initiated (outbound campaign or inbound IVR) |
| 2 | Greeting + language selection (DTMF or voice) |
| 3 | Authentication (phone number match or OTP) |
| 4 | Intent recognition from spoken query |
| 5 | Process via Advisor logic |
| 6 | Spoken response |
| 7 | If escalation needed → warm transfer to human |
| 8 | Call summary logged; ticket created if needed |
| 9 | Call recording stored (with consent) |

## 21.3 Authentication (Voice)

| Method | Flow |
|--------|------|
| Registered user | Phone number from SIM/caller ID → match customer |
| OTP verification | "I'll send an OTP to your registered number" → DTMF/voice OTP |
| Guest | Limited capabilities (product info, EMI calc only) |

## 21.4 Intent Recognition (Voice-Specific)

| Handling | Detail |
|----------|--------|
| Low confidence | "I didn't catch that. Could you repeat?" |
| Multiple intents | "I heard two things — let me help with {primary} first" |
| Silence > 5s | "Are you still there? I'm here to help." |
| Background noise | "There's some background noise — please speak clearly" |

## 21.5 Transfer To Human

| Trigger | Transfer Target |
|---------|-----------------|
| Customer requests human | Sales Executive (if business hours) or callback scheduling |
| Complex complaint | Support Team |
| Authentication failure | Support Team |
| 3 failed intent recognitions | Support Team |
| Credit-specific query | Schedule callback with sales |

**Warm transfer:** AI summarizes conversation for human agent before transfer.

## 21.6 Call Closure

| Element | Content |
|---------|---------|
| Summary | "To summarize, we discussed {topics}" |
| Next steps | "Your next step is {action}" |
| Feedback | "Was this helpful?" (voice or app) |
| Goodbye | "Thank you for using KuberOne. Have a great day!" |
| Log | Full transcript + duration + intents + outcome |

---

# 22. CUSTOMER SUPPORT AI

## 22.1 Support AI Overview

| Attribute | Value |
|-----------|-------|
| **Name** | KuberOne Support AI |
| **Channels** | Customer App (chat), in-ticket (CRM) |
| **Scope** | FAQ, status, documents, eligibility — not complaints |
| **Escalation** | Creates support ticket when unable to resolve |

## 22.2 FAQ Handling

| Method | RAG retrieval from FAQ knowledge base |
|--------|--------------------------------------|
| Threshold | Similarity > 0.85 → auto-answer |
| Below threshold | "Let me connect you with our support team" |
| Categories | General, application, KYC, EMI, referral, technical |

## 22.3 Status Queries

| Query | Response |
|-------|----------|
| "Where is my application?" | Fetch application → explain current stage in simple language |
| "When will I get sanctioned?" | Explain typical TAT for stage; no guarantee |
| "Why is my application delayed?" | Check deficiencies, SLA; explain reason |
| "Is my document verified?" | Check document status per type |

## 22.4 Document Queries

| Query | Response |
|-------|----------|
| "What documents are pending?" | List deficiencies from checklist |
| "Why was my document rejected?" | Rejection reason + re-upload guide |
| "How do I upload documents?" | Step-by-step guide |

## 22.5 Eligibility Queries

| Handling | Route to eligibility AI (Section 9) |
|----------|--------------------------------------|

## 22.6 Escalations

| Condition | Action |
|-----------|--------|
| Complaint detected | Auto-create ticket (COMPLAINT category) |
| 2 failed resolution attempts | Offer human agent |
| User requests human | Create ticket; notify support |
| Technical issue (app bug) | Create ticket (TECHNICAL category) |
| Account locked | Escalate to support with priority |

---

# 23. MANAGEMENT AI

## 23.1 Purpose

Generate **narrative insights** from aggregated business data for leadership — no raw PII, no operational actions.

## 23.2 Revenue Insights

| Insight | Data Source | Example Output |
|---------|-------------|----------------|
| MTD disbursement trend | Analytics snapshots | "Disbursement up 12% MoM driven by HL growth" |
| Revenue forecast | Historical + pipeline | "Projected ₹X Cr disbursement this month" |
| Product mix shift | Product analytics | "BL share increased from 18% to 22%" |
| Commission trend | Commission ledger | "Commission payout up 8% with volume" |
| Regional performance | Branch analytics | "South region leading at ₹X Cr" |

## 23.3 Lead Insights

| Insight | Example |
|---------|---------|
| Pipeline health | "2,400 active leads; 340 HOT (A+)" |
| Conversion trend | "Lead-to-application conversion at 32%, up 3pp" |
| Source shift | "DSA leads growing 15% while digital flat" |
| SLA risk | "45 leads breaching SLA today — action needed" |

## 23.4 Conversion Insights

| Insight | Example |
|---------|---------|
| Funnel bottleneck | "Biggest drop-off at Documentation stage (S03)" |
| Product conversion | "HL converts at 28%; AL at 45%" |
| AI impact | "Customers using AI Advisor convert 18% higher" |
| Time to convert | "Average lead-to-disbursement: 28 days" |

## 23.5 Performance Insights

| Insight | Example |
|---------|---------|
| Branch ranking | "Mumbai branch #1; Pune improving fastest" |
| Partner productivity | "Top 10 DSAs drive 40% of volume" |
| Team performance | "Sales team SLA compliance at 87%" |
| Processing TAT | "Credit review TAT improved to 3.2 days" |

## 23.6 Forecasting (Phase 2)

| Forecast | Method |
|----------|--------|
| Disbursement forecast | Time-series on historical + pipeline weighted |
| Revenue forecast | Disbursement × avg commission rate |
| Lead volume forecast | Historical + campaign calendar |
| Partner growth | Activation rate trend |

**Delivery:** Weekly AI-generated narrative in CEO dashboard + email digest.

---

# 24. AI ANALYTICS

## 24.1 Conversation Metrics

| Metric | Definition |
|--------|------------|
| Sessions/day | Total AI advisor sessions |
| Messages/session | Average messages per session |
| Session duration | Average time in conversation |
| Intent distribution | % per intent type |
| Language distribution | EN / HI / Hinglish split |
| Escalation rate | % sessions escalated to human |
| User satisfaction | Thumbs up/down ratio |
| Response latency (p50/p95) | Time to first token |
| Token usage | Per session, per day, per user |

## 24.2 Lead Conversion Impact

| Metric | Measurement |
|--------|-------------|
| AI-assisted conversion | Conversion rate for leads/customers who used AI |
| Non-AI conversion | Baseline conversion rate |
| Lift | % improvement attributed to AI |
| Eligibility-to-application | % who check eligibility then apply |
| Advisor-to-application | % who chat then start application |
| Time to convert | AI users vs non-AI users |

## 24.3 Recommendation Accuracy

| Metric | Measurement |
|--------|-------------|
| Product recommendation acceptance | % users who start recommended product |
| Lender recommendation acceptance | % applications with recommended lender |
| Eligibility accuracy | % eligibility predictions matching actual outcome |
| Approval prediction accuracy | Copilot approval probability vs actual (Brier score) |
| Document guidance accuracy | % correct document lists (no deficiencies) |

## 24.4 Resolution Rate (Support AI)

| Metric | Definition |
|--------|------------|
| Auto-resolution rate | % queries answered without escalation |
| First-contact resolution | % resolved in one interaction |
| Escalation rate | % transferred to human |
| CSAT (AI-handled) | Satisfaction for AI-resolved queries |

## 24.5 AI Adoption

| Metric | Tracking |
|--------|----------|
| DAU (AI features) | Daily active AI users |
| MAU (AI features) | Monthly active AI users |
| Copilot adoption | % sales executives using copilot daily |
| Voice adoption | % customers using voice feature |
| Feature penetration | % of eligible users who tried AI |
| Retention | % users who return to AI within 7 days |

## 24.6 Cost Analytics

| Metric | Tracking |
|--------|----------|
| Daily OpenAI spend | $ by product (advisor, copilot, voice, OCR) |
| Cost per session | Average $ per advisor session |
| Cost per lead scored | $ per lead scoring call |
| Token efficiency | Output quality / tokens used |
| Budget alerts | 80% and 100% of monthly budget |

## 24.7 Analytics Dashboard (Admin)

| Screen | `/admin/ai/analytics` |
|--------|----------------------|
| Widgets | All metrics above as charts |
| Filters | Date range, product, channel, role |
| Export | CSV/PDF report |

---

# 25. AI SECURITY

## 25.1 Prompt Injection Protection

| Attack Type | Defense |
|-------------|---------|
| Direct injection ("Ignore instructions") | System prompt hardening; role anchoring |
| Indirect injection (via RAG content) | RAG content sanitization; source trust levels |
| Jailbreak attempts | Refuse list in system prompt; output filter |
| Role-play attacks | "You are always KuberOne AI Advisor" anchoring |
| Data exfiltration | No system prompt disclosure; no other user data |
| Encoding attacks | Input normalization; reject base64/hex payloads |

**Testing:** Monthly red-team prompt injection test suite (50+ attack vectors).

## 25.2 PII Protection

| PII Type | In Prompts | In Logs | In Responses |
|----------|------------|---------|--------------|
| Phone | Masked (last 4) | Masked | Never repeat |
| PAN | Never in prompt | Never logged | Never repeat |
| Aadhaar | Never in prompt | Never logged | Never repeat |
| Bank account | Never in prompt | Never logged | Never repeat |
| Full name | First name only | Masked | First name only |
| Address | City only | Not logged | City only |
| Income | Included (needed) | Not logged | Rounded |

## 25.3 Access Controls

| Control | Implementation |
|---------|----------------|
| AI endpoints | JWT + RBAC per API specification |
| Customer AI | Own data only (customerId from JWT) |
| Copilot | Role-scoped (sales sees assigned; mgr sees branch) |
| Management AI | Aggregated data only; no individual records |
| KB admin | Admin + Content Manager roles |
| Prompt admin | Super Admin + AI lead |
| RAG index | Admin trigger only |

## 25.4 Audit Logs

| Event | Logged |
|-------|--------|
| AI session started | sessionId, userId, channel, timestamp |
| AI message sent | sessionId, intent, tokenCount (no message content with PII) |
| AI recommendation made | sessionId, recommendationType, productCode |
| Copilot insight generated | userId, entityType, entityId, insightType |
| Prompt version changed | actorId, promptName, oldVersion, newVersion |
| RAG content indexed | sourceId, chunkCount, actorId |
| AI feedback received | sessionId, rating, timestamp |
| Escalation triggered | sessionId, target, reason |
| OCR processed | documentId, docType, confidence (no extracted PII in log) |

## 25.5 Data Privacy

| Principle | Implementation |
|-----------|----------------|
| DPDP compliance | Consent before using profile data in AI |
| Data minimization | Only necessary fields in prompts |
| No training on user data | OpenAI API with data opt-out; no fine-tuning on conversations |
| Retention | Conversation metadata 2 years; messages 90 days; then anonymize |
| Right to deletion | Customer deletion request removes AI sessions |
| Cross-border | OpenAI API data processing agreement reviewed |

## 25.6 Compliance

| Requirement | AI Implementation |
|-------------|-------------------|
| RBI fair practice | No guaranteed approval language |
| DPDP Act | Consent capture; data minimization; deletion rights |
| No misleading advice | Disclaimers on every session |
| Audit readiness | Full audit trail on AI interactions |
| SoD | AI cannot approve credit or disburse |
| Quarterly review | AI responses audited by Compliance |

---

# 26. HUMAN ESCALATION FRAMEWORK

## 26.1 Escalation Matrix

| Condition | Target | Channel | SLA |
|-----------|--------|---------|-----|
| User requests human | Sales Executive (if lead) / Support (if issue) | In-app ticket + push | 4 hours |
| Complaint detected | Support Team → Compliance if serious | Ticket (COMPLAINT) | 1 hour |
| AI confidence < 0.5 | Sales Executive | Ticket + notification | 4 hours |
| 3+ negative sentiment messages | Support Team | Ticket (priority HIGH) | 2 hours |
| Credit question beyond AI | Sales Executive | Callback scheduling | Next business day |
| Application stuck > 7 days | RM (if assigned) or Sales Executive | Notification + ticket | 24 hours |
| Regulatory/compliance query | Compliance Team | Ticket (COMPLIANCE) | 24 hours |
| Technical app issue | Support Team | Ticket (TECHNICAL) | 4 hours |
| Fraud suspicion (AI detected) | Compliance Team | Fraud case creation | 1 hour |
| Loan modification post-sanction | Operations Executive | Ops ticket | 24 hours |
| Partner/DSA escalation | Branch Manager | Notification | 4 hours |
| VIP/high-value lead (A+, > ₹1Cr) | Branch Manager + Sales Executive | Priority notification | 1 hour |

## 26.2 Sales Executive Escalation

| Handoff Package |
|-----------------|
| Full conversation transcript |
| Customer profile summary |
| Lead/application context |
| AI recommendations made |
| Identified intent and unresolved questions |
| Suggested next action from copilot |

## 26.3 Relationship Manager Escalation

| Trigger | Portfolio customer with service need or cross-sell opportunity |
|---------|----------------------------------------------------------------|
| Handoff | Customer 360 summary + AI conversation + portfolio context |

## 26.4 Support Team Escalation

| Trigger | Technical issues, complaints, general support |
|---------|---------------------------------------------|
| Handoff | Ticket with AI conversation attached + customer context |

## 26.5 Branch Manager Escalation

| Trigger | VIP leads, partner issues, SLA breaches, team escalations |
|---------|----------------------------------------------------------|
| Handoff | Branch-scoped summary + escalation reason + recommended action |

## 26.6 Escalation UX

| Element | Implementation |
|---------|----------------|
| In-chat button | "Talk to a human advisor" always visible |
| Confirmation | "I'll connect you with our team. They'll have our conversation history." |
| Wait estimate | "Our team typically responds within {SLA}" |
| Ticket created | Show ticket number; link to support screen |
| Notification | Push/email to assigned human |
| Feedback | Post-escalation CSAT survey |

---

# 27. AI GOVERNANCE

## 27.1 Approval Policies

| Change Type | Approver | Process |
|-------------|----------|---------|
| New prompt version | AI Lead + Compliance | Test suite → review → activate |
| New knowledge content (policy) | Compliance + Product | Review → publish → index |
| Model change (e.g., GPT-4o → next) | CTO + AI Lead | Benchmark → staged rollout |
| New AI feature | CTO + Product Owner | Architecture review → phased launch |
| Prompt injection fix | AI Lead | Emergency deploy with audit |
| Cost budget increase | CTO + Finance | Business case required |

## 27.2 Model Updates

| Practice | Detail |
|----------|--------|
| Model version pinned | `gpt-4o-2024-08-06` (example) in config |
| Update process | Test on staging → 10% traffic → 100% over 1 week |
| Benchmark | 50 test queries compared old vs new model |
| Rollback | Previous model version in config; instant switch |
| Monitoring | Error rate, latency, satisfaction during rollout |

## 27.3 Knowledge Updates

| Trigger | Action |
|---------|--------|
| Lender policy change | Compliance uploads → reindex within 24h |
| Product rule change | Auto-sync from product DB → reindex |
| Regulatory change | Compliance review → urgent reindex |
| FAQ update | Content manager → standard reindex |
| Quarterly review | Review all content freshness flags |

## 27.4 Monitoring

| Monitor | Alert Threshold |
|---------|-----------------|
| Response latency p95 | > 5 seconds |
| Error rate | > 2% of requests |
| Escalation rate spike | > 2× daily average |
| Negative feedback spike | > 20% thumbs down |
| Token cost daily | > 120% of budget |
| RAG retrieval quality | Avg similarity < 0.75 |
| Prompt injection attempts | > 10/day |
| OCR confidence drop | Avg < 0.80 |

## 27.5 Audit

| Audit Type | Frequency | Owner |
|------------|-----------|-------|
| AI response quality review | Weekly | AI Lead |
| Prompt version audit | Monthly | AI Lead + Compliance |
| Knowledge freshness audit | Monthly | Content Manager |
| Security red-team | Quarterly | Security + AI Lead |
| Cost review | Monthly | Finance + AI Lead |
| Regulatory compliance review | Quarterly | Compliance |
| Board AI report | Quarterly | CTO |

---

# 28. FUTURE AI AGENTS

## 28.1 Expansion Architecture

New agents follow the **same architecture pattern** — new prompt family, new RAG sources, new module path — without redesigning the AI platform.

```
apps/backend/src/modules/ai/
├── advisor/          # Existing
├── copilot/          # Existing
├── voice/            # Existing
├── support/          # Existing
├── management/       # Existing
├── insurance/        # Future
├── cards/            # Future
├── wealth/           # Future
├── collections/      # Future
└── renewal/          # Future
```

## 28.2 Future Agent Registry

| Agent | Domain | RAG Sources | Channel | Phase |
|-------|--------|-------------|---------|-------|
| **Insurance Advisor** | Insurance products | INS policies, IRDA guidelines | Customer App | Year 2 |
| **Credit Card Advisor** | Credit cards | Card policies, eligibility | Customer App | Year 2 |
| **Investment Advisor** | Mutual funds | MF policies, SEBI guidelines, fund factsheets | Customer App + CRM | Year 2 |
| **Wealth Advisor** | Portfolio management | Wealth products, tax guidelines | Customer App | Year 3 |
| **Collection Assistant** | Post-disbursement collections | Collection SOPs, payment policies | Outbound voice + SMS | Year 2 |
| **Renewal Assistant** | Top-up, BT, renewal | Product policies, customer history | Outbound + in-app | Year 2 |

## 28.3 Per-Agent Requirements

| Agent | New RAG Sources | New Prompts | New Intents | Integration |
|-------|-----------------|-------------|-------------|-------------|
| Insurance Advisor | 20+ insurance policy docs | advisor_insurance_system | 5 insurance intents | Product module |
| Credit Card Advisor | 10+ card policy docs | advisor_cards_system | 4 card intents | Product module |
| Investment Advisor | 50+ MF docs | advisor_mf_system | 6 MF intents | Wealth module |
| Wealth Advisor | Portfolio analysis prompts | wealth_system | 4 wealth intents | Wealth module |
| Collection Assistant | Collection SOPs | collection_system | 3 collection intents | LMS/notification |
| Renewal Assistant | Renewal policies | renewal_system | 3 renewal intents | Customer 360 |

## 28.4 Autonomous Agents (Year 3+)

| Agent | Autonomy Level | Human Oversight |
|-------|----------------|-----------------|
| Nurture Agent | Auto-send follow-up messages (approved templates) | Branch Manager reviews batch |
| Collection Agent | Auto-schedule collection calls | Ops Manager approves schedule |
| Renewal Agent | Auto-identify renewal candidates | RM confirms before outreach |
| Document Agent | Auto-request missing documents | Sales reviews before send |

**Principle:** Increasing autonomy requires increasing governance (Section 27).

---

# 29. DEVELOPMENT ROADMAP

## 29.1 Phase Overview

| Phase | Name | Weeks | Deliverables |
|-------|------|-------|--------------|
| **1** | AI Advisor + RAG | 1–6 | Chat advisor, RAG pipeline, KB CMS, English + Hindi |
| **2** | Lead Scoring | 7–9 | Qualification AI, scoring engine, CRM integration |
| **3** | Sales Copilot | 10–13 | Copilot drawer, predictions, NBA, document AI |
| **4** | Voice AI | 14–17 | Voice session, STT/TTS, callback booking |
| **5** | Management AI | 18–20 | Insights, analytics dashboard, governance |

## 29.2 Phase 1: AI Advisor + RAG Foundation (Weeks 1–6)

| Week | Deliverables |
|------|-------------|
| W1 | AI module scaffold; OpenAI client; prompt registry; guard rails |
| W1 | KB CMS (article + FAQ CRUD); `rag_sources` schema |
| W2 | Ingestion pipeline: PDF/DOCX → chunk → embed → store |
| W2 | RAG retrieval service; cosine search on MySQL |
| W3 | Chat engine: session, message, streaming (SSE) |
| W3 | Context builder; conversation state machine |
| W4 | Intent detection; eligibility AI integration |
| W4 | Product + lender recommendation in conversation |
| W5 | Customer App: ConversationScreen, chat UI, streaming |
| W5 | Document guidance; application assistance flows |
| W6 | Hindi language support; Hinglish (basic) |
| W6 | AI safety controls; audit logging; analytics foundation |
| W6 | Integration tests; 50-query test suite |

**Exit criteria:**
- [ ] AI Advisor answers product/eligibility questions accurately (80%+ test suite)
- [ ] RAG retrieves relevant policy content (similarity > 0.7)
- [ ] Streaming chat works in Customer App
- [ ] English + Hindi responses verified
- [ ] All safety controls operational
- [ ] Audit logs capturing AI interactions

## 29.3 Phase 2: Lead Scoring (Weeks 7–9)

| Week | Deliverables |
|------|-------------|
| W7 | Lead qualification AI service; rule + AI scoring merge |
| W7 | Grade assignment (A+ to Rejected); `lead_scores` integration |
| W8 | CRM: lead scoring panel; score on lead list |
| W8 | Auto-score on lead create/update events |
| W9 | Lead analytics: AI impact on conversion |
| W9 | DSA App: basic lead quality indicator |

**Exit criteria:**
- [ ] Leads auto-scored on creation
- [ ] Grades visible in CRM lead list and detail
- [ ] HOT leads trigger notification to sales executive
- [ ] Scoring test suite passes (known inputs → expected grades)

## 29.4 Phase 3: Sales Copilot (Weeks 10–13)

| Week | Deliverables |
|------|-------------|
| W10 | Copilot service; structured JSON output for insights |
| W10 | CRM CopilotDrawer component; copilot.slice |
| W11 | Approval + disbursal probability; risk analysis |
| W11 | Next Best Action engine |
| W12 | Missing documents detection; one-click actions |
| W12 | Document classification + OCR pipeline (PAN, Aadhaar) |
| W13 | Credit analysis AI panel; follow-up suggestions |
| W13 | Copilot analytics; feedback mechanism |

**Exit criteria:**
- [ ] Copilot drawer operational on lead/application screens
- [ ] NBA displayed with one-click actions
- [ ] Approval probability shown (advisory disclaimer)
- [ ] OCR extracts PAN and Aadhaar fields
- [ ] Document deficiency detected and surfaced

## 29.5 Phase 4: Voice AI (Weeks 14–17)

| Week | Deliverables |
|------|-------------|
| W14 | Voice session API; STT integration (Deepgram) |
| W14 | Customer App: VoiceStartScreen, VoiceSessionScreen |
| W15 | TTS integration (OpenAI TTS); audio streaming |
| W15 | Voice-specific intents; shorter response optimization |
| W16 | Callback request; appointment booking via voice |
| W16 | Hindi voice support |
| W17 | Voice transcript display; voice analytics |
| W17 | Voice safety controls; escalation via voice |

**Exit criteria:**
- [ ] In-app voice conversation works end-to-end
- [ ] STT accuracy acceptable for EN + HI (manual test)
- [ ] TTS responses natural and clear
- [ ] Callback booking creates ticket
- [ ] Voice sessions logged and auditable

## 29.6 Phase 5: Management AI + Governance (Weeks 18–20)

| Week | Deliverables |
|------|-------------|
| W18 | Management AI service; narrative insight generation |
| W18 | CEO + Director dashboard AI insight widgets |
| W19 | AI analytics dashboard (admin); cost monitoring |
| W19 | Support AI (FAQ auto-resolution) |
| W20 | AI governance tooling; prompt version management |
| W20 | Red-team security test; compliance audit |
| W20 | Production hardening; load test; documentation |

**Exit criteria:**
- [ ] Management dashboards show AI-generated insights
- [ ] AI analytics dashboard operational
- [ ] Support AI resolves 60%+ FAQ queries
- [ ] Governance processes documented and tooling ready
- [ ] Security red-team passed
- [ ] Production go-live approved

---

# APPENDIX A: OPENAI API USAGE MAP

| Use Case | API | Model | Est. Tokens/Call |
|----------|-----|-------|------------------|
| Advisor chat | Chat Completions | gpt-4o | 3,000–5,000 |
| Copilot insights | Chat Completions (JSON) | gpt-4o | 2,000–3,000 |
| Lead scoring AI | Chat Completions (JSON) | gpt-4o | 1,000–2,000 |
| Eligibility explain | Chat Completions | gpt-4o | 1,500–2,500 |
| RAG embedding | Embeddings | text-embedding-3-small | 500/chunk |
| OCR extraction | Chat Completions (Vision) | gpt-4o | 2,000–4,000 |
| Voice STT | Whisper / Realtime | whisper-1 | — |
| Voice TTS | TTS | tts-1 | — |
| Management insights | Chat Completions | gpt-4o | 3,000–5,000 |
| Moderation | Moderations | text-moderation-latest | 200 |
| Support FAQ | Chat Completions | gpt-4o-mini | 1,000–2,000 |

## Estimated Monthly Cost (Phase 1 — 10K MAU)

| Component | Est. Monthly Cost |
|-----------|-------------------|
| Advisor chat (5K sessions) | $150–300 |
| Copilot (2K daily calls) | $100–200 |
| RAG embeddings (10K chunks) | $5–10 |
| OCR (1K documents) | $50–100 |
| Voice (500 sessions) | $100–200 |
| Management (weekly) | $20–50 |
| **Total** | **$425–860/month** |

---

# APPENDIX B: AI API ENDPOINTS (Reference)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/advisor/sessions` | POST | Create session |
| `/ai/advisor/sessions` | GET | List sessions |
| `/ai/advisor/sessions/{id}` | GET | Session detail |
| `/ai/advisor/sessions/{id}/messages` | POST | Send message (SSE stream) |
| `/ai/advisor/feedback` | POST | Rate response |
| `/ai/copilot/leads/{id}/insights` | GET | Lead copilot insights |
| `/ai/copilot/applications/{id}/insights` | GET | Application copilot insights |
| `/ai/copilot/leads/{id}/nba` | GET | Next best action |
| `/ai/copilot/feedback` | POST | Rate copilot suggestion |
| `/ai/voice/sessions` | POST | Start voice session |
| `/ai/voice/sessions/{id}/audio` | POST | Send audio chunk |
| `/ai/voice/callback` | POST | Request callback |
| `/ai/voice/appointment` | POST | Book appointment |
| `/admin/knowledge/articles` | CRUD | KB CMS |
| `/admin/knowledge/rag/reindex` | POST | Trigger reindex |
| `/admin/ai/analytics` | GET | AI analytics dashboard |
| `/admin/ai/prompts` | CRUD | Prompt management |
| `/admin/settings/ai` | GET/PUT | AI configuration |

*Full API specification in [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md).*

---

# APPENDIX C: AI DATA MODEL (Reference)

| Table | Purpose |
|-------|---------|
| `chat_sessions` | Advisor/copilot/voice sessions |
| `chat_messages` | Message pairs (user + assistant) |
| `ai_recommendations` | Structured recommendations made |
| `ai_feedback` | User ratings (thumbs up/down) |
| `ai_copilot_insights` | Copilot-generated insights |
| `ai_predictions` | Approval/disbursal predictions |
| `ai_actions` | NBA actions suggested/executed |
| `ai_prompts` | Prompt registry with versions |
| `rag_sources` | Chunked knowledge with embeddings |
| `kb_articles` | Knowledge base articles |
| `kb_faqs` | FAQ entries |
| `kb_sales_scripts` | Sales scripts |
| `lead_scores` | Rule + AI combined scores |
| `ai_analytics_events` | Analytics event log |
| `ai_cost_logs` | Token usage and cost tracking |

*Full schema in [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md).*

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| Chief AI Architect | | | |
| Compliance Head | | | |
| Product Owner | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release |

---

# APPENDIX F: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | AI modules 16–18 implementation |
| [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) | Copilot drawer, CRM AI views |
| [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md) | Advisor + Voice UI |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | AI API endpoints |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product rules for AI |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | AI access controls |
| [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) | AI infra, OpenAI cost, voice stack deployment |

---

*End of Document — KuberOne AI + RAG Architecture v1.0*

