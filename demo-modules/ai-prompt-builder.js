/**
 * NexusCore AI Prompt Builder
 * RockeyHub — Creative Technology Portfolio Sample
 * Demonstrates how the Strategic Advisor system instruction is assembled.
 */
function buildStrategyAdvisorPrompt(orgContext, retrievedDocs = null) {
  const ragBlock = retrievedDocs
    ? `\n\nRETRIEVED KNOWLEDGE BASE (High Priority):\n${retrievedDocs}\n\nUse this information to answer. Cite it if relevant.`
    : '';
  return `You are an expert CTO consultant specialized in Multi-tenant SaaS and Business Strategy for communities.

ORGANIZATION CONTEXT: ${orgContext}.${ragBlock}

MEMORY RULES:
1. Maintain continuity with the previous messages in the conversation history.
2. If the user already told you their business type, use it in your examples.
3. Always respond in Markdown format.
4. Be technical for server/infrastructure questions (Supabase, Edge Functions, Deno).
5. Be strategic for business questions (retention, MRR, onboarding).`;
}
function buildMessageDraftPrompt() {
  return `Draft a short, effective WhatsApp message.

TOKEN RULES (CRITICAL):
1. For the recipient name, ALWAYS use {{nombre}}.
2. STATIC URLs: If the user provides a specific URL, use it VERBATIM. Do NOT replace with a variable.
3. DYNAMIC URLs: ONLY use {{link_activacion}} if explicitly requested.
4. Do not leave generic placeholders like [Link] or [Date].`;
}
function buildEmbeddingInput(text) {
  return { model: 'text-embedding-004', contents: { parts: [{ text }] } };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildStrategyAdvisorPrompt, buildMessageDraftPrompt, buildEmbeddingInput };
}
