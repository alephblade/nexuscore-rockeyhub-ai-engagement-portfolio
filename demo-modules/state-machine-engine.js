/**
 * WhatsApp Bot State Machine Engine
 * RockeyHub / NexusCore AI — Creative Technology Portfolio Sample
 *
 * A standalone, dependency-free implementation of the RockeyHub
 * WhatsApp commerce state machine. Demonstrates deterministic
 * state transitions, guardrail logic, and session context management.
 *
 * @module state-machine-engine
 */

/** All valid bot states */
const STATES = {
  START:               'START',
  WAIT_MARKET:         'WAIT_MARKET',
  WAIT_PRODUCT:        'WAIT_PRODUCT',
  WAIT_PURCHASE_MODE:  'WAIT_PURCHASE_MODE',
  WAIT_QTY:            'WAIT_QTY',
  CHECKOUT_CONFIRM:    'CHECKOUT_CONFIRM',
  HANDOFF:             'HANDOFF',
};

/** Interactive button/list IDs recognized by the bot */
const INPUTS = {
  VIEW_PRODUCTS:       'view_products',
  SHIPPING_INFO:       'shipping_info',
  HUMAN_HELP:          'human_help',
  COUNTRY_MX:          'country_mx',
  COUNTRY_US:          'country_us',
  PURCHASE_ONE_TIME:   'purchase_one_time',
  QTY_1:               'qty_1',
  QTY_2:               'qty_2',
  QTY_OTHER:           'qty_other',
  GENERATE_CHECKOUT:   'generate_checkout',
  CHANGE_SELECTION:    'change_selection',
};

/**
 * Process one inbound message through the state machine.
 *
 * @param {Object} session - Current session state
 * @param {string} session.current_state - Active state key
 * @param {Object} session.context_data - Accumulated context
 * @param {string|null} interactiveId - Button/list reply ID (null if free text)
 * @param {string|null} rawText - Free text input (null if interactive)
 * @param {Function} [catalogLookup] - Optional async fn: (productKey, market) => product
 *
 * @returns {Object} Transition result
 * @returns {string} result.next_state - State to transition to
 * @returns {Object} result.context_updates - Fields to merge into context_data
 * @returns {Array}  result.responses - Array of message objects to send
 * @returns {string} result.action - What the engine did ('transition'|'fallback'|'handoff'|'checkout')
 */
