# NexusCore AI Integration

> NexusCore AI is the intelligence layer of RockeyHub — a multi-mode AI system that powers message drafting, strategic advisory, and semantic knowledge retrieval.

---

## Overview

NexusCore AI operates in three distinct modes, each using a different Gemini model optimized for its specific task:

| Mode | Model | Latency | Use Case |
|---|---|---|---|
| **Message Drafting** | `gemini-3-flash-preview` | Low | Real-time WhatsApp copy generation |
| **Strategic Advisor** | `gemini-3-pro-preview` | Medium | Deep reasoning, business strategy |
| **Semantic RAG** | `text-embedding-004` | Low | Vector search, knowledge retrieval |

---

## Mode 1 — Message Draft Generator

Helps community managers compose personalized WhatsApp messages with tone control and smart token handling.

### Input Parameters

| Parameter | Type | Values |
|---|---|---|
| `topic` | string | Free text — what the message is about |
| `tone` | enum | `formal` / `casual` / `urgent` / `sales` |
| `recipientContext` | string (optional) | Extra context about the recipient |

### Token System

The AI is instructed to use specific tokens for dynamic personalization:

| Token | When to Use |
|---|---|
| `{{nombre}}` | Always, for recipient name |
| `{{link_activacion}}` | Only when user explicitly requests a unique/personalized link |
| `{{codigo}}` | Only when user explicitly mentions a code or CSV |

**Critical rule**: Static URLs provided by the user (e.g., `https://mysite.com`) must be used verbatim — never replaced by a variable token.

### System Instruction Structure

```
Redacta un mensaje para WhatsApp corto y efectivo.

REGLAS DE VARIABLES (CRÍTICO):
1. Para el nombre del destinatario, usa SIEMPRE '{{nombre}}'.
2. URLs ESTÁTICAS: Si el usuario proporciona una URL específica, ÚSALA TEXTUALMENTE.
3. URLs DINÁMICAS: SOLO usa '{{link_activacion}}' si el usuario pide explícitamente un link único.
4. No dejes marcadores de posición genéricos como [Link] o [Fecha].
```

---

## Mode 2 — Strategic Advisor

A contextual AI advisor with persistent conversation memory and Knowledge Base retrieval. Designed to help organization admins make informed business decisions using their own CRM context.

### Architecture

```
User message
    ↓
Conversation history (ChatMessage[] → Gemini contents[])
    ↓
Optional RAG block (if relevant KB docs found)
    ↓
System instruction (role + organization context + RAG block)
    ↓
gemini-3-pro-preview (thinkingBudget: 2048)
    ↓
Markdown-formatted response
```

### System Instruction Components

```
1. Role definition:
   "Eres un consultor CTO experto en SaaS Multi-tenant y Estrategia de Negocios."

2. Organization context (dynamic):
   "CONTEXTO DE LA ORGANIZACIÓN: {companyName} — {memberCount} miembros."

3. RAG block (conditional):
   "INFORMACIÓN RECUPERADA DE LA BASE DE CONOCIMIENTO (Prioridad Alta):
   {retrieved_documents}
   Usa esta información para responder. Si la respuesta está en estos documentos, cítala."

4. Memory rules:
   - Maintain continuity with previous messages
   - Use company context in examples
   - Respond in Markdown
   - Be technical for server questions, strategic for business questions
```

### thinkingBudget: 2048

The Strategic Advisor uses `thinkingConfig: { thinkingBudget: 2048 }` — a Gemini Pro feature that allocates internal reasoning tokens before producing the final response. This enables:
- Multi-step problem decomposition
- Weighing multiple strategic options before recommending
- More coherent responses on complex SaaS / business questions

---

## Mode 3 — Semantic Search / RAG Pipeline

Powers the Knowledge Base retrieval that grounds the Strategic Advisor's responses in organization-specific documents.

### Flow

```
1. Knowledge Base document uploaded by admin
        ↓
2. generateEmbedding(document_text) → float[] (768 dimensions)
        ↓
3. Vector stored in knowledge_base table (Supabase pgvector)
        ↓
─────────────── (at query time) ───────────────
4. User asks question in Strategic Advisor
        ↓
5. generateEmbedding(user_question) → query vector
        ↓
6. Cosine similarity search against knowledge_base
        ↓
7. Top-K relevant documents retrieved
        ↓
8. Injected into Strategic Advisor system instruction
        ↓
9. Gemini Pro generates grounded, citation-aware response
```

### Embedding Specification

| Parameter | Value |
|---|---|
| Model | `text-embedding-004` |
| Dimensions | 768 |
| Similarity metric | Cosine |
| Storage | Supabase (pgvector extension) |

---

## AI Usage Governance

To prevent runaway costs in a multi-tenant environment:

| Control | Implementation |
|---|---|
| Daily limit for leaders | `ai_daily_limit_leaders` per organization (system_config) |
| Usage tracking | Per-user AI call counter (reset daily) |
| Model selection | Flash for drafts (cost-efficient), Pro only for advisor |
| Lazy initialization | AI client initialized only when needed, not on app load |
| Graceful degradation | If API key missing or quota exceeded, returns error message (no crash) |

---

## Privacy Design

- No member PII is sent to Google AI models without explicit user action
- Organization context passed to Advisor is a summary string, not raw database dump
- Knowledge Base documents are organization-scoped; no cross-tenant retrieval possible
- AI conversation history (`chat_messages`) is isolated by `organization_id` in the database
