# Checkout Orchestration — RockeyHub

> How RockeyHub connects conversational engagement to transactional checkout via WhatsApp and Stripe.

---

## Overview

The checkout orchestration layer converts a qualified conversational lead into a Stripe Checkout Session — entirely within the WhatsApp thread. The user never needs to navigate to a separate website to initiate the purchase.

---

## Checkout Flow

```
Conversation (WhatsApp)
        ↓
Product selection (catalog query by market)
        ↓
Market validation (MX / USA geo-fence)
        ↓
Quantity / bundle logic
        ↓
Catalog guardrail checks
        ↓
Shipping rule application
        ↓
Order draft created (DB)
        ↓
Stripe Checkout Session created
        ↓
Payment link sent via WhatsApp CTA button
        ↓
User completes payment (Stripe hosted UI)
        ↓
Stripe webhook received → order confirmed
        ↓
Post-purchase follow-up triggered
        ↓
Dashboard / logs updated
```

---

## Catalog Guardrails

Before a Stripe session is created, the system validates:

| Check | If Failed |
|---|---|
| `global_active === true` | → Human handoff |
| `bot_checkout_enabled === true` | → Human handoff |
| `stripe_price_id` is not `'pending_stripe'` | → Human handoff |
| `quantity ≤ requires_human_review_above_qty` | → Human handoff |

These guardrails prevent invalid orders, outdated prices, or oversized orders from reaching Stripe automatically.

---

## Market-Aware Logic

| Market | Shipping | Currency | Geo-fence |
|---|---|---|---|
| `MX` | Tiered flat rate (USD): 1–4: $15 / 5–10: $25 / 11–20: $40 | USD | Stripe restricted to MX cards |
| `US` | Per-product rules; free above threshold | USD | Stripe restricted to US cards |

The shipping amount is calculated by the checkout engine before session creation and stored on the order draft for reconciliation.

---

## Order Draft Lifecycle

| Status | Trigger |
|---|---|
| `draft` | Created when user confirms order summary |
| `checkout_pending` | Stripe session created; link sent to user |
| `paid` | Stripe `checkout.session.completed` webhook received |
| `cancelled` | User abandons checkout (Stripe session expired) |
| `handoff` | Guardrail failed; transferred to human |

---

## Stripe Session Configuration

```
mode:           'payment' (one_time) or 'subscription' (recurring)
ui_mode:        'hosted'  ← required for WhatsApp (no embedded UI)
shipping:       geo-fenced by market (MX or US only)
client_reference_id: order_draft_id  ← links webhook to DB record
metadata:       { wa_id, market, purchase_type, source: 'whatsapp' }
success_url:    /checkout/success
cancel_url:     /checkout/cancel
```

---

## Post-Payment Reconciliation

On `checkout.session.completed` webhook:
1. Stripe HMAC-SHA256 signature verified
2. `client_reference_id` → maps to `order_draft_id`
3. Order draft status → `paid`
4. Customer shipping address stored from Stripe session
5. Post-sale automation triggered (follow-up sequence)
6. Analytics event fired: `payment_confirmed`