function processMessage(session, interactiveId, rawText, catalogLookup = null) {
  const state = session.current_state;
  const ctx   = session.context_data || {};

  // ── Global: Human handoff override ──────────────────────────
  if (interactiveId === INPUTS.HUMAN_HELP) {
    return {
      next_state:      STATES.HANDOFF,
      context_updates: {},
      action:          'handoff',
      responses: [text('A team member will follow up with you shortly. The automated flow is now paused.')],
    };
  }

  // ── HANDOFF: bot is silent ────────────────────────────────────
  if (state === STATES.HANDOFF) {
    return { next_state: STATES.HANDOFF, context_updates: {}, action: 'silent', responses: [] };
  }

  // ── START ─────────────────────────────────────────────────────
  if (state === STATES.START) {
    if (interactiveId === INPUTS.VIEW_PRODUCTS) {
      return {
        next_state:      STATES.WAIT_MARKET,
        context_updates: { intent: 'products' },
        action:          'transition',
        responses: [buttons('To show you correct prices and shipping, where will you be purchasing from?', [
          { id: INPUTS.COUNTRY_MX, title: 'Mexico' },
          { id: INPUTS.COUNTRY_US, title: 'USA'    },
        ])],
      };
    }
    if (interactiveId === INPUTS.SHIPPING_INFO) {
      return {
        next_state:      STATES.WAIT_MARKET,
        context_updates: { intent: 'shipping' },
        action:          'transition',
        responses: [buttons('Shipping costs depend on your country. Where are you purchasing from?', [
          { id: INPUTS.COUNTRY_MX, title: 'Mexico' },
          { id: INPUTS.COUNTRY_US, title: 'USA'    },
        ])],
      };
    }
    // Fallback
    return {
      next_state:      STATES.START,
      context_updates: {},
      action:          'fallback',
      responses: [buttons('Welcome to RockeyHub. How can I help you today?', [
        { id: INPUTS.VIEW_PRODUCTS,  title: 'View products' },
        { id: INPUTS.SHIPPING_INFO,  title: 'Shipping info' },
        { id: INPUTS.HUMAN_HELP,     title: 'Talk to a person' },
      ])],
    };
  }

  // ── WAIT_MARKET ──────────────────────────────────────────────
  if (state === STATES.WAIT_MARKET) {
    const marketMap = { [INPUTS.COUNTRY_MX]: 'MX', [INPUTS.COUNTRY_US]: 'US' };
    const market    = marketMap[interactiveId];

    if (!market) {
      return {
        next_state: STATES.WAIT_MARKET, context_updates: {}, action: 'fallback',
        responses: [buttons('Please select your purchase location:', [
          { id: INPUTS.COUNTRY_MX, title: 'Mexico' },
          { id: INPUTS.COUNTRY_US, title: 'USA' },
        ])],
      };
    }

    if (ctx.intent === 'shipping') {
      const shippingInfo = market === 'MX'
        ? 'Mexico shipping (USD): 1–4 units: $15 | 5–10 units: $25 | 11–20 units: $40'
        : 'USA shipping: free on qualifying orders. Calculated at checkout.';
      return {
        next_state:      STATES.START,
        context_updates: { intent: null },
        action:          'transition',
        responses: [
          text(shippingInfo),
          buttons('Anything else I can help with?', [
            { id: INPUTS.VIEW_PRODUCTS, title: 'View products' },
            { id: INPUTS.HUMAN_HELP,    title: 'Talk to a person' },
          ]),
        ],
      };
    }

    // intent = products → need catalog lookup (simulated here)
    return {
      next_state:      STATES.WAIT_PRODUCT,
      context_updates: { market },
      action:          'transition',
      responses: [text(`Great — showing you products available in ${market === 'MX' ? 'Mexico' : 'USA'}. (In production, catalog list sent here.)`)],
    };
  }

  // ── WAIT_PRODUCT ─────────────────────────────────────────────
  if (state === STATES.WAIT_PRODUCT) {
    if (interactiveId && interactiveId.startsWith('product_')) {
      const productKey = interactiveId.replace('product_', '');
      return {
        next_state:      STATES.WAIT_PURCHASE_MODE,
        context_updates: { product_key: productKey },
        action:          'transition',
        responses: [buttons(`You selected: ${productKey}. How would you like to purchase?`, [
          { id: INPUTS.PURCHASE_ONE_TIME, title: 'One-time purchase' },
          { id: INPUTS.HUMAN_HELP,        title: 'Ask a question' },
        ])],
      };
    }
    return { next_state: STATES.WAIT_PRODUCT, context_updates: {}, action: 'fallback',
      responses: [text('Please select a product from the menu.')] };
  }

  // ── WAIT_PURCHASE_MODE ───────────────────────────────────────
  if (state === STATES.WAIT_PURCHASE_MODE) {
    if (interactiveId === INPUTS.PURCHASE_ONE_TIME) {
      return {
        next_state:      STATES.WAIT_QTY,
        context_updates: { purchase_mode: 'one_time' },
        action:          'transition',
        responses: [buttons('How many units would you like?', [
          { id: INPUTS.QTY_1,     title: '1 unit'   },
          { id: INPUTS.QTY_2,     title: '2 units'  },
          { id: INPUTS.QTY_OTHER, title: 'Other qty' },
        ])],
      };
    }
    return { next_state: STATES.WAIT_PURCHASE_MODE, context_updates: {}, action: 'fallback',
      responses: [buttons('Please select a purchase type:', [
        { id: INPUTS.PURCHASE_ONE_TIME, title: 'One-time purchase' }
      ])] };
  }

  // ── WAIT_QTY ─────────────────────────────────────────────────
  if (state === STATES.WAIT_QTY) {
    const qtyMap = { [INPUTS.QTY_1]: 1, [INPUTS.QTY_2]: 2 };
    const qty    = qtyMap[interactiveId];

    if (qty) {
      return {
        next_state:      STATES.CHECKOUT_CONFIRM,
        context_updates: { quantity: qty },
        action:          'transition',
        responses: [buttons(
          `Your selection:\nProduct: ${ctx.product_key}\nQty: ${qty}\nMarket: ${ctx.market}\n\nReady to generate your secure payment link?`,
          [
            { id: INPUTS.GENERATE_CHECKOUT, title: 'Generate payment' },
            { id: INPUTS.CHANGE_SELECTION,  title: 'Change selection' },
          ]
        )],
      };
    }
    if (interactiveId === INPUTS.QTY_OTHER) {
      return {
        next_state: STATES.HANDOFF, context_updates: {}, action: 'handoff',
        responses: [text('For larger orders, a team member will assist you personally.')],
      };
    }
    return { next_state: STATES.WAIT_QTY, context_updates: {}, action: 'fallback',
      responses: [text('Please select a quantity from the options.')] };
  }

  // ── CHECKOUT_CONFIRM ─────────────────────────────────────────
  if (state === STATES.CHECKOUT_CONFIRM) {
    if (interactiveId === INPUTS.CHANGE_SELECTION) {
      return {
        next_state:      STATES.WAIT_MARKET,
        context_updates: { intent: 'products', product_key: null, purchase_mode: null, quantity: null },
        action:          'transition',
        responses: [buttons("Let's start over. Where will you be purchasing from?", [
          { id: INPUTS.COUNTRY_MX, title: 'Mexico' },
          { id: INPUTS.COUNTRY_US, title: 'USA' },
        ])],
      };
    }
    if (interactiveId === INPUTS.GENERATE_CHECKOUT) {
      // In production: validate catalog guardrails, create Stripe session
      return {
        next_state: STATES.START, context_updates: {}, action: 'checkout',
        responses: [text('Generating your secure payment link... (In production: Stripe Checkout URL sent here.)')],
      };
    }
  }

  // ── General fallback ─────────────────────────────────────────
  return {
    next_state: state, context_updates: {}, action: 'fallback',
    responses: [buttons("I did not understand that. How can I help?", [
      { id: INPUTS.VIEW_PRODUCTS, title: 'Products'        },
      { id: INPUTS.SHIPPING_INFO, title: 'Shipping'        },
      { id: INPUTS.HUMAN_HELP,    title: 'Talk to a person' },
    ])],
  };
}

// ── Message builders ──────────────────────────────────────────
function text(body) {
  return { type: 'text', text: { body } };
}
function buttons(body, btns) {
  return { type: 'interactive', interactive: { type: 'button', body: { text: body },
    action: { buttons: btns.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })) }
  }};
}

// ── Exports ───────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { processMessage, STATES, INPUTS };
}
