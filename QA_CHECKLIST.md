# QA Checklist — NexusCore AI / RockeyHub

---

## Conversation QA

- [ ] Greeting message renders correctly on first contact
- [ ] Main menu options are clear and complete
- [ ] User intent is classified correctly for standard inputs
- [ ] Fallback messages are triggered after unrecognized input
- [ ] Fallback counter resets on valid input
- [ ] Human handoff triggers after 2 consecutive fallbacks
- [ ] `human_help` button always visible in menus
- [ ] HANDOFF state silences bot correctly (no double responses)
- [ ] Session resets to START after successful checkout

## Product Routing QA

- [ ] Catalog query filters by correct market (MX / US)
- [ ] Only `bot_menu_enabled = true` products appear
- [ ] Only `global_active = true` products are clickable
- [ ] Product labels ≤ 24 characters (WhatsApp list limit)
- [ ] Product descriptions ≤ 72 characters (WhatsApp list limit)
- [ ] Empty catalog for a market shows graceful fallback message

## Checkout QA

- [ ] All 4 guardrail checks execute before Stripe session creation
- [ ] `global_active = false` → HANDOFF (not checkout)
- [ ] `bot_checkout_enabled = false` → HANDOFF (not checkout)
- [ ] `stripe_price_id = 'pending_stripe'` → HANDOFF (not checkout)
- [ ] Quantity above threshold → HANDOFF (not checkout)
- [ ] Order draft created BEFORE Stripe session call
- [ ] `client_reference_id` = `order_draft_id` on Stripe session
- [ ] Checkout URL sent as interactive CTA button (not plain text)
- [ ] Session resets to START after checkout link sent
- [ ] Stripe webhook updates order draft status correctly

## AI Drafting QA (NexusCore AI — Message Mode)

- [ ] `{{nombre}}` token present in all drafts
- [ ] Static URLs from user input appear verbatim (not replaced by token)
- [ ] `{{link_activacion}}` only appears when explicitly requested
- [ ] No generic placeholders like [Link] or [Fecha] in output
- [ ] Tone matches selected mode (formal / casual / urgent / sales)
- [ ] Draft length is appropriate for WhatsApp (not truncated)

## AI Advisor QA (NexusCore AI — Strategy Mode)

- [ ] Conversation history loads correctly on return visits
- [ ] RAG block injected when relevant KB documents found
- [ ] Response cites knowledge base when applicable
- [ ] Response format is Markdown
- [ ] AI daily limit for leaders enforced (no overage)
- [ ] AI client fails gracefully if API key is missing

## Multi-Tenant QA

- [ ] Users can only see their own organization's data
- [ ] Leader can only see their own leads (not other leaders')
- [ ] Admin cannot access SaaS Master Panel
- [ ] super_master cannot see individual org member data
- [ ] Organization suspended → users cannot log in
- [ ] AI limit is per-organization, not global

## Webhook & Integration QA

- [ ] Idempotency check prevents duplicate message processing
- [ ] Stripe HMAC signature verified on every webhook event
- [ ] WhatsApp webhook verify token matches on GET challenge
- [ ] Edge Function returns 200 immediately (before processing) for performance
- [ ] Failed Stripe call → HANDOFF (not silent failure)
- [ ] DB write errors are caught and logged

## Analytics & Tracking QA

- [ ] `conversation_started` event fires on new session
- [ ] `market_selected` event fires on country choice
- [ ] `product_interest_detected` fires on product selection
- [ ] `checkout_started` fires when Stripe session created
- [ ] `payment_confirmed` fires on Stripe webhook success
- [ ] `human_handoff_triggered` fires on every HANDOFF transition
- [ ] All events include `organization_id`, `wa_id`, and timestamp

---

**Sign-off fields:**
QA Reviewer: _____________ Date: _____________ Build: _____________
