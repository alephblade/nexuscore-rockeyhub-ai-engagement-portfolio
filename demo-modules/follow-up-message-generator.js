/**
 * Follow-up Message Generator — NexusCore AI Portfolio Sample
 * Generates a follow-up message based on lead stage, channel, and language.
 */
const TEMPLATES = {
  en: {
    new:            'Hi {{name}}, thanks for reaching out earlier. I wanted to check if you had any questions about {{product}}.',
    warm:           'Hi {{name}}, following up on our last conversation about {{product}}. Are you ready to take the next step?',
    checkout_ready: 'Hi {{name}}, your order is just one step away. Reply here and I will send you a fresh payment link.'
  },
  es: {
    new:            'Hola {{nombre}}, gracias por contactarnos. ¿Tienes alguna pregunta sobre {{producto}}?',
    warm:           'Hola {{nombre}}, te hago seguimiento sobre {{producto}}. ¿Estás listo/a para avanzar?',
    checkout_ready: 'Hola {{nombre}}, tu pedido está a un paso. Responde aquí y te envío el enlace de pago.'
  }
};
function generateFollowUp({ name, product, leadStage = 'new', language = 'en' }) {
  const lang = TEMPLATES[language] || TEMPLATES.en;
  const stage = lang[leadStage] || lang.new;
  return stage.replace(/\{\{name\}\}/g, name).replace(/\{\{nombre\}\}/g, name)
              .replace(/\{\{product\}\}/g, product).replace(/\{\{producto\}\}/g, product);
}
if (typeof module !== 'undefined') module.exports = { generateFollowUp, TEMPLATES };
