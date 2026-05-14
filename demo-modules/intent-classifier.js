/**
 * Intent Classifier — NexusCore AI Portfolio Sample
 * Classifies a user's text input into a structured intent.
 */
const INTENTS = {
  PRODUCT_INFORMATION: 'product_information',
  PRICING:             'pricing',
  CHECKOUT_READY:      'checkout_ready',
  SHIPPING:            'shipping',
  SUPPORT:             'support',
  UNRECOGNIZED:        'unrecognized'
};
const SIGNALS = {
  [INTENTS.PRODUCT_INFORMATION]: ['what','how','explain','tell me','benefits','works','about'],
  [INTENTS.PRICING]:             ['cost','price','how much','pay','discount','offer','cuanto'],
  [INTENTS.CHECKOUT_READY]:      ['buy','order','payment link','purchase','ready','quiero comprar'],
  [INTENTS.SHIPPING]:            ['ship','delivery','how long','send','arrive','days','envio'],
  [INTENTS.SUPPORT]:             ['help','question','problem','issue','support','assist','ayuda']
};
function classifyIntent(text) {
  if (!text || typeof text !== 'string') return { intent: INTENTS.UNRECOGNIZED, confidence: 0, matched_signals: [] };
  const lower = text.toLowerCase();
  let best = { intent: INTENTS.UNRECOGNIZED, score: 0, signals: [] };
  for (const [intent, signals] of Object.entries(SIGNALS)) {
    const matched = signals.filter(s => lower.includes(s));
    if (matched.length > best.score) { best = { intent, score: matched.length, signals: matched }; }
  }
  return { intent: best.intent, confidence: Math.min(best.score / 2, 1), matched_signals: best.signals };
}
if (typeof module !== 'undefined') module.exports = { classifyIntent, INTENTS };
