/**
 * Checkout Flow Selector — NexusCore AI Portfolio Sample
 * Determines whether a user goes to checkout, education, or handoff.
 */
function selectCheckoutFlow(leadStage, intent, market, productKey, quantity) {
  // Stage-based routing
  if (leadStage === 'new' && intent === 'product_information') {
    return { flow: 'education', action: 'send_product_info', reason: 'Lead is new — educate first' };
  }
  if (leadStage === 'new' && intent === 'checkout_ready') {
    return { flow: 'education', action: 'send_product_info', reason: 'New lead requesting checkout — confirm understanding first' };
  }
  if (leadStage === 'warm' && intent === 'product_information') {
    return { flow: 'education_then_offer', action: 'send_product_info_with_cta', reason: 'Warm lead — educate and present offer' };
  }
  if (leadStage === 'warm' && intent === 'checkout_ready') {
    return { flow: 'checkout', action: 'generate_checkout_path', reason: 'Warm lead ready — proceed to checkout' };
  }
  if (leadStage === 'checkout_ready') {
    return { flow: 'checkout', action: 'generate_checkout_path', reason: 'Lead is checkout-ready — direct to payment' };
  }
  // Fallback
  return { flow: 'support', action: 'offer_handoff', reason: 'Unable to classify — offer human support' };
}
if (typeof module !== 'undefined') module.exports = { selectCheckoutFlow };
