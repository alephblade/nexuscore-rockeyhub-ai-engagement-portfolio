# Architecture Overview — RockeyHub

> Powered by **NexusCore AI** | Portfolio Reference — Non-sensitive representation only.

---

## System Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│              React 18 / Vite SPA (TypeScript)                │
│                                                              │
│  ViewState Enum Router (no React Router)                     │
│  Dashboard · MemberDirectory · MessageComposer               │
│  StrategyAdvisor · LeadDirectory · AdminUsers                │
│  SaasMasterPanel · UniversityDashboard · InviteManager       │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                   NEXUSCORE AI LAYER                         │
│                                                              │
│  Gemini Flash ──── Message Draft Generator                   │
│  Gemini Pro  ──── Strategic Advisor (thinkingBudget: 2048)   │
│  text-embedding-004 ── Semantic Search / RAG Pipeline        │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│               EDGE FUNCTIONS LAYER (Deno)                    │
│                                                              │
│  whatsapp-inbound    ── Webhook receiver + state machine     │
│  whatsapp-sender     ── Outbound message dispatcher          │
│  whatsapp-webhook    ── Meta webhook verification            │
│  whatsapp-templates  ── Template management                  │
│  whatsapp-healthcheck── API connectivity check               │
│  create-checkout-session── Stripe session creation           │
│  stripe-webhook      ── Payment event reconciliation         │
│  create-user         ── Invited user provisioning            │
│  secure-playback     ── Signed URL for private media         │
│  secure-upload       ── Authenticated media upload           │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│               DATA LAYER (Supabase / PostgreSQL)             │
│                                                              │
│  organizations  · profiles  · members  · leads               │
│  whatsapp_sessions · whatsapp_configs · whatsapp_secrets     │
│  order_drafts · product_catalog_matrix_view                  │
│  chat_messages · knowledge_base · system_config              │
│  university_courses · organization_courses                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│               INTEGRATION LAYER                              │
│  WhatsApp Cloud API (Meta Graph v20.0)                       │
│  Stripe (Checkout Sessions, Webhooks, geo-fenced)            │
│  Google GenAI SDK (Gemini models)                            │
│  Vercel (frontend hosting + CI/CD)                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Client (SPA)

### ViewState Enum Architecture

The SPA uses a deliberate `ViewState` enum + permission guards instead of React Router:

```typescript
enum ViewState {
  DASHBOARD, DIRECTORY, MESSAGING, STRATEGY,
  ADMIN_USERS, SAAS_PANEL, INVITE_MANAGER,
  UNIVERSITY_MANAGER, UNIVERSITY_DASHBOARD,
  LEADS, ADMIN_LEADS
}
```

**Why this decision?**

| Factor | React Router | ViewState Enum |
|---|---|---|
| Deep-link support | ✅ | ❌ (not needed — closed app) |
| Role gating complexity | Middleware per route | Single guard function |
| Bundle size | +router dependency | Zero |
| Transition clarity | URL change | Explicit state transition |
| Suitable for | Public apps | Internal SaaS tools ✅ |

Permission guards are applied as explicit conditionals before `setCurrentView()` — readable, testable, and auditable.

### Role-Based Module Access

| Module | super_master | admin | leader |
|---|:---:|:---:|:---:|
| SaaS Master Panel | ✅ | ❌ | ❌ |
| Member Directory | ❌ | ✅ | ❌ |
| Lead Directory | ❌ | ✅* | ✅ |
| Message Composer | ✅ | ✅ | ✅ |
| Strategy Advisor | ❌ | ✅ | ❌ |
| Admin Users | ❌ | ✅ | ❌ |
| University | ✅ (manage) | ❌ | ✅ (view) |
| Invite Manager | ❌ | ✅ | ❌ |
| Dashboard | ❌ | ✅ | ✅ |

*Admins fetch leads but RLS limits visibility to own records.

---

## Layer 2 — NexusCore AI

