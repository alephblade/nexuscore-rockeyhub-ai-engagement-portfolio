# WhatsApp Workflow Design — NexusCore AI / RockeyHub

> This document covers the WhatsApp Business workflow architecture: entry points, message types, template logic, compliance considerations, and operational components.

---

## Entry Points

| Entry Point | Source | Initial State |
|---|---|---|
| `wa.me` direct link | Campaign CTA, bio link, QR code | `greeting` |
| Landing page CTA | Paid ad, organic post | `greeting` with campaign source tag |
| Campaign follow-up template | Outbound triggered by CRM event | `product_interest` or `follow_up` |
| User-initiated contact | Organic WhatsApp search | `greeting` |
| Referral link | Partner or affiliate share | `greeting` with referral tag |

---

## Workflow Components

### 1. Approved Template Messaging
Outbound messages sent outside the 24-hour window require pre-approved Meta templates.

Design principles:
- Keep templates neutral, factual, and benefit-focused
- Avoid medical claims, income guarantees, or urgency language
- Always include an opt-out or handoff option
- Templates are language- and market-specific (MX / USA)

### 2. Interactive Menus
Used within the 24-hour session window for guided conversations:
- **Buttons** (max 3): Binary or ternary decisions
- **Lists** (max 10): Product catalog, service options
- **CTA buttons**: Single URL action (checkout link, landing page)

### 3. Product Routing
Products are served from a catalog view filtered by:
- Market (`MX` / `US`)
- Purchase mode (`one_time` / `recurring`)
- Availability flags (`bot_menu_enabled`, `global_active`)
- Environment (`test` / `live`)

### 4. Follow-up Message Logic
Follow-ups are triggered by:
- Time elapsed since last contact
- Conversation state at last interaction
- Lead stage (`new`, `warm`, `checkout-ready`)
- Market and language preference

### 5. Human Handoff
Handoff is triggered by:
- Explicit user request (`human_help` button)
- Unrecognized input after 2 fallbacks
- Any catalog guardrail failure
- Stripe API error
- Bulk order quantity threshold exceeded

On handoff:
- Bot goes silent (all incoming messages ignored)
- Conversation flagged for team attention
- Context data preserved for agent reference

### 6. Status Logging
Every message event is logged:
- Inbound message received (with `wamid` for idempotency)
- State transition recorded
- Outbound message sent (with delivery status)
- Order draft created / updated
- Handoff triggered

---

## Message Flow Diagram

```
User sends message
    ↓
Webhook received (Edge Function)
    ↓
Idempotency check (wamid lookup)
    ↓ (new message)
Session loaded from DB
    ↓
State machine processes input
    ↓
Response(s) generated
    ↓
Message(s) sent via Meta Graph API
    ↓
Session updated in DB
    ↓
Event logged
```

---

## Compliance-Aware Design

| Principle | Implementation |
|---|---|
| User-initiated sessions | Bot responds only after user sends first message |
| 24-hour session window | Template messages used for outbound after window expires |
| Opt-out respect | Handoff option always available; STOP keyword handled |
| No medical claims | Automated messages are benefit-focused, not claim-based |
| No guaranteed income | Messaging avoids earnings projections in automated flows |
| Sensitive cases → human | Any complex, legal, or sensitive query goes to handoff |
