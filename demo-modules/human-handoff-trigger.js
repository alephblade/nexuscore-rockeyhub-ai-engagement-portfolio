/**
 * Human Handoff Trigger — NexusCore AI Portfolio Sample
 * Evaluates whether a conversation should be escalated to a human operator.
 */
const HANDOFF_RULES = [
  { id: 'explicit_request',    check: s => s.lastInput === 'human_help',            priority: 1, reason: 'User explicitly requested human support' },
  { id: 'fallback_limit',      check: s => (s.fallback_count || 0) >= 2,            priority: 2, reason: 'Two consecutive unrecognized inputs' },
  { id: 'bulk_quantity',       check: s => s.quantity > (s.max_auto_qty || 99),     priority: 3, reason: 'Quantity exceeds auto-checkout threshold' },
  { id: 'checkout_disabled',   check: s => s.checkout_enabled === false,             priority: 4, reason: 'Product not enabled for automated checkout' },
  { id: 'pending_price',       check: s => s.stripe_price_id === 'pending_stripe',  priority: 4, reason: 'Stripe price ID not yet configured' },
  { id: 'inactive_product',    check: s => s.global_active === false,               priority: 4, reason: 'Product is globally inactive' },
  { id: 'stripe_error',        check: s => s.stripe_error === true,                 priority: 5, reason: 'Stripe API error during checkout' }
];
function evaluateHandoff(sessionContext) {
  const triggered = HANDOFF_RULES
    .filter(r => r.check(sessionContext))
    .sort((a, b) => a.priority - b.priority);
  if (triggered.length === 0) return { handoff: false, reason: null, rule_id: null };
  const top = triggered[0];
  return { handoff: true, reason: top.reason, rule_id: top.id, priority: top.priority };
}
if (typeof module !== 'undefined') module.exports = { evaluateHandoff, HANDOFF_RULES };
