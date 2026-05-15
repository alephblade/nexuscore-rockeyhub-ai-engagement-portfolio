# RockeyHub — AI Engagement & Checkout Orchestration Platform

> **Powered by NexusCore AI**
> *Conversational intelligence, workflow automation, lead qualification and operational support layer.*

---

> **Note**: This repository is a curated AI Engagement and Creative Technology portfolio sample based on the design approach behind NexusCore AI and RockeyHub.
> It is **not** the full production codebase. It demonstrates how I design conversational workflows, WhatsApp Business journeys, lead qualification logic, product/catalog routing, checkout orchestration, automation rules, QA processes, and analytics-ready engagement systems — without exposing proprietary code, credentials, or sensitive infrastructure.

---

## Role

**Founder, Product Builder & AI Engagement Architect**

I designed NexusCore AI as a WhatsApp-first engagement engine and RockeyHub as a workflow layer for connecting conversational journeys, product education, checkout logic, and operational follow-up.

My work combines conversational AI, marketing automation, campaign continuity, WhatsApp Business workflows, product routing, service orchestration, QA, and analytics-ready decision flows.

---

## Live Product

🌐 **[rockeyhub.app](https://rockeyhub.app)** — The production platform is live and accessible.

A sandboxed demo account is available for professional evaluation:

| Field | Value |
|---|---|
| **URL** | [https://rockeyhub.app](https://rockeyhub.app) |
| **Email** | `demo@rockeyhub.app` |
| **Password** | `Beta.View.88#` |
| **Role** | Admin — Community Manager |

> Demo access may require account activation. If unavailable, contact via GitHub for a live walkthrough.

---

## What This Repository Demonstrates

- WhatsApp-first conversational workflow design and state machine architecture
- Lead qualification logic, intent detection, and product routing
- Checkout orchestration from conversational interface (WhatsApp → Stripe)
- AI integration: generative drafting (Gemini Flash), strategic advisory (Gemini Pro), semantic RAG (text-embedding-004)
- Human handoff rules and escalation logic
- Multi-tenant SaaS architecture with role-based access and RLS isolation
- Edge Function design (Deno serverless, idempotency, webhook handling)
- QA process for conversational and AI-assisted systems
- Analytics event structures and engagement tracking
- Compliance-aware messaging design for WhatsApp Business

---

## The Strategic Framing

> **Funnel Studio LATAM** captures and organizes leads.
> **NexusCore AI / RockeyHub** converses, qualifies, routes, and creates continuity.

This platform is the intelligent engagement layer that keeps campaigns alive after the first click.

---

## Operational Automation & Agentic Workflow Layer

This section documents the conceptual PMO-style automation layer behind RockeyHub / NexusCore AI. It shows how agentic workflows can coordinate tasks, decisions, risks, documentation, notifications, follow-up actions and operational visibility across campaign, sales, infrastructure and product workflows.

The operational agent is currently designed to be accessed through Telegram as an internal operator interface, allowing fast interaction with task updates, decision summaries, alerts and follow-up actions. WhatsApp may be added later as an additional channel for business-facing workflows.

See: [docs/AGENTIC_WORKFLOW_LAYER.md](docs/AGENTIC_WORKFLOW_LAYER.md)

---

## Repository Structure

```
nexuscore-rockeyhub-ai-engagement-portfolio/
│
├── README.md
├── CASE_STUDY.md                  ← Problem → Solution → Architecture
├── ARCHITECTURE.md                ← High-level system layers
├── CONVERSATIONAL_FLOW.md         ← State machine + intent table
├── WHATSAPP_WORKFLOW.md           ← Entry points, templates, compliance
├── CHECKOUT_ORCHESTRATION.md      ← Conversation → transaction logic
├── WHATSAPP_COMMERCE_FLOW.md      ← Technical state machine detail (Mermaid)
├── AI_INTEGRATION.md              ← NexusCore AI: three modes
├── AGENT_LOGIC.md                 ← Agent inputs, outputs, decision model
├── SAAS_ARCHITECTURE.md           ← Multi-tenant design + ViewState pattern
├── QA_CHECKLIST.md                ← QA for conversational + AI systems
├── COMPLIANCE_NOTES.md            ← WhatsApp Business compliance design
├── ANALYTICS_AND_TRACKING.md      ← Events, metrics, optimization loop
├── docs/
│   └── AGENTIC_WORKFLOW_LAYER.md  ← PMO-style automation and Telegram interaction
├── LICENSE.md
│
├── SAMPLE_DATA/
│   ├── user-intents.json
│   ├── conversation-states.json
│   ├── message-templates.json
│   ├── product-catalog-sample.json
│   ├── checkout-session-sample.json
│   ├── handoff-rules.json
│   ├── whatsapp-session-state.json
│   ├── lead-pipeline-sample.json
│   └── organization-config-sample.json
│
├── demo-modules/
│   ├── intent-classifier.js
│   ├── conversation-state-machine.js
│   ├── product-router.js
│   ├── checkout-flow-selector.js
│   ├── follow-up-message-generator.js
│   ├── human-handoff-trigger.js
│   ├── ai-prompt-builder.js
│   ├── role-permission-checker.js
│   └── conversational-flow-demo/
│       └── index.html             ← Interactive demo (open in browser)
│
└── ASSETS/
    ├── diagrams/
    └── screenshots/
```

---

## Interactive Demo

Zero setup required. Open in any browser:

```
demo-modules/conversational-flow-demo/index.html
```

Select market, user intent, lead stage, and channel — the demo returns the detected segment, conversation state, recommended message, next best action, handoff decision, QA checks, and tracking event.

---

## Architecture at a Glance

```
Traffic Source / Campaign
        ↓
Landing Page or wa.me Entry Point
        ↓
WhatsApp Business Conversation
        ↓
Intent Detection / State Machine
        ↓
Product or Service Routing
        ↓
Lead Qualification / Follow-up Logic
        ↓
Checkout or Human Handoff
        ↓
Tracking / Logs / Dashboard
        ↓
Optimization Loop
```

---

## License

**Portfolio Reference Only** — For professional review and evaluation only. Not licensed for reuse, redistribution, or commercial implementation. See [LICENSE.md](LICENSE.md).
