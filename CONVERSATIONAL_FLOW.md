# Conversational Flow — NexusCore AI State Design

> This document describes the conversational flow architecture used in NexusCore AI / RockeyHub — from initial contact to checkout or follow-up.

---

## High-Level Conversation Journey

```
START
  ↓
Greeting / Opt-in Context
  ↓
Market Selection (MX / USA)
  ↓
Intent Detection
  ↓
Product Interest / Education
  ↓
Objection Handling / Follow-up
  ↓
Checkout Intent
  ↓
Checkout Link or Human Handoff
  ↓
Post-purchase Follow-up
  ↓
Closed / Nurturing Loop
```

---

## State Table

| State | User Intent | System Action | Fallback |
|---|---|---|---|
| `greeting` | Initial contact | Welcome message + main menu | Human handoff after unclear responses |
| `market_selection` | Mexico / USA | Route catalog by market | Ask again with interactive buttons |
| `intent_detection` | Product info / pricing / support | Classify and route | Show menu again |
| `product_interest` | Wants product info | Show product options for market | Offer human support |
| `product_education` | Wants to understand benefits | Send educational content | Handoff to advisor |
| `objection_handling` | Price concern / comparison | Address concern, offer follow-up | Handoff to human |
| `checkout_intent` | Ready to buy | Validate catalog, generate checkout path | Manual support if guardrail fails |
| `checkout_confirm` | Confirm order | Show order summary, generate Stripe link | Change selection or handoff |
| `follow_up` | Post-contact nurturing | Stage-appropriate follow-up message | Handoff or close |
| `handoff` | Needs human | Pause automation, notify team | — |
| `closed` | Purchase completed | Confirmation + post-purchase sequence | — |

---

## Intent Classification

| Detected Intent | Keywords / Signals | Next State |
|---|---|---|
| `product_information` | "what is", "how does", "benefits", "tell me more" | `product_education` |
| `pricing` | "how much", "cost", "price", "how do I pay" | `checkout_intent` |
| `checkout_ready` | "I want to buy", "send me the link", "order now" | `checkout_confirm` |
| `support` | "help", "problem", "question", "I need" | `handoff` or `product_education` |
| `shipping` | "delivery", "shipping", "how long", "send to" | `market_selection` |
| `unrecognized` | Any other input | Show menu (fallback) |

---

## Message Type Usage by State

| State | Message Type |
|---|---|
| `greeting` | Interactive buttons (3 options max) |
| `market_selection` | Interactive buttons (MX / USA) |
| `product_interest` | Interactive list (up to 10 products) |
| `product_education` | Text or rich media |
| `checkout_confirm` | Interactive buttons (Confirm / Change) |
| `checkout_link` | Interactive CTA button (URL) |
| `follow_up` | Text (template-based, approved) |
| `handoff` | Text (neutral, reassuring) |

---

## Fallback Logic

Every state has a defined fallback:

1. **Unrecognized input** → Re-show current state menu (max 2 times)
2. **2 consecutive fallbacks** → Offer human handoff option
3. **Explicit `human_help` selection** → Move to `HANDOFF` immediately
4. **Guardrail failure at checkout** → Move to `HANDOFF` with context preserved

---

## Session Context Accumulation

Context data is accumulated across states and persists in the session:

```json
{
  "intent": "products",
  "market": "MX",
  "product_key": "starter_v1",
  "purchase_mode": "one_time",
  "quantity": 2,
  "lead_stage": "warm",
  "campaign_source": "wa_link",
  "fallback_count": 0
}
```

This context is used by the follow-up message generator, handoff trigger, and analytics event logger.
