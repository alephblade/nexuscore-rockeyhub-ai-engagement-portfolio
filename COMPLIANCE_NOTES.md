# Compliance Notes — NexusCore AI / RockeyHub

> This document outlines the compliance-aware design principles applied in the NexusCore AI / RockeyHub platform for WhatsApp Business messaging, product-related communication, and automated workflows.

---

## Portfolio Note

This portfolio sample uses fictional product data and neutral messaging examples. All sample message templates, intents, and conversation flows shown here are representative and do not reflect production messaging used with real users.

---

## WhatsApp Business Policy Compliance

| Principle | Implementation |
|---|---|
| **User-initiated sessions** | The bot responds only after the user sends the first message; no unsolicited outbound messages within 24h window |
| **Template-only outbound** | Messages sent outside the 24-hour session window use pre-approved Meta message templates only |
| **Opt-out respected** | Users can request handoff or stop at any point; STOP / ALTO keyword handling is part of the handoff logic |
| **No harassment** | Follow-up sequences have a maximum frequency limit and stop after no response |
| **Business use only** | All messaging is within the scope of product inquiry, purchase support, and customer education |

---

## Product and Health Claim Compliance

| Principle | Implementation |
|---|---|
| **No medical claims** | Automated messages use benefit-focused language without therapeutic claims |
| **No income guarantees** | Messages do not include projected earnings, returns, or financial promises |
| **Educational vs. sales separation** | Product education content is structurally separated from purchase calls-to-action |
| **Claim review checkpoint** | QA checklist includes explicit compliance check for automated message templates |

---

## Data Privacy Design

| Principle | Implementation |
|---|---|
| **RLS data isolation** | Each organization's data is isolated at the database level via Row Level Security |
| **No cross-tenant access** | Supabase queries are scoped by `organization_id` — no shared data between tenants |
| **Lead data ownership** | Leader leads are isolated by `assigned_to` — other users cannot access them |
| **Minimal data capture** | Only the data needed for the transaction is stored (phone, market, product, quantity) |
| **No PII in AI prompts** | Individual user PII is not passed to Google AI models; only aggregate context is used |

---

## Sensitive Cases → Human Handoff

The following case types are always routed to human handoff, never handled by the bot:

- Medical questions or symptom-related inquiries
- Legal or regulatory questions
- Refund disputes or payment errors
- Bulk orders above defined quantity threshold
- Any input the bot cannot classify after 2 fallbacks
- User explicitly requesting human support

---

## Stripe and Payment Compliance

| Principle | Implementation |
|---|---|
| **Geo-fenced checkout** | Stripe sessions restrict accepted card countries by market (MX or US) |
| **No credentials in client** | Stripe secret key is only used in server-side Edge Functions |
| **HMAC webhook verification** | All Stripe webhook events are verified before processing |
| **Order audit trail** | Every order draft records its full lifecycle from creation to payment or cancellation |
