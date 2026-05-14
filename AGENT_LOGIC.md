# Agent Logic — NexusCore AI

> This document describes the decision model of NexusCore AI as an engagement agent: its inputs, outputs, decision rules, and operational context.

---

## Agent Purpose

NexusCore AI coordinates conversational engagement, operational follow-up, campaign continuity, and execution visibility across WhatsApp Business journeys.

It is not a general-purpose chatbot. It is a **task-oriented engagement agent** with a defined scope, bounded decision space, and structured outputs.

---

## Agent Inputs

| Input | Source | Type |
|---|---|---|
| User message | WhatsApp inbound | Text / Interactive reply ID |
| Conversation state | Session DB (`whatsapp_sessions`) | Enum |
| Session context | Session DB (`context_data`) | JSON |
| Lead stage | CRM (`leads` table) | Enum (new/warm/checkout-ready) |
| Product interest | Context accumulation | String (product_key) |
| Market | User selection | Enum (MX / US) |
| Campaign source | Entry point metadata | String |
| Checkout status | Order draft | Enum |
| Operational priority | Handoff rules | Boolean |

---

## Agent Outputs

| Output | Action |
|---|---|
| Recommended next message | Send via Meta Graph API |
| Route to product | Query catalog, send interactive list |
| Trigger follow-up | Schedule or send template message |
| Escalate to human | Transition to HANDOFF state; notify team |
| Update task | Update order draft or lead status in DB |
| Log decision | Write to `whatsapp_inbound_logs` |
| Update dashboard | Fire analytics event |

---

## Decision Model

```
Receive input
    ↓
Is input a global override? (human_help → HANDOFF)
    ↓ No
Is session in HANDOFF? → Ignore (silent)
    ↓ No
Is input recognized for current state?
    ↓ Yes                    ↓ No
Execute transition      Increment fallback counter
    ↓                        ↓
    ↓              fallback_count < 2 → Re-show menu
    ↓              fallback_count ≥ 2 → Offer HANDOFF
    ↓
Apply guardrails (at CHECKOUT_CONFIRM)
    ↓ Pass              ↓ Fail
Create Stripe session   → HANDOFF
    ↓
Send response(s)
Update session
Log event
```

---

## NexusCore AI Modes in Agent Context

| Situation | AI Mode Used |
|---|---|
| Leader composes WhatsApp message | **Gemini Flash** (Message Drafting) |
| Admin asks strategic question | **Gemini Pro** (Strategic Advisor) |
| Advisor retrieves org knowledge | **text-embedding-004** (RAG retrieval) |
| Bot handles WhatsApp conversation | **Rule-based state machine** (no LLM — deterministic) |

> The WhatsApp bot intentionally uses a **deterministic state machine**, not a generative AI model. This ensures predictability, auditability, and compliance-safe behavior in transactional flows.

---

## Boundaries and Scope

The agent does **not**:
- Make medical or income claims in automated messages
- Process payment outside Stripe-hosted UI
- Access other organizations' data
- Modify its own role or permissions
- Continue operating in HANDOFF state (silent until human resets)
- Generate checkout links if any guardrail fails

---

## Future Agent Evolution (Roadmap Context)

| Phase | Capability |
|---|---|
| Current | Deterministic state machine + rule-based routing |
| Phase 2 | Intent classification via NexusCore AI (Gemini) for free-text inputs |
| Phase 3 | RAG-augmented product advisor within WhatsApp thread |
| Phase 4 | Autonomous follow-up scheduling based on lead stage signals |
