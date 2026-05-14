/**
 * Product Router — NexusCore AI Portfolio Sample
 * Selects the appropriate product/catalog based on market and user interest.
 */
const CATALOG = {
  MX: [
    { key: 'starter_mx', label: 'Starter Pack (30d)', price_usd: 45, bot_enabled: true, checkout_enabled: true, max_auto_qty: 4 },
    { key: 'pro_mx',     label: 'Pro Pack (90d)',     price_usd: 120, bot_enabled: true, checkout_enabled: true, max_auto_qty: 2 }
  ],
  US: [
    { key: 'starter_us', label: 'Starter Pack US',   price_usd: 49, bot_enabled: true, checkout_enabled: true, max_auto_qty: 5 },
    { key: 'pro_us',     label: 'Pro Pack US',        price_usd: 130, bot_enabled: true, checkout_enabled: false, max_auto_qty: 2 }
  ]
};
const SHIPPING = {
  MX: qty => qty <= 4 ? 15 : qty <= 10 ? 25 : 40,
  US: qty => qty >= 2 ? 0 : 8
};
function getProductsForMarket(market) {
  return (CATALOG[market] || []).filter(p => p.bot_enabled);
}
function getProductByKey(key, market) {
  return (CATALOG[market] || []).find(p => p.key === key) || null;
}
function calculateShipping(market, qty) {
  return SHIPPING[market] ? SHIPPING[market](qty) : null;
}
function canAutoCheckout(productKey, market, quantity) {
  const p = getProductByKey(productKey, market);
  if (!p) return { allowed: false, reason: 'product_not_found' };
  if (!p.checkout_enabled) return { allowed: false, reason: 'checkout_disabled' };
  if (quantity > p.max_auto_qty) return { allowed: false, reason: 'quantity_above_threshold' };
  return { allowed: true, reason: null };
}
if (typeof module !== 'undefined') module.exports = { getProductsForMarket, getProductByKey, calculateShipping, canAutoCheckout, CATALOG };