### Mode 1: Message Draft Generator (Gemini Flash)

- **Input**: topic, tone (formal/casual/urgent/sales), recipient context
- **Output**: WhatsApp-ready message with `{{nombre}}`, `{{link_activacion}}` tokens
- **Rules**: Never replace static URLs; only use token variables when explicitly requested

### Mode 2: Strategic Advisor (Gemini Pro)

- **Input**: conversation history (ChatMessage[]), organization context string, optional RAG block
- **Model config**: `thinkingBudget: 2048` for complex multi-step reasoning
- **Memory**: Full conversation history passed as `contents[]` array — persistent within session
- **RAG**: When relevant knowledge base documents are found via semantic search, they are prepended to the system instruction as a high-priority block

### Mode 3: Semantic Search / RAG Pipeline (text-embedding-004)

```
User question
    ↓
generateEmbedding(question) → float[] vector
    ↓
Supabase vector similarity search (knowledge_base table)
    ↓
Top-K relevant documents retrieved
    ↓
Prepended to Strategic Advisor system instruction
    ↓
Gemini Pro generates grounded response
```

---

## Layer 3 — Edge Functions

All sensitive operations run server-side in Deno Edge Functions. Credentials never touch the browser.

| Function | Trigger | Responsibility |
|---|---|---|
| `whatsapp-inbound` | POST webhook (Meta) | Idempotency check, state machine, Stripe checkout |
| `whatsapp-sender` | Internal call | Outbound message dispatch with retry |
| `whatsapp-webhook` | GET (Meta verify) | Token verification, webhook activation |
| `whatsapp-templates` | Admin UI | Template sync with Meta |
| `whatsapp-healthcheck` | Admin UI | API connectivity validation |
| `create-checkout-session` | Web checkout | Stripe session creation (non-WhatsApp path) |
| `stripe-webhook` | POST (Stripe) | Payment reconciliation, order status update |
| `create-user` | Admin UI | Provision invited user with pre-authorized profile |
| `secure-playback` | University player | Signed URL generation for private video |
| `secure-upload` | University admin | Authenticated upload to private Supabase storage |

---

## Layer 4 — Data (Multi-Tenant)

### Tenant Isolation Model

Every user-facing table includes `organization_id`. RLS policies enforce:

```sql
-- Example: members table
CREATE POLICY "members_isolation"
ON members FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');
```

### Key Entities

```
Organization (tenant root)
  ├── profiles (users: super_master / admin / leader)
  ├── system_config (branding, WhatsApp mode, AI limits)
  ├── whatsapp_configs (phone_number_id, WABA_id, verify_token)
  ├── members (partner/community directory)
  ├── leads (private per leader, RLS by assigned_to)
  ├── chat_messages (AI advisor history)
  ├── knowledge_base (RAG documents with vector embeddings)
  ├── order_drafts (WhatsApp commerce transaction records)
  └── university_courses (E-learning content per org)
```

### Product Catalog Architecture

The `product_catalog_matrix_view` is a multi-market, multi-mode view combining:
- Base products (SKU, name, description)
- Market variants (MX / USA pricing, currency)
- Stripe price IDs per environment (test / live)
- Bot control flags: `bot_menu_enabled`, `bot_checkout_enabled`, `global_active`
- Threshold rules: `requires_human_review_above_qty`

This view is the single source of truth for the WhatsApp bot checkout flow.

---

## Security Architecture

```
Request → Edge Function (JWT / HMAC verification)
        → RLS (organization_id isolation)
        → Security Definer Functions (controlled view access)
        → Audit trail (whatsapp_inbound_logs, order_drafts)
```

Key principles:
- `SUPABASE_SERVICE_ROLE_KEY` only used in Edge Functions, never client-side
- WhatsApp tokens stored as Supabase Secrets, not in DB columns accessible via API
- Idempotency on all WhatsApp inbound events via `wamid` uniqueness check
- Demo account role escalation blocked at DB trigger level
