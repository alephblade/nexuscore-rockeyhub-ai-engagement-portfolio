# Analytics and Tracking — NexusCore AI / RockeyHub

---

## Design Philosophy

Every significant action in the NexusCore AI / RockeyHub system fires a structured event. Events are designed to be:
- **Analytics-ready**: structured JSON with consistent fields
- **Dashboard-visible**: queryable from the admin analytics view
- **Optimization-oriented**: each event maps to a metric in the funnel

---

## Tracked Events

| Event | Trigger | Key Fields |
|---|---|---|
| `conversation_started` | New WhatsApp session created | `wa_id`, `organization_id`, `campaign_source`, `timestamp` |
| `market_selected` | User confirms MX or US | `market`, `intent`, `session_id` |
| `product_interest_detected` | User selects a product from catalog | `product_key`, `market`, `session_id` |
| `follow_up_sent` | Follow-up message dispatched | `template_id`, `lead_stage`, `channel` |
| `checkout_intent_detected` | User confirms quantity and order | `product_key`, `quantity`, `market` |
| `checkout_started` | Stripe session created, link sent | `stripe_session_id`, `order_draft_id`, `amount`, `market` |
| `payment_confirmed` | Stripe webhook `checkout.session.completed` | `order_draft_id`, `amount_paid`, `currency`, `market` |
| `human_handoff_triggered` | HANDOFF state entered | `trigger_reason`, `last_state`, `session_id` |
| `conversation_closed` | Post-purchase flow completed | `session_id`, `duration_minutes`, `outcome` |
| `ai_draft_generated` | Message draft created by Gemini Flash | `tone`, `has_tokens`, `organization_id` |
| `advisor_query` | Strategic advisor receives a question | `organization_id`, `rag_used`, `model` |

---

## Key Metrics

| Metric | Formula | Target |
|---|---|---|
| **Response rate** | conversations with ≥1 user reply / total initiated | > 60% |
| **Intent detection rate** | correctly classified intents / total inputs | > 85% |
| **Lead qualification rate** | leads reaching `product_interest` / total conversations | > 40% |
| **Checkout start rate** | `checkout_started` / `checkout_intent_detected` | > 70% |
| **Payment conversion rate** | `payment_confirmed` / `checkout_started` | > 50% |
| **Handoff rate** | `human_handoff_triggered` / total conversations | < 25% |
| **Drop-off by state** | sessions that ended at each state | Tracked per state |
| **Follow-up conversion** | leads converted after follow-up / total follow-ups | > 15% |

---

## Funnel Visualization

```
conversation_started          (100%)
        ↓
market_selected               (~80%)
        ↓
product_interest_detected     (~55%)
        ↓
checkout_intent_detected      (~35%)
        ↓
checkout_started              (~25%)
        ↓
payment_confirmed             (~12%)
```

Drop-off at each stage is analyzed to optimize: fallback messages, product presentation, catalog content, and handoff timing.

---

## Optimization Loop

```
Collect events
        ↓
Aggregate by state / market / product / campaign
        ↓
Identify highest drop-off state
        ↓
Hypothesize improvement (message, product, fallback)
        ↓
Deploy change (message template, state logic, catalog flag)
        ↓
Measure impact
        ↓
Repeat
```

---

## Dashboard Integration

Events are written to Supabase and surfaced in:
- **Admin Dashboard**: per-organization conversation and conversion metrics
- **Lead Analytics Panel** (`ADMIN_LEADS` view): leader performance by lead stage
- **SaaS Master Panel** (`super_master` only): cross-org platform metrics

All dashboard queries use aggregated, anonymized data — no individual PII is displayed.
